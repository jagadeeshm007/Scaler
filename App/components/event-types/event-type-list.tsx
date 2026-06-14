'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, ShieldCheck, X } from 'lucide-react';
import Link from 'next/link';

import { EventTypeCard } from '@/components/event-types/event-type-card';
import { EventTypeSortableList } from '@/components/event-types/event-type-sortable-list';
import { EventTypeSearch } from '@/components/event-types/event-type-search';
import { EventTypeLinkIcon } from '@/components/event-types/event-type-ui';
import { PageSection, SURFACE } from '@/components/shared/page-section';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEventTypes } from '@/hooks/queries/use-event-types';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

export function EventTypeList() {
  const [query, setQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const { data, isLoading } = useEventTypes();
  const user = useAuthStore((s) => s.user);
  const username = user?.username ?? process.env.NEXT_PUBLIC_DEFAULT_USERNAME ?? '';

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter(
      (et) => et.title.toLowerCase().includes(q) || et.slug.toLowerCase().includes(q),
    );
  }, [data, query]);

  if (isLoading) {
    return (
      <PageSection className="flex min-h-full flex-1 flex-col pb-24 md:pb-6">
        <Skeleton className="hidden h-16 w-full shrink-0 rounded-none md:block" />
        <Skeleton className="mx-4 mt-4 h-10 w-[calc(100%-2rem)] shrink-0 rounded-md md:hidden" />
        <Skeleton className="mx-4 mt-4 mb-4 h-72 shrink-0 rounded-xl md:mx-6 md:mt-5 md:mb-6" />
      </PageSection>
    );
  }

  const hasQuery = query.trim().length > 0;
  const isEmpty = filtered.length === 0;

  return (
    <PageSection className="flex min-h-full flex-1 flex-col pb-24 md:pb-6">
      {/* Desktop: title + search + New — inside outer card */}
      <div className="hidden shrink-0 items-start justify-between gap-4 px-6 pt-6 pb-5 md:flex">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Event types</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Configure different events for people to book on your calendar.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-8 w-36 rounded-md border border-border bg-muted py-1.5 pr-7 pl-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-border focus:outline-none"
            />
            {hasQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery('')}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
          <Button asChild className="h-8 px-3 text-sm font-medium">
            <Link href={ROUTES.eventTypeNew}>
              <Plus className="size-3.5" />
              New
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile: search only — inside outer card */}
      <div className="shrink-0 px-4 pt-4 pb-3 md:hidden">
        <EventTypeSearch value={query} onChange={setQuery} />
      </div>

      {/* Inner list card — content height only; outer card fills the rest */}
      <div
        className={cn(
          'mx-4 mb-4 shrink-0 transition-all duration-300 ease-in-out md:mx-6 md:mb-6',
          isDragging
            ? 'overflow-visible rounded-none border-transparent bg-transparent p-2'
            : cn('overflow-hidden rounded-xl border', SURFACE.sectionBorder, SURFACE.innerList),
        )}
      >
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="mb-4 flex size-9 items-center justify-center rounded-md border border-border bg-muted">
              {hasQuery ? (
                <ShieldCheck className="size-4 text-muted-foreground" />
              ) : (
                <EventTypeLinkIcon className="size-4 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              {hasQuery ? `No result found for "${query.trim()}"` : 'No event types yet'}
            </h3>
            <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
              {hasQuery
                ? 'Event types let you share links that show availability and allow people to book meetings with you.'
                : 'Create your first event type to start accepting bookings.'}
            </p>
            {!hasQuery && (
              <Button asChild className="mt-5 h-8 px-4 text-sm font-medium">
                <Link href={ROUTES.eventTypeNew}>Create</Link>
              </Button>
            )}
          </div>
        ) : hasQuery ? (
          <div className="divide-y divide-border">
            {filtered.map((eventType) => (
              <EventTypeCard key={eventType.id} eventType={eventType} username={username} />
            ))}
          </div>
        ) : (
          <EventTypeSortableList
            items={filtered}
            username={username}
            onDragStateChange={setIsDragging}
          />
        )}
      </div>
    </PageSection>
  );
}
