'use client';

import { useLocale } from '@/components/providers/LocaleProvider';

export function SkipLink() {
  const { messages } = useLocale();

  return (
    <a
      href='#chat-surface'
      className='sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-[var(--radius-md)] focus:bg-[color:var(--color-primary)] focus:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-primary)]'>
      {messages.skipLink}
    </a>
  );
}
