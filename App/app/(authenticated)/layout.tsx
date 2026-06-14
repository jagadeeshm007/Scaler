'use client';

import { useLayoutEffect } from 'react';

import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { MobileHeader } from '@/components/layout/mobile-header';
import { Sidebar } from '@/components/layout/sidebar';
import { BrandColorProvider } from '@/components/layout/brand-color-provider';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { useAuthStore } from '@/store/auth.store';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { hydrate, retryHydrate, isAuthenticated, isHydrating, hasHydrated } = useAuthStore();

  useLayoutEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!hasHydrated || isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader variant="grid" className="text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-sm text-muted-foreground">
          Could not connect to the app. Check your network and try again.
        </p>
        <Button
          type="button"
          variant="outline"
          className="border-border bg-card text-foreground hover:bg-accent"
          onClick={() => void retryHydrate()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <BrandColorProvider />
      <div className="flex min-h-screen bg-background">
        <Sidebar className="hidden shrink-0 md:flex" />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <MobileHeader />
          <main className="flex flex-1 flex-col overflow-y-auto bg-background p-3 md:p-4 lg:p-5">
            {children}
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </>
  );
}
