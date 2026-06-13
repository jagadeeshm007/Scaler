import type { Booking, EventType, User } from '@prisma/client';
import { sendEmail } from '../lib/mailer';
import { compileTemplate } from '../lib/templates';
import { DateUtils } from '../utils/date';

type BookingWithRelations = Booking & {
  event_type: EventType;
  host: User;
};

export class EmailService {
  static async sendBookingConfirmation(
    booking: BookingWithRelations,
    timezone: string,
  ): Promise<void> {
    const startTimeLocal = DateUtils.formatToTimezoneTime(booking.start_time, timezone);
    const dateStr = booking.start_time.toISOString().split('T')[0];

    const data = {
      eventTitle: booking.event_type.title,
      bookerName: booking.guest_name,
      hostName: booking.host.full_name,
      startTime: `${dateStr} at ${startTimeLocal} (${timezone})`,
      duration: booking.event_type.duration_mins,
      locationDisplay: booking.event_type.location_type,
      meetingUrl: booking.meeting_url,
    };

    const html = compileTemplate('bookingConfirmed', data);

    await sendEmail(
      booking.guest_email,
      `Confirmed: ${booking.event_type.title} with ${booking.host.full_name}`,
      html,
    );
    await sendEmail(
      booking.host.email,
      `New Booking: ${booking.event_type.title} with ${booking.guest_name}`,
      html,
    );
  }

  static async sendBookingCancellation(
    booking: BookingWithRelations,
    timezone: string,
    cancelledByHost: boolean,
  ): Promise<void> {
    const startTimeLocal = DateUtils.formatToTimezoneTime(booking.start_time, timezone);
    const dateStr = booking.start_time.toISOString().split('T')[0];

    const data = {
      eventTitle: booking.event_type.title,
      bookerName: booking.guest_name,
      hostName: booking.host.full_name,
      startTime: `${dateStr} at ${startTimeLocal} (${timezone})`,
      cancelReason: booking.cancellation_reason,
    };

    const html = compileTemplate('bookingCancelled', data);

    if (cancelledByHost) {
      await sendEmail(
        booking.guest_email,
        `Cancelled: ${booking.event_type.title} with ${booking.host.full_name}`,
        html,
      );
    } else {
      await sendEmail(
        booking.host.email,
        `Cancelled: ${booking.event_type.title} with ${booking.guest_name}`,
        html,
      );
    }
  }
}
