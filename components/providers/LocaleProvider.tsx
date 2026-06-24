'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getMessages, type Messages } from '@/lib/i18n';
import { getStoredLocale, saveLocale } from '@/lib/locale-storage';
import { saveMemoryText } from '@/lib/memory-api';
import {
  getLocaleOption,
  type AppLocale,
} from '@/types/locale';

interface LocaleContextValue {
  locale: AppLocale;
  messages: Messages;
  isReady: boolean;
  setLocale: (locale: AppLocale, options?: { syncMemory?: boolean }) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function syncLanguageMemory(locale: AppLocale): void {
  const agentLanguage = getLocaleOption(locale).agentLanguage;
  void saveMemoryText(`Preferred language: ${agentLanguage}`);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = getStoredLocale();
    if (stored) {
      setLocaleState(stored);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    document.documentElement.lang = getLocaleOption(locale).htmlLang;
  }, [isReady, locale]);

  const setLocale = useCallback(
    (next: AppLocale, options?: { syncMemory?: boolean }) => {
      setLocaleState(next);
      saveLocale(next);
      if (options?.syncMemory !== false) {
        syncLanguageMemory(next);
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      locale,
      messages: getMessages(locale),
      isReady,
      setLocale,
    }),
    [locale, isReady, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}
