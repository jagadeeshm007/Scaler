'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { BookingForm } from '@/components/booking-page/booking-form';
import type { PublicEventType, Slot } from '@/types';

interface BookingFormDialogProps {
  open: boolean;
  onClose: () => void;
  eventType: PublicEventType;
  slot: Slot;
  timezone: string;
}

export function BookingFormDialog({
  open,
  onClose,
  eventType,
  slot,
  timezone,
}: BookingFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-neutral-800 bg-neutral-900 p-0 sm:max-w-sm">
        <BookingForm
          eventType={eventType}
          slot={slot}
          timezone={timezone}
          onBack={onClose}
          className="w-full"
        />
      </DialogContent>
    </Dialog>
  );
}
