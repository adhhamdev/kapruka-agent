import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import { SkipLink } from '@/components/layout/SkipLink';
import {
  createSiteMetadata,
  createSiteViewport,
} from '@/lib/site';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = createSiteMetadata();

export const viewport: Viewport = createSiteViewport();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={dmSans.variable}>
      <body
        className='antialiased bg-[color:var(--color-paper)] text-[color:var(--color-ink)] selection:bg-[color:var(--color-accent)]/25 selection:text-[color:var(--color-ink)] overflow-hidden touch-manipulation'
        suppressHydrationWarning>
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
