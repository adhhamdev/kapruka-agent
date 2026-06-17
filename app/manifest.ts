import type { MetadataRoute } from 'next';

const BRAND_PRIMARY = '#422B73';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kapruka Agent — Ayla',
    short_name: 'Kapruka',
    description:
      'AI shopping concierge for Kapruka. Search gifts, manage your basket, and checkout.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: BRAND_PRIMARY,
    theme_color: BRAND_PRIMARY,
    categories: ['shopping', 'lifestyle'],
    icons: [
      {
        src: '/icon.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-icon.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
    ],
  };
}
