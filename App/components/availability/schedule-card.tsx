'use client';

import Link from 'next/link';
import { MoreHorizontal, Pencil, Star, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDayRange } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import type { Schedule } from '@/types';
import { cn } from '@/lib/utils';

interface ScheduleCardProps {
  schedule: Schedule;
  onDelete?: (schedule: Schedule) => void;
  className?: string;
}

function getScheduleSummary(schedule: Schedule): string {
  const active = schedule.availability.filter((a) => a.is_active);
  if (active.length === 0) return 'No availability set';

  const days = [...new Set(active.map((a) => a.day_of_week))].sort((a, b) => a - b);
  const first = active[0];
  if (!first) return 'No availability set';

  return formatDayRange(days, first.start_time, first.end_time);
}

export function ScheduleCard({ schedule, onDelete, className }: ScheduleCardProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-b border-border px-4 py-4 last:border-0',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={ROUTES.availabilityEdit(schedule.id)}
            className="truncate font-medium text-foreground hover:underline"
          >
            {schedule.name}
          </Link>
          {schedule.is_default ? (
            <Badge variant="secondary" className="shrink-0 gap-1">
              <Star className="size-3" />
              Default
            </Badge>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{getScheduleSummary(schedule)}</p>
        <p className="text-xs text-muted-foreground">{schedule.timezone.replace(/_/g, ' ')}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline" size="sm" className="border-border" asChild>
          <Link href={ROUTES.availabilityEdit(schedule.id)}>
            <Pencil className="size-3.5" />
            Edit
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Schedule actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-border bg-background">
            {!schedule.is_default && onDelete ? (
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onClick={() => onDelete(schedule)}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
