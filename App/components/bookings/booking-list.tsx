'use client';

import { CalendarX2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { BookingCard } from '@/components/bookings/booking-card';
import { BookingDetailPanel } from '@/components/bookings/booking-detail-panel';
import { BookingFilters, useBookingFilter } from '@/components/bookings/booking-filters';
import { CancelBookingDialog } from '@/components/bookings/cancel-booking-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { PageShell } from '@/components/layout/page-shell';
import { TableSkeleton } from '@/components/shared/skeletons/table-skeleton';
import { SURFACE } from '@/components/shared/page-section';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBookings } from '@/hooks/queries/use-bookings';
import { useTimezone } from '@/hooks/use-timezone';
import { filterBookingsByTab } from '@/lib/booking-utils';
import type { BookingStatusTab } from '@/lib/constants';
import type { Booking } from '@/types';
import { cn } from '@/lib/utils';

const EMPTY_MESSAGES: Record<BookingStatusTab, { title: string; description: string }> = {
  upcoming: {
    title: 'No upcoming bookings',
    description: 'When someone books a meeting with you, it will appear here.',
  },
  unconfirmed: {
    title: 'No unconfirmed bookings',
    description: 'Bookings awaiting your confirmation will show up here.',
  },
  recurring: {
    title: 'No recurring bookings',
    description: 'Recurring meeting series will appear here when scheduled.',
  },
  past: {
    title: 'No past bookings',
    description: 'Your completed meetings will be listed here.',
  },
  cancelled: {
    title: 'No cancelled bookings',
    description: 'Cancelled meetings will appear here.',
  },
};

export function BookingList() {
  const [status] = useBookingFilter();
  const { timezone } = useTimezone();
  const { data: bookings, isLoading, isError } = useBookings();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset pagination when status changes using derived state pattern
  const [prevStatus, setPrevStatus] = useState(status);
  if (status !== prevStatus) {
    setPrevStatus(status);
    setCurrentPage(1);
  }

  const filtered = useMemo(() => filterBookingsByTab(bookings ?? [], status), [bookings, status]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedBookings = useMemo(() => {
    return filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filtered, currentPage, pageSize]);

  const selectedIndex = selectedBooking
    ? filtered.findIndex((b) => b.id === selectedBooking.id)
    : -1;
  const canPrevious = selectedIndex > 0;
  const canNext = selectedIndex >= 0 && selectedIndex < filtered.length - 1;

  const handlePrevious = () => {
    if (canPrevious) {
      const newIndex = selectedIndex - 1;
      setSelectedBooking(filtered[newIndex] ?? null);
      setCurrentPage(Math.floor(newIndex / pageSize) + 1);
    }
  };

  const handleNext = () => {
    if (canNext) {
      const newIndex = selectedIndex + 1;
      setSelectedBooking(filtered[newIndex] ?? null);
      setCurrentPage(Math.floor(newIndex / pageSize) + 1);
    }
  };

  if (isLoading) {
    return (
      <PageShell
        title="Bookings"
        description="See upcoming and past events booked through your event types."
      >
        <div className="mx-4 mb-4 md:mx-6 md:mb-6">
          <TableSkeleton rows={6} />
        </div>
      </PageShell>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="Failed to load bookings"
        description="Something went wrong while fetching your bookings."
      />
    );
  }

  const empty = EMPTY_MESSAGES[status];

  return (
    <PageShell
      title="Bookings"
      description="See upcoming and past events booked through your event types."
    >
      {/* Top Menu Row */}
      <div className="mb-4 flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between md:mb-6 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <BookingFilters className="min-w-0 shrink" />
          <Button
            variant="outline"
            size="sm"
            className="hidden h-[34px] shrink-0 gap-2 rounded-lg px-3 text-xs font-medium text-foreground sm:flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5"
            >
              <line x1="21" x2="14" y1="4" y2="4" />
              <line x1="10" x2="3" y1="4" y2="4" />
              <line x1="21" x2="12" y1="12" y2="12" />
              <line x1="8" x2="3" y1="12" y2="12" />
              <line x1="21" x2="16" y1="20" y2="20" />
              <line x1="12" x2="3" y1="20" y2="20" />
              <line x1="14" x2="14" y1="2" y2="6" />
              <line x1="8" x2="8" y1="10" y2="14" />
              <line x1="16" x2="16" y1="18" y2="22" />
            </svg>
            Filter
          </Button>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Mobile Filter Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-[34px] gap-2 rounded-lg px-3 text-xs font-medium text-foreground sm:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5"
            >
              <line x1="21" x2="14" y1="4" y2="4" />
              <line x1="10" x2="3" y1="4" y2="4" />
              <line x1="21" x2="12" y1="12" y2="12" />
              <line x1="8" x2="3" y1="12" y2="12" />
              <line x1="21" x2="16" y1="20" y2="20" />
              <line x1="12" x2="3" y1="20" y2="20" />
              <line x1="14" x2="14" y1="2" y2="6" />
              <line x1="8" x2="8" y1="10" y2="14" />
              <line x1="16" x2="16" y1="18" y2="22" />
            </svg>
            Filter
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-[34px] gap-2 rounded-lg px-3 text-xs font-medium text-muted-foreground"
          >
            Saved filters
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </Button>

          {/* View Toggles */}
          <div className="hidden items-center rounded-md border border-border sm:flex">
            <Button
              variant="ghost"
              size="icon"
              className="size-[32px] rounded-none rounded-l-[5px] bg-muted hover:bg-muted text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <line x1="8" x2="21" y1="6" y2="6" />
                <line x1="8" x2="21" y1="12" y2="12" />
                <line x1="8" x2="21" y1="18" y2="18" />
                <line x1="3" x2="3.01" y1="6" y2="6" />
                <line x1="3" x2="3.01" y1="12" y2="12" />
                <line x1="3" x2="3.01" y1="18" y2="18" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-[32px] rounded-none rounded-r-[5px] text-muted-foreground hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'mx-4 mb-4 shrink-0 overflow-hidden rounded-xl border transition-all duration-300 ease-in-out md:mx-6 md:mb-6',
          SURFACE.sectionBorder,
          SURFACE.innerList,
        )}
      >
        {!filtered.length ? (
          <EmptyState icon={CalendarX2} title={empty.title} description={empty.description} />
        ) : (
          <div className="flex flex-col">
            {status === 'upcoming' && (
              <div className="border-b border-border bg-card px-5 py-3 text-sm font-medium text-muted-foreground">
                Next
              </div>
            )}
            {paginatedBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                timezone={timezone}
                isSelected={selectedBooking?.id === booking.id && detailOpen}
                onSelect={(b) => {
                  setSelectedBooking(b);
                  setDetailOpen(true);
                }}
                onReschedule={() => {
                  // Reschedule flow wired in a future phase
                }}
                onCancel={(b) => {
                  setCancelTarget(b);
                  setCancelOpen(true);
                }}
              />
            ))}
            {/* Pagination Footer Placeholder */}
            <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3 text-sm text-muted-foreground sm:px-6">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs outline-none hover:bg-accent/50 focus:ring-2 focus:ring-ring">
                    {pageSize}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-3"
                    >
                      <path d="m7 15 5 5 5-5" />
                      <path d="m7 9 5-5 5 5" />
                    </svg>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[80px]">
                    {[10, 20, 50, 100].map((size) => (
                      <DropdownMenuItem
                        key={size}
                        onClick={() => {
                          setPageSize(size);
                          setCurrentPage(1);
                        }}
                        className={pageSize === size ? 'bg-accent font-medium' : ''}
                      >
                        {size}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <span className="hidden sm:inline">rows per page</span>
              </div>
              <div className="flex items-center gap-4">
                <span>
                  {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7 rounded-md"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7 rounded-md"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <BookingDetailPanel
        booking={selectedBooking}
        timezone={timezone}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onPrevious={handlePrevious}
        onNext={handleNext}
        canPrevious={canPrevious}
        canNext={canNext}
        onReschedule={() => {
          // Reschedule flow wired in a future phase
        }}
        onCancel={(b: Booking) => {
          setCancelTarget(b);
          setCancelOpen(true);
        }}
      />

      <CancelBookingDialog booking={cancelTarget} open={cancelOpen} onOpenChange={setCancelOpen} />
    </PageShell>
  );
}
