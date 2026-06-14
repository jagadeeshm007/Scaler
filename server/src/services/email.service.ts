import type { Booking, EventType, User } from '@prisma/client';
import { formatInTimeZone } from 'date-fns-tz';

import { sendEmail } from '../lib/mailer';
import { compileTemplate } from '../lib/templates';

type BookingWithRelations = Booking & {
  event_type: EventType;
  host: User;
};

function formatBookingDateTime(date: Date, timezone: string): string {
  const day = formatInTimeZone(date, timezone, 'EEEE, MMMM d, yyyy');
  const time = formatInTimeZone(date, timezone, 'h:mm a');
  return `${day} at ${time} (${timezone})`;
}

function formatTimeRange(start: Date, end: Date, timezone: string): string {
  const day = formatInTimeZone(start, timezone, 'EEEE, MMMM d, yyyy');
  const startTime = formatInTimeZone(start, timezone, 'h:mm a');
  const endTime = formatInTimeZone(end, timezone, 'h:mm a');
  return `${day}, ${startTime} – ${endTime} (${timezone})`;
}

export class EmailService {
  static async sendBookingConfirmation(
    booking: BookingWithRelations,
    timezone: string,
  ): Promise<void> {
    const startTime = formatTimeRange(booking.start_time, booking.end_time, timezone);

    const baseData = {
      eventTitle: booking.event_type.title,
      bookerName: booking.guest_name,
      hostName: booking.host.full_name,
      startTime,
      duration: booking.event_type.duration_mins,
      locationDisplay: booking.event_type.location_type.replace(/_/g, ' '),
      meetingUrl: booking.meeting_url,
    };

    const guestHtml = compileTemplate('bookingConfirmed', {
      ...baseData,
      recipientName: booking.guest_name,
    });
    const hostHtml = compileTemplate('bookingConfirmed', {
      ...baseData,
      recipientName: booking.host.full_name,
    });

    const guestEmails = [booking.guest_email, ...(booking.additional_guests || [])];

    await Promise.all([
      ...guestEmails.map(async (email) =>
        sendEmail(
          email,
          `Confirmed: ${booking.event_type.title} with ${booking.host.full_name}`,
          guestHtml,
        ),
      ),
      sendEmail(
        booking.host.email,
        `New Booking: ${booking.event_type.title} with ${booking.guest_name}`,
        hostHtml,
      ),
    ]);
  }

  static async sendBookingCancellation(
    booking: BookingWithRelations,
    timezone: string,
    _cancelledByHost: boolean,
  ): Promise<void> {
    const startTime = formatBookingDateTime(booking.start_time, timezone);

    const baseData = {
      eventTitle: booking.event_type.title,
      bookerName: booking.guest_name,
      hostName: booking.host.full_name,
      startTime,
      cancelReason: booking.cancellation_reason,
    };

    const guestHtml = compileTemplate('bookingCancelled', {
      ...baseData,
      recipientName: booking.guest_name,
    });
    const hostHtml = compileTemplate('bookingCancelled', {
      ...baseData,
      recipientName: booking.host.full_name,
    });

    const guestEmails = [booking.guest_email, ...(booking.additional_guests || [])];

    await Promise.all([
      ...guestEmails.map(async (email) =>
        sendEmail(
          email,
          `Cancelled: ${booking.event_type.title} with ${booking.host.full_name}`,
          guestHtml,
        ),
      ),
      sendEmail(
        booking.host.email,
        `Cancelled: ${booking.event_type.title} with ${booking.guest_name}`,
        hostHtml,
      ),
    ]);
  }

  static async sendBookingReschedule(
    previousBooking: BookingWithRelations,
    newBooking: BookingWithRelations,
    timezone: string,
    reason?: string | null,
  ): Promise<void> {
    const baseData = {
      eventTitle: newBooking.event_type.title,
      bookerName: newBooking.guest_name,
      hostName: newBooking.host.full_name,
      previousStartTime: formatTimeRange(
        previousBooking.start_time,
        previousBooking.end_time,
        timezone,
      ),
      newStartTime: formatTimeRange(newBooking.start_time, newBooking.end_time, timezone),
      duration: newBooking.event_type.duration_mins,
      locationDisplay: newBooking.event_type.location_type.replace(/_/g, ' '),
      meetingUrl: newBooking.meeting_url,
      reason,
    };

    const guestHtml = compileTemplate('bookingRescheduled', {
      ...baseData,
      recipientName: newBooking.guest_name,
    });
    const hostHtml = compileTemplate('bookingRescheduled', {
      ...baseData,
      recipientName: newBooking.host.full_name,
    });

    const guestEmails = [newBooking.guest_email, ...(newBooking.additional_guests || [])];

    await Promise.all([
      ...guestEmails.map(async (email) =>
        sendEmail(
          email,
          `Rescheduled: ${newBooking.event_type.title} with ${newBooking.host.full_name}`,
          guestHtml,
        ),
      ),
      sendEmail(
        newBooking.host.email,
        `Rescheduled: ${newBooking.event_type.title} with ${newBooking.guest_name}`,
        hostHtml,
      ),
    ]);
  }
}
