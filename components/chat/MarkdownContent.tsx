'use client';

import { KaprukaLink } from '@/components/brand/KaprukaLink';
import { embedKaprukaLinks } from '@/lib/markdown/embed-kapruka-links';
import type { ChatRole } from '@/types/chat';
import { useMemo } from 'react';
import { Streamdown, type Components } from 'streamdown';

interface MarkdownContentProps {
  text: string;
  role?: ChatRole;
  isAnimating?: boolean;
}

function isTrustedKaprukaHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === 'kapruka.com' || host.endsWith('.kapruka.com');
  } catch {
    return false;
  }
}

export function MarkdownContent({
  text,
  role = 'assistant',
  isAnimating = false,
}: MarkdownContentProps) {
  const isUser = role === 'user';
  const linkVariant = isUser ? 'on-dark' : 'default';

  const markdown = useMemo(() => embedKaprukaLinks(text), [text]);

  const components = useMemo<Components>(
    () => ({
      a: ({ href, children }) => {
        if (href && isTrustedKaprukaHost(href)) {
          return <KaprukaLink variant={linkVariant}>{children}</KaprukaLink>;
        }
        return (
          <a
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            className={
              isUser
                ? 'text-white underline decoration-white/50 underline-offset-2 hover:decoration-white'
                : 'text-[color:var(--color-primary)] underline decoration-[color:var(--color-primary)]/40 underline-offset-2 hover:decoration-[color:var(--color-primary)]'
            }>
            {children}
          </a>
        );
      },
    }),
    [isUser, linkVariant],
  );

  if (!text.trim()) return null;

  return (
    <Streamdown
      mode={isAnimating ? 'streaming' : 'static'}
      isAnimating={isAnimating}
      controls={false}
      lineNumbers={false}
      linkSafety={{
        enabled: true,
        onLinkCheck: (url) => isTrustedKaprukaHost(url),
      }}
      className={`chat-markdown ${isUser ? 'chat-markdown--user' : 'chat-markdown--assistant'}`}
      components={components}>
      {markdown}
    </Streamdown>
  );
}
