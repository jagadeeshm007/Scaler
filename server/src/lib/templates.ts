import Handlebars from 'handlebars';

import { logger } from './logger';

// Hardcoded simple templates instead of reading from file system to avoid fs dependencies and ensure reliability.
// In a real app, these would be in `.hbs` files.

const BOOKING_CONFIRMED_TEMPLATE = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Booking Confirmed: {{eventTitle}}</h2>
  <p>Hi {{bookerName}},</p>
  <p>Your meeting with {{hostName}} is confirmed.</p>
  <ul>
    <li><strong>When:</strong> {{startTime}} ({{duration}} mins)</li>
    <li><strong>Where:</strong> {{locationDisplay}}</li>
    {{#if meetingUrl}}
      <li><strong>Link:</strong> <a href="{{meetingUrl}}">{{meetingUrl}}</a></li>
    {{/if}}
  </ul>
  <p>To cancel or reschedule, please contact the host.</p>
</div>
`;

const BOOKING_CANCELLED_TEMPLATE = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Booking Cancelled: {{eventTitle}}</h2>
  <p>Hi {{bookerName}},</p>
  <p>Your meeting with {{hostName}} originally scheduled for {{startTime}} has been cancelled.</p>
  {{#if cancelReason}}
    <p><strong>Reason:</strong> {{cancelReason}}</p>
  {{/if}}
</div>
`;

export const templates = {
  bookingConfirmed: Handlebars.compile(BOOKING_CONFIRMED_TEMPLATE),
  bookingCancelled: Handlebars.compile(BOOKING_CANCELLED_TEMPLATE),
};

export function compileTemplate(
  templateName: keyof typeof templates,
  data: Record<string, unknown>,
): string {
  try {
    return templates[templateName](data);
  } catch (error) {
    logger.error({ err: error }, `Error compiling template ${templateName}`);
    return `Fallback: Meeting details processed for ${String(data.bookerName)}`;
  }
}
