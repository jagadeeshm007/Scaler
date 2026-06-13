import Handlebars from 'handlebars';

import { logger } from './logger';

const BOOKING_CONFIRMED_TEMPLATE = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Booking Confirmed: {{eventTitle}}</h2>
  <p>Hi {{recipientName}},</p>
  <p>Your meeting between <strong>{{bookerName}}</strong> and <strong>{{hostName}}</strong> is confirmed.</p>
  <ul>
    <li><strong>When:</strong> {{startTime}} ({{duration}} mins)</li>
    <li><strong>Where:</strong> {{locationDisplay}}</li>
    {{#if meetingUrl}}
      <li><strong>Link:</strong> <a href="{{meetingUrl}}">{{meetingUrl}}</a></li>
    {{/if}}
  </ul>
</div>
`;

const BOOKING_CANCELLED_TEMPLATE = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Booking Cancelled: {{eventTitle}}</h2>
  <p>Hi {{recipientName}},</p>
  <p>The meeting between <strong>{{bookerName}}</strong> and <strong>{{hostName}}</strong> scheduled for {{startTime}} has been cancelled.</p>
  {{#if cancelReason}}
    <p><strong>Reason:</strong> {{cancelReason}}</p>
  {{/if}}
</div>
`;

const BOOKING_RESCHEDULED_TEMPLATE = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Booking Rescheduled: {{eventTitle}}</h2>
  <p>Hi {{recipientName}},</p>
  <p>The meeting between <strong>{{bookerName}}</strong> and <strong>{{hostName}}</strong> has been rescheduled.</p>
  <ul>
    <li><strong>Previous time:</strong> <s>{{previousStartTime}}</s></li>
    <li><strong>New time:</strong> {{newStartTime}} ({{duration}} mins)</li>
    <li><strong>Where:</strong> {{locationDisplay}}</li>
    {{#if meetingUrl}}
      <li><strong>Link:</strong> <a href="{{meetingUrl}}">{{meetingUrl}}</a></li>
    {{/if}}
  </ul>
  {{#if reason}}
    <p><strong>Reason:</strong> {{reason}}</p>
  {{/if}}
</div>
`;

export const templates = {
  bookingConfirmed: Handlebars.compile(BOOKING_CONFIRMED_TEMPLATE),
  bookingCancelled: Handlebars.compile(BOOKING_CANCELLED_TEMPLATE),
  bookingRescheduled: Handlebars.compile(BOOKING_RESCHEDULED_TEMPLATE),
};

export function compileTemplate(
  templateName: keyof typeof templates,
  data: Record<string, unknown>,
): string {
  try {
    return templates[templateName](data);
  } catch (error) {
    logger.error({ err: error }, `Error compiling template ${templateName}`);
    return `Meeting update processed for ${String(data.recipientName ?? data.bookerName)}`;
  }
}
