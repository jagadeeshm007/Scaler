import { Inter } from 'next/font/google';

import { Toaster } from '@/components/ui/sonner';

import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'Scaler — Scheduling Platform',
  description: 'Cal.com clone scheduling platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} font-sans min-h-screen bg-neutral-950 text-white`}>
        <Providers>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
