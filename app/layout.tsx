import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const BRAND_PRIMARY = '#422B73';

export const metadata: Metadata = {
  title: 'Kapruka Agent — Ayla',
  description:
    'Your AI shopping concierge for Kapruka. Search gifts, cakes, flowers and more across Sri Lanka.',
  applicationName: 'Kapruka Agent',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Kapruka',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', sizes: '1024x1024', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '1024x1024', type: 'image/png' }],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: BRAND_PRIMARY },
    { media: '(prefers-color-scheme: dark)', color: BRAND_PRIMARY },
  ],
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={dmSans.variable}>
      <body
        className='antialiased bg-[color:var(--color-paper)] text-[color:var(--color-ink)] selection:bg-[color:var(--color-accent)]/25 selection:text-[color:var(--color-ink)] overflow-hidden'
        suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
