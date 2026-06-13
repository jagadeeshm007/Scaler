'use client';

import { CalendarClock, MoreHorizontal, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BookingActionMenuProps {
  onReschedule: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

export function BookingActionMenu({ onReschedule, onCancel, disabled }: BookingActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 shrink-0" disabled={disabled}>
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Booking actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={onReschedule}>
          <CalendarClock className="size-4" />
          Reschedule
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onCancel} className="text-red-500 focus:text-red-500">
          <XCircle className="size-4" />
          Cancel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
