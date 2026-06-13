export * from '@scaler/types';

export type {
  CreateEventTypeInput,
  UpdateEventTypeInput,
  CreateBookingInput,
  UpdateBookingStatusInput,
  CreateScheduleInput,
  UpdateScheduleInput,
  UpdateUserInput,
  LoginInput,
  RegisterInput,
} from '@scaler/types';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  error: string;
  details?: string;
  code?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  timezone: string;
}

export interface AuthPayload {
  accessToken: string;
  user: AuthUser;
}

export interface EventType {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string | null;
  duration_mins: number;
  is_active: boolean;
  is_hidden: boolean;
  location_type: string;
  location_details: string | null;
  requires_confirmation: boolean;
  buffer_before_mins: number;
  buffer_after_mins: number;
  created_at: string;
  updated_at: string;
}

export interface PublicEventType extends EventType {
  user: Pick<AuthUser, 'id' | 'full_name' | 'username' | 'avatar_url' | 'timezone'>;
}

export interface ScheduleAvailability {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface DateOverride {
  id?: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  is_available: boolean;
}

export interface Schedule {
  id: string;
  user_id: string;
  name: string;
  timezone: string;
  is_default: boolean;
  availability: ScheduleAvailability[];
  overrides: DateOverride[];
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  uid: string;
  event_type_id: string;
  host_id: string;
  guest_name: string;
  guest_email: string;
  guest_notes: string | null;
  start_time: string;
  end_time: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED';
  cancellation_reason: string | null;
  meeting_url: string | null;
  event_type: EventType;
  host?: AuthUser;
}

export interface Slot {
  startTime: string;
  endTime: string;
  localStartTime: string;
  localEndTime: string;
  timezone: string;
  available: boolean;
}

export interface Integration {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  category: string;
  is_connected: boolean;
  is_default?: boolean;
}
