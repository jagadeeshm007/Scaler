'use client';

import { Search } from 'lucide-react';

import { AvatarFallback } from '@/components/shared/avatar-fallback';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

interface MobileHeaderProps {
  className?: string;
}

export function MobileHeader({ className }: MobileHeaderProps) {
  const user = useAuthStore((s) => s.user);

  const focusSearch = () => {
    const input = document.getElementById('event-type-search');
    input?.focus();
    input?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between px-4 md:hidden',
        className,
      )}
    >
      <span className="text-lg font-bold tracking-tight text-white">Scaler</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Search"
          onClick={focusSearch}
          className="text-neutral-400 transition-colors hover:text-white"
        >
          <Search className="size-5" />
        </button>
        {user && (
          <div className="relative">
            <AvatarFallback name={user.full_name} className="size-8" />
            <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-neutral-950 bg-green-500" />
          </div>
        )}
      </div>
    </header>
  );
}
