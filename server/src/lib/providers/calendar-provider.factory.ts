import { logger } from '../logger';
import { GoogleCalendarProvider } from './google-calendar.provider';
import { MicrosoftCalendarProvider } from './microsoft-calendar.provider';

import type { CalendarProvider } from './calendar-provider.interface';

export class CalendarProviderFactory {
  static getProvider(appSlug: string): CalendarProvider | null {
    switch (appSlug) {
      case 'google':
        return new GoogleCalendarProvider();
      case 'microsoft':
        return new MicrosoftCalendarProvider();
      default:
        logger.warn(`Unsupported calendar provider: ${appSlug}`);
        return null;
    }
  }
}
