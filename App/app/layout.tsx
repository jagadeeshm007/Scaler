import { Inter, Geist_Mono } from 'next/font/google';

import '@/lib/env';
import { ThemeScript } from '@/components/layout/theme-script';
import { Toaster } from '@/components/ui/sonner';

import { Providers } from './providers';
import './globals.css';
import { cn } from '@/lib/utils';

const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

const interHeading = Inter({ subsets: ['latin'], variable: '--font-heading' });

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata = {
  title: 'calendar.eith.in — Scheduling Platform',
  description: 'Scheduling platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn('font-mono', interHeading.variable, geistMono.variable)}
    >
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${inter.variable} font-sans min-h-screen overflow-x-hidden bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
