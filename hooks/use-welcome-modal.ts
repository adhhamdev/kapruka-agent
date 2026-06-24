'use client';

import { hasWelcomeBeenDismissed, markWelcomeDismissed } from '@/lib/welcome-storage';
import { hasLocaleBeenSelected } from '@/lib/locale-storage';
import { useCallback, useEffect, useState } from 'react';

export function useWelcomeModal(localeReady: boolean) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localeReady) return;
    if (!hasLocaleBeenSelected()) return;
    if (!hasWelcomeBeenDismissed()) {
      setOpen(true);
    }
  }, [localeReady]);

  const dismiss = useCallback(() => {
    markWelcomeDismissed();
    setOpen(false);
  }, []);

  return { open, dismiss };
}
