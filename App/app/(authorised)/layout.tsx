'use client';

import { useLayoutEffect } from 'react';

import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { MobileHeader } from '@/components/layout/mobile-header';
import { Sidebar } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';

export default function AuthorisedLayout({ children }: { children: React.ReactNode }) {
  const { hydrate, retryHydrate, isAuthenticated, isHydrating, hasHydrated } = useAuthStore();

  useLayoutEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!hasHydrated || isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="size-8 animate-pulse rounded-full bg-neutral-800" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 px-6 text-center">
        <p className="text-sm text-neutral-400">Could not connect to the app. Check your network and try again.</p>
        <Button
          type="button"
          variant="outline"
          className="border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800"
          onClick={() => void retryHydrate()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-950">
      <Sidebar className="hidden shrink-0 md:flex" />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <MobileHeader />
        <main className="flex flex-1 flex-col overflow-y-auto bg-neutral-950 p-3 md:p-4 lg:p-5">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
