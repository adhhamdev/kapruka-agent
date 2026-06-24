'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { hasLocaleBeenSelected } from '@/lib/locale-storage';
import type { AppLocale } from '@/types/locale';

export function useLanguageModal() {
  const { isReady, setLocale } = useLocale();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!hasLocaleBeenSelected()) {
      setOpen(true);
    }
  }, [isReady]);

  const complete = (locale: AppLocale) => {
    setLocale(locale);
    setOpen(false);
  };

  return { open, complete };
}
