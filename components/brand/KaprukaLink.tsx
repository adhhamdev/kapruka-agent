import { KAPRUKA_BASE_URL } from '@/constants/urls';
import type { ReactNode } from 'react';

type KaprukaLinkVariant = 'default' | 'on-dark' | 'inherit';

const variantClass: Record<KaprukaLinkVariant, string> = {
  default:
    'text-[color:var(--color-primary)] underline decoration-[color:var(--color-primary)]/40 underline-offset-2 hover:decoration-[color:var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-1 rounded-sm',
  'on-dark':
    'text-white underline decoration-white/50 underline-offset-2 hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-primary)] rounded-sm',
  inherit: 'underline underline-offset-2 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-1 rounded-sm',
};

interface KaprukaLinkProps {
  children: ReactNode;
  className?: string;
  variant?: KaprukaLinkVariant;
  ariaLabel?: string;
}

export function KaprukaLink({
  children,
  className = '',
  variant = 'default',
  ariaLabel = 'Visit Kapruka.com',
}: KaprukaLinkProps) {
  return (
    <a
      href={KAPRUKA_BASE_URL}
      target='_blank'
      rel='noopener noreferrer'
      aria-label={ariaLabel}
      translate='no'
      className={`${variantClass[variant]} ${className}`.trim()}>
      {children}
    </a>
  );
}

const KAPRUKA_WORD = /(Kapruka)/gi;

export function linkKaprukaText(
  content: ReactNode,
  variant: KaprukaLinkVariant = 'default',
  keyPrefix = 'kapruka',
): ReactNode {
  if (content == null || typeof content === 'boolean') return content;

  if (typeof content === 'number') {
    return linkKaprukaText(String(content), variant, keyPrefix);
  }

  if (typeof content === 'string') {
    const parts = content.split(KAPRUKA_WORD);
    if (parts.length === 1) return content;

    return parts.map((part, index) => {
      if (part.toLowerCase() === 'kapruka') {
        return (
          <KaprukaLink key={`${keyPrefix}-${index}`} variant={variant}>
            {part}
          </KaprukaLink>
        );
      }
      return part;
    });
  }

  if (Array.isArray(content)) {
    return content.map((child, index) =>
      linkKaprukaText(child, variant, `${keyPrefix}-${index}`),
    );
  }

  return content;
}

interface KaprukaTextProps {
  children: string;
  variant?: KaprukaLinkVariant;
  className?: string;
  as?: 'span' | 'p';
}

export function KaprukaText({
  children,
  variant = 'default',
  className = '',
  as: Tag = 'span',
}: KaprukaTextProps) {
  return (
    <Tag className={className}>{linkKaprukaText(children, variant)}</Tag>
  );
}
