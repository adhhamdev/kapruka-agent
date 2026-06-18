'use client';

import { hasWelcomeBeenDismissed, markWelcomeDismissed } from '@/lib/welcome-storage';
import { useCallback, useEffect, useState } from 'react';

export function useWelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasWelcomeBeenDismissed()) {
      setOpen(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    markWelcomeDismissed();
    setOpen(false);
  }, []);

  return { open, dismiss };
}
