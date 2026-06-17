'use client';

import { useCallback, useEffect, useState } from 'react';
import { attachmentImageDataUrl } from '@/lib/attachments';
import { WIDGET_ONLY_FALLBACK } from '@/constants/languages';
import { WELCOME_MESSAGE } from '@/constants/prompts';
import type { CartItem } from '@/lib/cart-storage';
import { ERROR_MESSAGES, parseApiError } from '@/lib/errors';
import { createMessageId } from '@/lib/message-ids';
import type { ChatAttachment } from '@/types/attachments';
import type { ActiveTab, Message } from '@/types/chat';

interface UseChatOptions {
  cart: CartItem[];
  setCart: (updater: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void;
}

function toAttachmentPayload(attachments: ChatAttachment[]) {
  return attachments.map(({ name, mimeType, kind, data }) => ({
    name,
    mimeType,
    kind,
    data,
  }));
}

export function useChat({ cart, setCart }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');

  useEffect(() => {
    if (!hasInitialized) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: WELCOME_MESSAGE,
          timestamp: new Date(0),
        },
      ]);
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  const sendMessage = useCallback(
    async (
      textToSend: string,
      attachments: ChatAttachment[] = [],
    ) => {
      if ((!textToSend.trim() && attachments.length === 0) || isPending) return;

      const attachmentPayload = toAttachmentPayload(attachments);
      const attachmentPreviews = Object.fromEntries(
        attachments
          .filter((a) => a.kind === 'image')
          .map((a) => [a.name, attachmentImageDataUrl(a)]),
      );

      const displayContent =
        textToSend.trim() ||
        (attachments.length === 1
          ? `Sent ${attachments[0].name}`
          : `Sent ${attachments.length} attachments`);

      const userMessage: Message = {
        id: createMessageId('user'),
        role: 'user',
        content: displayContent,
        attachments: attachmentPayload.length ? attachmentPayload : undefined,
        attachmentPreviews:
          Object.keys(attachmentPreviews).length > 0
            ? attachmentPreviews
            : undefined,
        timestamp: new Date(0),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputText('');
      setIsPending(true);
      setActiveTab('chat');

      try {
        const chatHistory = messages.map((m) => ({
          role: m.role,
          content: m.content,
          attachments: m.attachments,
        }));
        chatHistory.push({
          role: 'user',
          content: textToSend.trim() || displayContent,
          attachments: attachmentPayload.length ? attachmentPayload : undefined,
        });

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: chatHistory,
            cart,
          }),
        });

        if (!response.ok) {
          const friendly = await parseApiError(response);
          throw new Error(friendly);
        }

        const data = await response.json();

        const hasWidgets = Array.isArray(data?.widgets) && data.widgets.length > 0;
        const responseText =
          typeof data?.text === 'string' ? data.text.trim() : '';

        if (!responseText && !hasWidgets) {
          throw new Error(ERROR_MESSAGES.GENERIC);
        }

        if (data.cart) {
          setCart(data.cart);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: createMessageId('assistant'),
            role: 'assistant',
            content: responseText || WIDGET_ONLY_FALLBACK,
            widgets: data.widgets,
            timestamp: new Date(0),
          },
        ]);
      } catch (error: unknown) {
        const friendly =
          error instanceof Error && error.message
            ? error.message
            : ERROR_MESSAGES.GENERIC;
        setMessages((prev) => [
          ...prev,
          {
            id: createMessageId('error'),
            role: 'assistant',
            content: friendly,
            isError: true,
            timestamp: new Date(0),
          },
        ]);
      } finally {
        setIsPending(false);
      }
    },
    [cart, isPending, messages, setCart],
  );

  const sendFromComposer = useCallback(
    (text: string, attachments: ChatAttachment[]) => {
      void sendMessage(text, attachments);
    },
    [sendMessage],
  );

  const appendMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  return {
    messages,
    inputText,
    setInputText,
    isPending,
    activeTab,
    setActiveTab,
    sendMessage,
    sendFromComposer,
    appendMessage,
  };
}
