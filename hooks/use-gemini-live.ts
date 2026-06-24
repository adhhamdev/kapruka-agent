'use client';

import {
  GoogleGenAI,
  type FunctionResponse,
  type LiveServerMessage,
  type Session,
} from '@google/genai';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LIVE_MAX_HISTORY_TURNS,
  LIVE_RECONNECT_BASE_DELAY_MS,
  LIVE_RECONNECT_MAX_ATTEMPTS,
  LIVE_TOKEN_REFRESH_BEFORE_MS,
} from '@/constants/live';
import { mergeCartAfterAgentResponse } from '@/lib/cart/merge';
import {
  createAudioPlaybackQueue,
  createMicCapture,
  type MicCapture,
} from '@/lib/live/audio-utils';
import {
  appendLiveTranscript,
  appendLiveWidget,
  clearLiveTextStreamingState,
  createLiveAssistantMessage,
  createLiveUserMessage,
  finalizeLiveAssistantMessage,
  messagesToLiveHistorySummary,
  type LiveUiEventPayload,
} from '@/lib/live/live-message-bridge';
import { getOrCreateMemoryUserId } from '@/lib/memory-user-id';
import { getStoredLocale } from '@/lib/locale-storage';
import type { CartItem } from '@/lib/cart-storage';
import type { KaprukaAgentUIMessage } from '@/types/agent-ui-message';
import type { AppLocale } from '@/types/locale';

export type LiveConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

interface LiveTokenResponse {
  token: string;
  liveSessionId: string;
  model: string;
  expiresAt: string;
}

interface LiveToolsResponse {
  functionResponses: Array<{
    id: string;
    name: string;
    response: Record<string, unknown>;
  }>;
  uiEvents: LiveUiEventPayload[];
  cart: CartItem[];
  openBasket?: boolean;
  localeChange?: AppLocale;
}

interface UseGeminiLiveOptions {
  cart: CartItem[];
  setCart: (updater: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void;
  messages: KaprukaAgentUIMessage[];
  setMessages: React.Dispatch<React.SetStateAction<KaprukaAgentUIMessage[]>>;
  onOpenBasket?: () => void;
  onLocaleChange?: (locale: AppLocale) => void;
  getPreferredLanguage?: () => AppLocale | undefined;
}

export function useGeminiLive({
  cart,
  setCart,
  messages,
  setMessages,
  onOpenBasket,
  onLocaleChange,
  getPreferredLanguage,
}: UseGeminiLiveOptions) {
  const [liveState, setLiveState] = useState<LiveConnectionState>('idle');
  const [liveError, setLiveError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const sessionRef = useRef<Session | null>(null);
  const playbackRef = useRef(createAudioPlaybackQueue());
  const micRef = useRef<MicCapture | null>(null);
  const resumptionHandleRef = useRef<string | undefined>(undefined);
  const liveSessionIdRef = useRef<string | null>(null);
  const tokenExpiresAtRef = useRef<number>(0);
  const reconnectAttemptsRef = useRef(0);
  const intentionalCloseRef = useRef(false);
  const cartRef = useRef(cart);
  const cartAtToolStartRef = useRef<CartItem[]>([]);
  const messagesRef = useRef(messages);
  const currentAssistantIdRef = useRef<string | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const tokenModelRef = useRef<string>('gemini-3.1-flash-live-preview');
  const tokenValueRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<number | null>(null);

  cartRef.current = cart;
  messagesRef.current = messages;

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current !== null) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const stopMic = useCallback(() => {
    micRef.current?.stop();
    micRef.current = null;
    setIsListening(false);
  }, []);

  const cleanupSession = useCallback(
    async (notifyServer = true) => {
      clearRefreshTimer();
      stopMic();
      playbackRef.current.stopAll();
      intentionalCloseRef.current = true;
      sessionRef.current?.close();
      sessionRef.current = null;

      if (notifyServer && liveSessionIdRef.current) {
        try {
          await fetch('/api/live/session', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ liveSessionId: liveSessionIdRef.current }),
          });
        } catch {
          /* best effort */
        }
      }

      liveSessionIdRef.current = null;
      tokenValueRef.current = null;
      currentAssistantIdRef.current = null;
      currentUserIdRef.current = null;
    },
    [clearRefreshTimer, stopMic],
  );

  const ensureAssistantMessage = useCallback(() => {
    if (currentAssistantIdRef.current) return currentAssistantIdRef.current;

    const liveSessionId = liveSessionIdRef.current ?? 'live';
    const message = createLiveAssistantMessage(liveSessionId);
    currentAssistantIdRef.current = message.id;
    setMessages((prev) => [...prev, message]);
    return message.id;
  }, [setMessages]);

  const ensureUserMessage = useCallback(() => {
    if (currentUserIdRef.current) return currentUserIdRef.current;

    const message = createLiveUserMessage('');
    currentUserIdRef.current = message.id;
    setMessages((prev) => [...prev, message]);
    return message.id;
  }, [setMessages]);

  const updateMessageById = useCallback(
    (
      messageId: string,
      updater: (message: KaprukaAgentUIMessage) => KaprukaAgentUIMessage,
    ) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId ? updater(message) : message,
        ),
      );
    },
    [setMessages],
  );

  const handleToolCall = useCallback(
    async (message: LiveServerMessage) => {
      const functionCalls = message.toolCall?.functionCalls;
      if (!functionCalls?.length || !liveSessionIdRef.current) return;

      cartAtToolStartRef.current = [...cartRef.current];

      const preferredLanguage =
        getPreferredLanguage?.() ?? getStoredLocale() ?? undefined;

      const response = await fetch('/api/live/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          liveSessionId: liveSessionIdRef.current,
          functionCalls: functionCalls.map((call) => ({
            id: call.id,
            name: call.name,
            args: call.args ?? {},
          })),
          cart: cartRef.current,
          memoryUserId: getOrCreateMemoryUserId(),
          ...(preferredLanguage ? { preferredLanguage } : {}),
        }),
      });

      if (!response.ok) {
        throw new Error('Live tool execution failed');
      }

      const data = (await response.json()) as LiveToolsResponse;
      setCart((currentCart) =>
        mergeCartAfterAgentResponse(
          cartAtToolStartRef.current,
          currentCart,
          data.cart,
        ),
      );

      if (data.openBasket) {
        onOpenBasket?.();
      }
      if (data.localeChange) {
        onLocaleChange?.(data.localeChange);
      }

      const assistantId = ensureAssistantMessage();
      if (data.uiEvents.length > 0) {
        updateMessageById(assistantId, (existing) =>
          data.uiEvents.reduce(
            (acc, event) => appendLiveWidget(acc, event),
            existing,
          ),
        );
      }

      updateMessageById(assistantId, (existing) =>
        finalizeLiveAssistantMessage(existing, {
          cart: data.cart,
          openBasket: data.openBasket,
          localeChange: data.localeChange,
        }),
      );

      const functionResponses: FunctionResponse[] = data.functionResponses.map(
        (item) => ({
          id: item.id,
          name: item.name,
          response: item.response,
        }),
      );

      sessionRef.current?.sendToolResponse({ functionResponses });
    },
    [
      ensureAssistantMessage,
      getPreferredLanguage,
      onLocaleChange,
      onOpenBasket,
      setCart,
      updateMessageById,
    ],
  );

  const handleServerMessage = useCallback(
    async (message: LiveServerMessage) => {
      if (message.sessionResumptionUpdate?.newHandle) {
        resumptionHandleRef.current = message.sessionResumptionUpdate.newHandle;
      }

      if (message.setupComplete) {
        setLiveState('connected');
        reconnectAttemptsRef.current = 0;

        const historySummary = messagesToLiveHistorySummary(
          messagesRef.current,
          LIVE_MAX_HISTORY_TURNS,
        );
        if (sessionRef.current) {
          const greetingPrompt = historySummary
            ? `Here is our recent chat history for context:\n${historySummary}\n\nPlease welcome the user back or greet them warmly to let them know the live voice connection is active, and ask how you can help them continue.`
            : `Please greet the user warmly and introduce yourself as the Kapruka shopping assistant to let them know the live voice session is active, and ask how you can help them find gifts today.`;

          sessionRef.current.sendClientContent({
            turns: [
              {
                role: 'user',
                parts: [
                  {
                    text: greetingPrompt,
                  },
                ],
              },
            ],
            turnComplete: true,
          });
        }

        try {
          micRef.current = createMicCapture((base64Pcm) => {
            sessionRef.current?.sendRealtimeInput({
              audio: {
                data: base64Pcm,
                mimeType: 'audio/pcm;rate=16000',
              },
            });
          });
          await micRef.current.start();
          setIsListening(true);
        } catch {
          setLiveError('Microphone access is required for live voice.');
        }
        return;
      }

      if (message.toolCall?.functionCalls?.length) {
        try {
          await handleToolCall(message);
        } catch (error) {
          console.error('[Live] Tool call failed:', error);
          setLiveError('Something went wrong running a shopping action.');
        }
        return;
      }

      const content = message.serverContent;
      if (!content) return;

      if (content.interrupted) {
        playbackRef.current.stopAll();
        return;
      }

      if (content.outputTranscription?.text) {
        const assistantId = ensureAssistantMessage();
        updateMessageById(assistantId, (existing) =>
          appendLiveTranscript(
            existing,
            'assistant',
            content.outputTranscription!.text!,
          ),
        );
      }

      if (content.modelTurn?.parts) {
        for (const part of content.modelTurn.parts) {
          if (part.inlineData?.data) {
            void playbackRef.current.resume();
            playbackRef.current.enqueuePcm16Base64(part.inlineData.data);
          }
        }
      }

      if (content.turnComplete) {
        const idsToFinalize = [
          currentUserIdRef.current,
          currentAssistantIdRef.current,
        ].filter((id): id is string => Boolean(id));

        for (const messageId of idsToFinalize) {
          updateMessageById(messageId, clearLiveTextStreamingState);
        }

        currentUserIdRef.current = null;
        currentAssistantIdRef.current = null;
      }
    },
    [ensureAssistantMessage, ensureUserMessage, handleToolCall, updateMessageById],
  );

  const scheduleTokenRefresh = useCallback(
    (expiresAtIso: string, connectFn: () => Promise<void>) => {
      clearRefreshTimer();
      const expiresAt = new Date(expiresAtIso).getTime();
      tokenExpiresAtRef.current = expiresAt;
      const delay = Math.max(
        5_000,
        expiresAt - Date.now() - LIVE_TOKEN_REFRESH_BEFORE_MS,
      );

      refreshTimerRef.current = window.setTimeout(() => {
        void connectFn();
      }, delay);
    },
    [clearRefreshTimer],
  );

  const fetchToken = useCallback(async (): Promise<LiveTokenResponse> => {
    const preferredLanguage =
      getPreferredLanguage?.() ?? getStoredLocale() ?? undefined;

    const response = await fetch('/api/live/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cart: cartRef.current,
        memoryUserId: getOrCreateMemoryUserId(),
        ...(liveSessionIdRef.current
          ? { liveSessionId: liveSessionIdRef.current }
          : {}),
        ...(preferredLanguage ? { preferredLanguage } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to start live voice session');
    }

    return response.json() as Promise<LiveTokenResponse>;
  }, [getPreferredLanguage]);

  const connectLive = useCallback(
    async (options?: { isTokenRefresh?: boolean }) => {
      setLiveError(null);
      setLiveState((state) =>
        state === 'connected' ? 'reconnecting' : 'connecting',
      );

      try {
        const tokenPayload = await fetchToken();
        if (!liveSessionIdRef.current) {
          liveSessionIdRef.current = tokenPayload.liveSessionId;
        }
        tokenValueRef.current = tokenPayload.token;
        tokenModelRef.current = tokenPayload.model;

        const ai = new GoogleGenAI({
          apiKey: tokenPayload.token,
          httpOptions: { apiVersion: 'v1alpha' },
        });

        intentionalCloseRef.current = false;

        if (options?.isTokenRefresh) {
          intentionalCloseRef.current = true;
          sessionRef.current?.close();
          sessionRef.current = null;
          intentionalCloseRef.current = false;
        }

        const session = await ai.live.connect({
          model: tokenPayload.model,
          callbacks: {
            onopen: () => {
              setLiveState('connected');
            },
            onmessage: (event) => {
              void handleServerMessage(event);
            },
            onerror: () => {
              if (!intentionalCloseRef.current) {
                setLiveError('Live voice connection error.');
              }
            },
            onclose: () => {
              stopMic();
              if (intentionalCloseRef.current) {
                setLiveState('idle');
                return;
              }

              if (reconnectAttemptsRef.current < LIVE_RECONNECT_MAX_ATTEMPTS) {
                reconnectAttemptsRef.current += 1;
                setLiveState('reconnecting');
                const delay =
                  LIVE_RECONNECT_BASE_DELAY_MS *
                  2 ** (reconnectAttemptsRef.current - 1);
                window.setTimeout(() => {
                  void connectLive();
                }, delay);
              } else {
                setLiveState('error');
                setLiveError('Live voice disconnected. Tap to try again.');
              }
            },
          },
          config: {
            sessionResumption: resumptionHandleRef.current
              ? { handle: resumptionHandleRef.current }
              : undefined,
          },
        });

        sessionRef.current = session;
        scheduleTokenRefresh(tokenPayload.expiresAt, () =>
          connectLive({ isTokenRefresh: true }),
        );
      } catch (error) {
        console.error('[Live] Connect failed:', error);
        setLiveState('error');
        setLiveError(
          error instanceof Error
            ? error.message
            : 'Could not connect to live voice.',
        );
      }
    },
    [fetchToken, handleServerMessage, scheduleTokenRefresh, stopMic],
  );

  const startLive = useCallback(async () => {
    if (liveState === 'connecting' || liveState === 'connected') return;
    reconnectAttemptsRef.current = 0;
    await connectLive();
  }, [connectLive, liveState]);

  const stopLive = useCallback(async () => {
    await cleanupSession(true);
    playbackRef.current.close();
    playbackRef.current = createAudioPlaybackQueue();
    setLiveState('idle');
    setLiveError(null);
  }, [cleanupSession]);

  const sendLiveText = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !sessionRef.current) return;

    const userMessage = createLiveUserMessage(trimmed);
    currentUserIdRef.current = userMessage.id;
    setMessages((prev) => [...prev, userMessage]);

    sessionRef.current.sendRealtimeInput({ text: trimmed });
  }, [setMessages]);

  useEffect(() => {
    return () => {
      void cleanupSession(false);
      playbackRef.current.close();
    };
  }, [cleanupSession]);

  const isLiveActive =
    liveState === 'connected' ||
    liveState === 'connecting' ||
    liveState === 'reconnecting';

  return {
    liveState,
    liveError,
    isLiveActive,
    isListening,
    startLive,
    stopLive,
    sendLiveText,
    clearLiveError: () => setLiveError(null),
  };
}
