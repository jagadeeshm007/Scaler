'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCancelBooking } from '@/hooks/mutations/use-booking-mutations';
import { useTimezone } from '@/hooks/use-timezone';
import type { Booking } from '@/types';

interface CancelBookingDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelBookingDialog({ booking, open, onOpenChange }: CancelBookingDialogProps) {
  const [reason, setReason] = useState('');
  const cancelBooking = useCancelBooking();
  const { timezone } = useTimezone();

  const handleOpenChange = (next: boolean) => {
    if (!next) setReason('');
    onOpenChange(next);
  };

  const handleCancel = () => {
    if (!booking) return;
    cancelBooking.mutate(
      { id: booking.id, reason: reason.trim() || undefined, timezone },
      {
        onSuccess: () => {
          setReason('');
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-neutral-800 bg-neutral-950 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Cancel booking</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this booking with {booking?.guest_name}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="cancellation-reason">Reason for cancellation (optional)</Label>
          <Textarea
            id="cancellation-reason"
            placeholder="Let the guest know why you're cancelling..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="border-neutral-800 bg-neutral-900"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Keep booking
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelBooking.isPending}
          >
            {cancelBooking.isPending ? 'Cancelling...' : 'Cancel booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
