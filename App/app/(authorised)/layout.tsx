'use client';

import { useEffect } from 'react';

import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { MobileHeader } from '@/components/layout/mobile-header';
import { Sidebar } from '@/components/layout/sidebar';
import { useAuthStore } from '@/store/auth.store';

export default function AuthorisedLayout({ children }: { children: React.ReactNode }) {
  const { hydrate, isAuthenticated, isHydrating } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) void hydrate();
  }, [hydrate, isAuthenticated]);

  if (!isAuthenticated && isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="size-8 animate-pulse rounded-full bg-neutral-800" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-950">
      {/* md–lg: collapsed icon rail · lg+: full sidebar · <md: hidden */}
      <Sidebar className="hidden shrink-0 md:flex" />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Mobile only (< md) */}
        <MobileHeader />
        <main className="flex-1 overflow-y-auto bg-neutral-950 p-3 md:p-4 lg:p-5">{children}</main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
