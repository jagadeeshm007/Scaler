'use client';

import {
  Clock,
  Send,
  MapPin,
  UserPlus,
  Video,
  Info,
  EyeOff,
  Flag,
  MoreHorizontal,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BookingActionMenuProps {
  onReschedule: () => void;
  onCancel: () => void;
  disabled?: boolean;
  trigger?: React.ReactNode;
}

export function BookingActionMenu({
  onReschedule,
  onCancel,
  disabled,
  trigger,
}: BookingActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="icon"
            className="size-8 shrink-0 border border-border/40 bg-secondary/40 text-foreground shadow-sm dark:shadow-[0_1px_8px_rgba(255,255,255,0.02)] backdrop-blur-sm transition-all hover:bg-secondary/80 hover:text-foreground"
            disabled={disabled}
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Booking actions</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Edit event
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={onReschedule}>
          <Clock className="mr-2 size-4" />
          Reschedule booking
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Send className="mr-2 size-4" />
          Request reschedule
        </DropdownMenuItem>
        <DropdownMenuItem>
          <MapPin className="mr-2 size-4" />
          Edit location
        </DropdownMenuItem>
        <DropdownMenuItem>
          <UserPlus className="mr-2 size-4" />
          Add guests
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          After event
        </DropdownMenuLabel>
        <DropdownMenuItem>
          <Video className="mr-2 size-4" />
          View recordings
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Info className="mr-2 size-4" />
          View session details
        </DropdownMenuItem>
        <DropdownMenuItem>
          <EyeOff className="mr-2 size-4" />
          Mark as no-show
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-red-500 focus:text-red-500">
          <Flag className="mr-2 size-4" />
          Report booking
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCancel} className="text-red-500 focus:text-red-500">
          <XCircle className="mr-2 size-4" />
          Cancel event
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
