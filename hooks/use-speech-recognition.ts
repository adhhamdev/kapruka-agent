'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type MicPermissionStatus,
  queryMicPermission,
  releaseMicStream,
  requestMicAccess,
} from '@/lib/microphone-permission';
import { speechErrorMessage } from '@/lib/speech';

export type VoiceState =
  | 'idle'
  | 'requesting-permission'
  | 'listening'
  | 'processing'
  | 'unsupported';

interface UseSpeechRecognitionOptions {
  languageCode: string;
  onResult: (transcript: string) => void;
  onError?: (message: string) => void;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function getSpeechRecognitionCtor():
  | (new () => SpeechRecognitionInstance)
  | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

function collectTranscript(event: SpeechRecognitionEventLike): string {
  const parts: string[] = [];
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const result = event.results[i];
    const text = result?.[0]?.transcript ?? '';
    if (text) parts.push(text);
  }
  return parts.join(' ').trim();
}

export function useSpeechRecognition({
  languageCode,
  onResult,
  onError,
}: UseSpeechRecognitionOptions) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [micPermission, setMicPermission] = useState<MicPermissionStatus>('unknown');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const languageCodeRef = useRef(languageCode);

  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
    languageCodeRef.current = languageCode;
  }, [onResult, onError, languageCode]);

  useEffect(() => {
    let cancelled = false;
    let permissionStatus: PermissionStatus | null = null;
    const syncPermission = () => {
      if (permissionStatus) {
        setMicPermission(permissionStatus.state as MicPermissionStatus);
      }
    };

    void queryMicPermission().then((status) => {
      if (!cancelled) setMicPermission(status);
    });

    if (navigator.permissions?.query) {
      void navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((status) => {
          permissionStatus = status;
          status.addEventListener('change', syncPermission);
        })
        .catch(() => undefined);
    }

    return () => {
      cancelled = true;
      permissionStatus?.removeEventListener('change', syncPermission);
    };
  }, []);

  useEffect(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setIsSupported(false);
      setVoiceState('unsupported');
      return;
    }

    setIsSupported(true);
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = languageCode;

    recognition.onresult = (event) => {
      const transcript = collectTranscript(event);
      if (transcript) {
        onResultRef.current(transcript);
      }
    };

    recognition.onerror = (event) => {
      const message = speechErrorMessage(event.error);
      if (message) {
        setVoiceError(message);
        onErrorRef.current?.(message);
      }
      releaseMicStream(micStreamRef.current);
      micStreamRef.current = null;
      setVoiceState('idle');
    };

    recognition.onend = () => {
      releaseMicStream(micStreamRef.current);
      micStreamRef.current = null;
      setVoiceState('idle');
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
      releaseMicStream(micStreamRef.current);
      micStreamRef.current = null;
    };
  }, [languageCode]);

  const startListening = useCallback(async () => {
    if (!isSupported) return;

    const recognition = recognitionRef.current;
    if (!recognition) return;

    setVoiceError(null);
    setVoiceState('requesting-permission');

    const access = await requestMicAccess();
    if (!access.granted) {
      setMicPermission('denied');
      const message = access.error ?? speechErrorMessage('not-allowed');
      setVoiceError(message);
      onErrorRef.current?.(message);
      setVoiceState('idle');
      return;
    }

    setMicPermission('granted');
    micStreamRef.current = access.stream ?? null;

    try {
      recognition.lang = languageCodeRef.current;
      setVoiceState('listening');
      recognition.start();
    } catch {
      releaseMicStream(micStreamRef.current);
      micStreamRef.current = null;
      setVoiceError('Voice input could not start. Please try again.');
      setVoiceState('idle');
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    setVoiceState('processing');
    recognition.stop();
    window.setTimeout(() => {
      releaseMicStream(micStreamRef.current);
      micStreamRef.current = null;
      setVoiceState('idle');
    }, 300);
  }, []);

  const clearVoiceError = useCallback(() => setVoiceError(null), []);

  const isListening = voiceState === 'listening';
  const isProcessing = voiceState === 'processing';
  const isRequestingPermission = voiceState === 'requesting-permission';

  return {
    voiceState,
    voiceError,
    micPermission,
    clearVoiceError,
    isListening,
    isProcessing,
    isRequestingPermission,
    isSupported: isSupported && voiceState !== 'unsupported',
    startListening,
    stopListening,
  };
};
