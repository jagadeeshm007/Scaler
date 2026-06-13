'use client';

import { useMemo, useState } from 'react';
import { Link2, Plus, Search, ShieldCheck, X } from 'lucide-react';
import Link from 'next/link';

import { EventTypeCard } from '@/components/event-types/event-type-card';
import { EventTypeSearch } from '@/components/event-types/event-type-search';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEventTypes } from '@/hooks/queries/use-event-types';
import { ROUTES } from '@/lib/routes';
import { useAuthStore } from '@/store/auth.store';

export function EventTypeList() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useEventTypes();
  const user = useAuthStore((s) => s.user);
  const username = user?.username ?? process.env.NEXT_PUBLIC_DEFAULT_USERNAME ?? '';

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter(
      (et) =>
        et.title.toLowerCase().includes(q) ||
        et.slug.toLowerCase().includes(q),
    );
  }, [data, query]);

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 pt-4 md:px-8 md:pt-8">
        <Skeleton className="hidden h-8 w-48 md:block" />
        <Skeleton className="h-10 w-full rounded-xl md:max-w-xs" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const hasQuery = query.trim().length > 0;
  const isEmpty = filtered.length === 0;

  return (
    <div className="px-4 pt-4 pb-28 md:px-8 md:pt-8 md:pb-8">
      {/* Desktop header */}
      <div className="mb-6 hidden md:block">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Event types</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Configure different events for people to book on your calendar.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-500" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="h-9 w-52 rounded-md border border-neutral-800 bg-neutral-900 py-2 pr-8 pl-9 text-sm text-white placeholder:text-neutral-500 focus:border-neutral-700 focus:outline-none"
              />
              {hasQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-neutral-500 hover:text-white"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <Button
              asChild
              className="h-9 rounded-md bg-white px-4 text-sm font-medium text-black hover:bg-neutral-200"
            >
              <Link href={ROUTES.eventTypeNew}>
                <Plus className="size-4" />
                New
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="mb-4 md:hidden">
        <EventTypeSearch value={query} onChange={setQuery} />
      </div>

      {isEmpty ? (
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900">
              {hasQuery ? (
                <ShieldCheck className="size-5 text-neutral-500" />
              ) : (
                <Link2 className="size-5 text-neutral-500" />
              )}
            </div>
            <h3 className="text-base font-semibold text-white">
              {hasQuery ? `No result found for "${query.trim()}"` : 'No event types yet'}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
              {hasQuery
                ? 'Event types let you share links that show availability on your calendar and allow people to book meetings with you.'
                : 'Create your first event type to start accepting bookings.'}
            </p>
            {!hasQuery && (
              <Button
                asChild
                className="mt-6 h-9 rounded-md bg-white px-5 text-sm font-medium text-black hover:bg-neutral-200"
              >
                <Link href={ROUTES.eventTypeNew}>Create</Link>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
          {filtered.map((eventType) => (
            <EventTypeCard key={eventType.id} eventType={eventType} username={username} />
          ))}
        </div>
      )}
    </div>
  );
}
