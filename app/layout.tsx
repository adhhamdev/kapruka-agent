import type {Metadata} from 'next';
import { Inter, Libre_Baskerville } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const libreBaskerville = Libre_Baskerville({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'Ayla — Kapruka AI Shopping Agent',
  description: "Sri Lanka's most innovative AI shopping companion for the Kapruka Agent Challenge 2026.",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${libreBaskerville.variable}`}>
      <body className="antialiased text-[#1A1A1A] bg-[#FAF9F6] selection:bg-[#F27D26]/10 selection:text-[#F27D26]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

