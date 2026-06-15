'use client';

import { Search } from 'lucide-react';

import { UserAvatarDropdown } from '@/components/layout/user-avatar-dropdown';
import { cn } from '@/lib/utils';

import type { UserDTO } from '@/lib/dto';
import { DEFAULT_BRAND_NAME } from '@/lib/brand-color';

interface MobileHeaderProps {
  className?: string;
  user: UserDTO | null;
}

export function MobileHeader({ className, user }: MobileHeaderProps) {
  const focusSearch = () => {
    const input = document.getElementById('event-type-search');
    input?.focus();
    input?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <header className={cn('flex h-14 items-center justify-between px-4 md:hidden', className)}>
      <span className="text-lg font-bold tracking-tight text-foreground">
        {user?.settings?.brand_name || DEFAULT_BRAND_NAME}
      </span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Search"
          onClick={focusSearch}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <Search className="size-5" />
        </button>
        <UserAvatarDropdown avatarClassName="size-8" user={user} />
      </div>
    </header>
  );
}
