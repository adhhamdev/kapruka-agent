import type { Metadata } from 'next';
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_TITLE,
  ASSISTANT_NAME,
  BRAND_PRIMARY,
  PWA_DESCRIPTION,
} from '@/constants/brand';

/** Canonical site URL for metadata, sitemap, and OG tags. */
export function getSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return url.origin;
      }
    } catch {
      /* try next candidate */
    }
  }

  return 'http://localhost:3000';
}

export function createSiteMetadata(): Metadata {
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: APP_TITLE,
      template: `%s | ${APP_NAME}`,
    },
    description: APP_DESCRIPTION,
    applicationName: APP_NAME,
    keywords: [
      'Kapruka',
      'Sri Lanka',
      'gifts',
      'flowers',
      'cakes',
      'AI shopping',
      'online delivery',
    ],
    authors: [{ name: 'Kapruka' }],
    creator: 'Kapruka',
    publisher: 'Kapruka',
    category: 'shopping',
    openGraph: {
      type: 'website',
      locale: 'en_LK',
      url: siteUrl,
      siteName: APP_NAME,
      title: APP_TITLE,
      description: APP_DESCRIPTION,
    },
    twitter: {
      card: 'summary_large_image',
      title: APP_TITLE,
      description: APP_DESCRIPTION,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: APP_NAME,
    },
    icons: {
      icon: [{ url: '/kapruka-avatar.png', type: 'image/png' }],
      apple: [{ url: '/kapruka-avatar.png', type: 'image/png' }],
      shortcut: [{ url: '/kapruka-avatar.png', type: 'image/png' }],
    },
    formatDetection: {
      telephone: false,
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      'apple-mobile-web-app-title': APP_NAME,
    },
  };
}

export function createSiteViewport() {
  return {
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: BRAND_PRIMARY },
      { media: '(prefers-color-scheme: dark)', color: BRAND_PRIMARY },
    ],
    colorScheme: 'light' as const,
    width: 'device-width' as const,
    initialScale: 1,
    viewportFit: 'cover' as const,
  };
}

export { APP_DESCRIPTION, APP_NAME, APP_TITLE, ASSISTANT_NAME, PWA_DESCRIPTION };
