import type { MetadataRoute } from 'next';
import {
  APP_TITLE,
  BRAND_PRIMARY,
  PWA_DESCRIPTION,
} from '@/constants/brand';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_TITLE,
    short_name: 'Kapruka',
    description: PWA_DESCRIPTION,
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
