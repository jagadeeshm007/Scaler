# Backend Implementation Plan

## 1. Architecture Overview

**Request Lifecycle**

```text
Client Request
   │
   ▼
[ Express Router ] ── Route matching
   │
   ▼
[ Validate Middleware (Zod) ] ── Strips unknown fields, enforces schema
   │
   ▼
[ Auth Middleware ] ── Validates JWT, sets req.user (if protected)
   │
   ▼
[ Controller ] ── Extracts req data, calls Service
   │
   ▼
[ Service ] ── Core business logic, calls Prisma
   │
   ▼
[ Prisma ORM (v7 + pg adapter) ] ── Generates SQL
   │
   ▼
[ Supabase PostgreSQL ] ── Executed via connection pooler (pgbouncer)
```

**Error Flow**
If a validation fails, the Zod middleware intercepts it and returns a `422 Unprocessable Entity` structured by `ApiResponse`.
For business logic errors, the Service layer throws a typed `AppError` (e.g., `throw new AppError('Conflict', 409)`). The Controller catches this (via `asyncHandler`) and calls `next(error)`. The Global Error Handler parses the `AppError` and emits a consistent JSON structure using `ApiResponse.error()`. Unexpected errors are logged securely via Pino before returning a `500`.

**Integration Architecture**
When a new booking is created, the `BookingService` commits the database transaction. Then, it asynchronously calls `IntegrationService.createCalendarEvent()`. The `IntegrationService` checks the `location_type` and the host's connected integrations (via `Credential` records). It dispatches the payload to the respective provider (`GoogleCalendarProvider`, `ZoomProvider`, `MicrosoftProvider`) to generate external meeting links and push to remote calendars. If this external call fails, the booking remains valid, and the failure is logged.

---

## 2. Database Schema — Final Design

```prisma
generator client {
  provider = "prisma-client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Used implicitly by Prisma CLI via config
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  username      String    @unique
  password_hash String?
  full_name     String
  avatar_url    String?
  timezone      String    @default("UTC")
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  deleted_at    DateTime? // Soft delete: preserves historical bookings but revokes access

  eventTypes    EventType[]
  schedules     Schedule[]
  credentials   Credential[]
  refreshTokens RefreshToken[]
  hostBookings  Booking[]      @relation("HostBookings")

  @@map("users")
}

model EventType {
  id               String  @id @default(uuid())
  user_id          String
  title            String
  slug             String
  description      String?
  duration_mins    Int
  is_active        Boolean @default(true)
  is_hidden        Boolean @default(false)
  location_type    String  // Required. e.g. "IN_PERSON", "CUSTOM", or integration-specific like "GOOGLE_MEET"
  location_details String?

  requires_confirmation Boolean @default(false)
  buffer_before_mins    Int     @default(0)
  buffer_after_mins     Int     @default(0)

  created_at DateTime  @default(now())
  updated_at DateTime  @updatedAt
  deleted_at DateTime?

  user     User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  bookings Booking[]

  @@unique([user_id, slug])
  @@index([user_id])
  @@map("event_types")
}

model Schedule {
  id         String   @id @default(uuid())
  user_id    String
  name       String
  timezone   String
  is_default Boolean  @default(false)
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  user         User                   @relation(fields: [user_id], references: [id], onDelete: Cascade)
  availability ScheduleAvailability[]
  overrides    DateOverride[]

  @@index([user_id])
  @@map("schedules")
}

model ScheduleAvailability {
  id          String   @id @default(uuid())
  schedule_id String
  day_of_week Int
  start_time  String   // "HH:MM"
  end_time    String   // "HH:MM"
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  schedule Schedule @relation(fields: [schedule_id], references: [id], onDelete: Cascade)

  @@index([schedule_id])
  @@map("schedule_availability")
}

model DateOverride {
  id           String   @id @default(uuid())
  schedule_id  String
  date         DateTime // Stored as midnight UTC
  start_time   String?  // "HH:MM"
  end_time     String?
  is_available Boolean  @default(false)
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt

  schedule Schedule @relation(fields: [schedule_id], references: [id], onDelete: Cascade)

  @@index([schedule_id, date])
  @@map("date_overrides")
}

model Booking {
  id            String   @id @default(uuid())
  uid           String   @unique @default(uuid()) // Short-id for public URLs
  event_type_id String
  host_id       String

  guest_name  String
  guest_email String
  guest_notes String?

  start_time          DateTime
  end_time            DateTime
  status              String   @default("PENDING") // PENDING, CONFIRMED, CANCELLED, RESCHEDULED
  cancellation_reason String?

  meeting_url    String?
  integration_id String? // ID from external calendar

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  event_type EventType @relation(fields: [event_type_id], references: [id], onDelete: Cascade)
  host       User      @relation("HostBookings", fields: [host_id], references: [id], onDelete: Cascade)
  customResponses BookingCustomResponse[]

  @@index([host_id, start_time])
  @@index([event_type_id])
  @@index([uid])
  @@map("bookings")
}

model BookingCustomResponse {
  id         String   @id @default(uuid())
  booking_id String
  label      String
  value      String
  created_at DateTime @default(now())

  booking Booking @relation(fields: [booking_id], references: [id], onDelete: Cascade)

  @@index([booking_id])
  @@map("booking_custom_responses")
}

model App {
  id                      String   @id @default(uuid())
  slug                    String   @unique
  name                    String
  description             String?
  logo_url                String?
  category                String
  auth_type               String   @default("OAUTH2")
  client_id_encrypted     String?
  client_secret_encrypted String?
  redirect_uri            String?
  scopes                  String?
  is_active               Boolean  @default(true)
  created_at              DateTime @default(now())
  updated_at              DateTime @updatedAt

  credentials Credential[]

  @@map("apps")
}

model Credential {
  id                      String    @id @default(uuid())
  user_id                 String
  app_id                  String
  access_token_encrypted  String
  refresh_token_encrypted String?
  expires_at              DateTime?
  scopes                  String?
  created_at              DateTime  @default(now())
  updated_at              DateTime  @updatedAt

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  app  App  @relation(fields: [app_id], references: [id], onDelete: Cascade)

  @@unique([user_id, app_id])
  @@index([user_id])
  @@index([app_id])
  @@map("credentials")
}

model RefreshToken {
  id         String   @id @default(uuid())
  token_hash String   @unique
  user_id    String
  expires_at DateTime
  is_revoked Boolean  @default(false)
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@index([token_hash])
  @@map("refresh_tokens")
}
```

**Business Rules:**

- A user can have at most one default schedule. Enforced at the service layer before creating or updating a schedule.
- Soft Delete: `deleted_at` on the `User` model ensures that a user can deactivate their account, immediately restricting public booking pages, but maintaining their booking history for data integrity and guest reference.

---

## 3. API Endpoint Inventory

| Method | Path                                   | Auth | Request Schema               | Response Schema            | Description                                                                | Rate Limit | Cache | Side Effects                         |
| ------ | -------------------------------------- | ---- | ---------------------------- | -------------------------- | -------------------------------------------------------------------------- | ---------- | ----- | ------------------------------------ |
| POST   | `/api/v1/auth/login`                   | None | `{ email, password }`        | `{ accessToken, user }`    | Authenticates user                                                         | Strict     | None  | Sets HTTP-only refresh cookie        |
| POST   | `/api/v1/auth/bypass`                  | None | `{}`                         | `{ accessToken, user }`    | Logs in the pre-seeded demo user (real user in DB) for seamless onboarding | Normal     | None  | Sets HTTP-only refresh cookie        |
| POST   | `/api/v1/auth/refresh`                 | None | `Cookie: refresh_token`      | `{ accessToken }`          | Rotates access token                                                       | Strict     | None  | Updates RefreshToken record          |
| GET    | `/api/v1/users/me`                     | JWT  | `None`                       | `User`                     | Returns current user profile                                               | Normal     | None  | None                                 |
| PATCH  | `/api/v1/users/me`                     | JWT  | `Partial<User>`              | `User`                     | Updates profile info                                                       | Normal     | None  | None                                 |
| GET    | `/api/v1/event-types`                  | JWT  | `None`                       | `EventType[]`              | Lists host's event types                                                   | Normal     | None  | None                                 |
| POST   | `/api/v1/event-types`                  | JWT  | `CreateEventTypeSchema`      | `EventType`                | Creates new event type                                                     | Normal     | None  | None                                 |
| PATCH  | `/api/v1/event-types/:id`              | JWT  | `UpdateEventTypeSchema`      | `EventType`                | Modifies an event type                                                     | Normal     | None  | None                                 |
| GET    | `/api/v1/public/:username/event-types` | None | `None`                       | `EventType[]`              | Lists public active event types                                            | Normal     | Short | None                                 |
| GET    | `/api/v1/public/:username/:slug`       | None | `None`                       | `EventType & { User }`     | Fetches details for booking UI                                             | Normal     | Short | None                                 |
| GET    | `/api/v1/availability`                 | JWT  | `None`                       | `Schedule[]`               | Lists user's schedules                                                     | Normal     | None  | None                                 |
| PUT    | `/api/v1/availability/:id`             | JWT  | `UpdateScheduleSchema`       | `Schedule`                 | Overwrites a schedule ruleset                                              | Normal     | None  | None                                 |
| GET    | `/api/v1/slots`                        | None | `?eventTypeId&date&timezone` | `{ startTime, endTime }[]` | Returns computed available slots                                           | Normal     | None  | Heavy CPU compute                    |
| GET    | `/api/v1/bookings`                     | JWT  | `?status&tab`                | `Booking[]`                | Lists bookings for dashboard                                               | Normal     | None  | None                                 |
| POST   | `/api/v1/bookings`                     | None | `CreateBookingSchema`        | `Booking`                  | Creates new appointment                                                    | Strict     | None  | Creates Calendar Event, Sends Emails |
| PATCH  | `/api/v1/bookings/:uid`                | JWT  | `UpdateBookingStatusSchema`  | `Booking`                  | Cancels or confirms booking                                                | Normal     | None  | Syncs Calendar Event, Sends Emails   |
| GET    | `/api/v1/integrations`                 | JWT  | `None`                       | `App[] & status`           | Lists connected & available apps                                           | Normal     | None  | None                                 |
| GET    | `/api/v1/integrations/:slug/connect`   | JWT  | `None`                       | `302 Redirect`             | Initiates OAuth flow                                                       | Normal     | None  | None                                 |
| GET    | `/api/v1/integrations/:slug/callback`  | None | `?code&state`                | `302 Redirect`             | Handles OAuth callback                                                     | Strict     | None  | Upserts Credential (encrypted)       |

---

## 4. Slot Calculation Algorithm

**Inputs:**

- `eventTypeId`
- `date` (YYYY-MM-DD in requester's timezone)
- `timezone` (IANA string e.g. `Asia/Kolkata`)

**Algorithm Steps:**

1. **Fetch EventType:** Retrieve `duration_mins`, `buffer_before_mins`, `buffer_after_mins`, and the `user_id` linked to the event. Find the associated `scheduleId`.
2. **Fetch Active Schedule:** Query the `ScheduleAvailability` for the target `user_id` where `day_of_week` matches the requested `date`.
3. **Fetch DateOverrides:** Query `DateOverride` for the specific `date`. If an override exists, it wholly replaces the `ScheduleAvailability` for that day.
4. **Determine Working Window:** Extract `start_time` and `end_time` (e.g. "09:00", "17:00") from the availability record in the host's schedule timezone. Convert these bounds into UTC `DateTime` objects.
5. **Generate Candidate Slots:** Start at `windowStart`. Iterate by adding `duration_mins` to the current slot to find the slot end. If the slot end is <= `windowEnd`, push the slot to candidate array. Repeat until the end of the working window.
6. **Fetch Existing Bookings:** Query `Booking` for the host on the exact day (in UTC bounds) where `status` is `CONFIRMED` or `PENDING`.
7. **Calculate Blocked Windows:** For each existing booking, define its blocked range as: `[booking.start_time - event.buffer_before_mins, booking.end_time + event.buffer_after_mins]`.
8. **Filter Candidate Slots:** Iterate through candidate slots. If a candidate's `[slot_start, slot_end]` overlaps with ANY blocked window, remove the candidate slot.
9. **Filter Past Slots:** Remove any slot whose `start_time` is before `Date.now() + 10 minutes` (prevents booking an event in the absolute immediate present or past).
10. **Convert Timezones:** Map the remaining valid UTC candidate slots into ISO strings for the response.
11. **Return Array:** Return `[ { startTime: "2026-06-15T09:00:00.000Z", endTime: "2026-06-15T09:30:00.000Z", available: true } ]`.

**Edge Cases Handled:**

- **Daylight saving time transitions:** Conversions handle UTC off-sets dynamically via `date-fns-tz` which resolves anomalies automatically.
- **Slots crossing midnight:** If a working window spans from "22:00" to "02:00", it is split into two logical ranges calculated natively as proper Date bounds.
- **Full-day overrides:** If a `DateOverride` has `is_available: false`, the candidate array generation is skipped entirely, returning an empty array.
- **30-minute offsets (IST):** `date-fns-tz` natively supports non-integer offsets like +05:30.
- **Requesting slots for today vs future dates**: Covered by "filter past slots" logic, ignoring already-past hours of today.
- **Empty Result:** If no slots exist, a `200 OK` with `[]` is returned, preventing client-side `404` error states on legitimate empty schedules.

---

## 5. Double Booking Prevention

**Transaction Strategy:**

1. Begin `prisma.$transaction`.
2. Inside transaction: `SELECT id FROM bookings WHERE host_id = $1 AND ((start_time < $newEnd) AND (end_time > $newStart)) AND status IN ('PENDING', 'CONFIRMED') FOR UPDATE`.
3. If overlap found: roll back and `throw AppError CONFLICT 409`.
4. If no overlap: `INSERT` new booking.
5. Commit transaction.

**Explanation:**
Application-level checks (like checking overlaps via `findMany` then calling `create`) suffer from race conditions: two concurrent requests could both see the slot as "free" and subsequently insert bookings simultaneously. DB-level row locks (`SELECT FOR UPDATE`) within a transaction force the database to serialize concurrent queries for that time slice, ensuring the second request will wait, see the newly inserted row, and reliably reject the booking.
The exact overlap logic is: `two bookings overlap if startA < endB AND endA > startB`.

---

## 6. OAuth Integration Flow

**Extensibility Note:**
The integration architecture is designed to be highly extensible. Because OAuth clients are stored dynamically in the `App` table rather than hardcoded in `.env`, adding a new integration simply requires:

1. Inserting a new `App` record with the OAuth credentials.
2. Creating a new wrapper in `lib/` for the provider API.
3. Hooking into the `IntegrationService` router logic.

### Flow Steps (Google as Example)

1. Frontend calls `GET /api/v1/integrations/google/connect`.
2. Backend generates a Google OAuth URL containing a `state` parameter (a signed JWT containing the `userId`).
3. Frontend redirects the user to the Google OAuth consent screen.
4. Google redirects back to `GET /api/v1/integrations/google/callback?code=...&state=...`.
5. Backend verifies the `state` JWT to ensure CSRF protection and extract the `userId`.
6. Backend exchanges the `code` with Google for `access_token` and `refresh_token`.
7. Backend encrypts both tokens using AES-256-GCM.
8. Backend upserts a `Credential` record for the `userId` and `google` appId.
9. Backend responds with an HTTP 302 redirecting the user back to `/settings/integrations?connected=google`.

### Token Refresh Strategy

- Before any API call (e.g., creating a calendar event), the `Credential`'s `expires_at` is checked.
- If it expires within 5 minutes, the backend calls the provider's refresh endpoint.
- It encrypts and saves the new tokens, and proceeds with the new `access_token`.
- If the refresh fails (e.g., user revoked access), the `Credential` is marked inactive or deleted, and a non-fatal `IntegrationError` is thrown so the core application flow doesn't crash.

### Calendar Event Creation

When a booking is created/confirmed:

1. Check the host's `Credential`s.
2. If `location_type` is `GOOGLE_MEET` and Google is connected:
   - Call Google Calendar API to insert an event with `conferenceDataVersion=1`.
   - Store the generated `hangoutLink` in `Booking.meeting_url` and `id` in `Booking.integration_id`.
3. If `location_type` is `ZOOM` and Zoom is connected:
   - Call Zoom API `/users/me/meetings`.
   - Store `join_url` in `Booking.meeting_url`.
4. If `location_type` is `MS_TEAMS` and Microsoft is connected:
   - Call Teams Graph API.
   - Store URL in `Booking.meeting_url`.
5. **Resilience:** All integration calls are wrapped in `try/catch`. If an API is down, the booking still successfully persists in our database, and the error is logged.

---

## 7. Email Notification System

**Templates:**

1. `booking-confirmed.hbs`
   - Trigger: Booking status `CONFIRMED`.
   - Variables: `bookerName`, `hostName`, `eventTitle`, `startTime`, `duration`, `locationDisplay`, `meetingUrl`, `cancelUrl`, `rescheduleUrl`.
2. `booking-cancelled-booker.hbs`
   - Trigger: Host cancels the booking.
   - Variables: `bookerName`, `eventTitle`, `startTime`, `cancelReason`, `hostName`.
3. `booking-cancelled-host.hbs`
   - Trigger: Booker cancels the booking.
   - Variables: `hostName`, `bookerName`, `eventTitle`, `startTime`.
4. `booking-rescheduled.hbs`
   - Trigger: Booking rescheduled.
   - Variables: `bookerName`, `hostName`, `eventTitle`, `oldStartTime`, `newStartTime`, `duration`, `locationDisplay`.
5. `booking-reminder.hbs`
   - Trigger: 24 hours before start (via `node-cron`).
   - Variables: `bookerName`, `eventTitle`, `startTime`, `locationDisplay`, `meetingUrl`.

**Architecture:**

- `lib/mailer.ts`: Creates a `nodemailer` transport using SMTP credentials.
- `lib/templates.ts`: Compiles Handlebars (`.hbs`) files using `fs.readFile` and `handlebars.compile`.
- `services/email.service.ts`: Exposes typed functions (e.g., `sendBookingConfirmation(booking: Booking)`).
- `EmailService` is executed asynchronously post-transaction to prevent blocking HTTP responses on slow SMTP servers.

---

## 8. File Structure — Final

```text
server/src/
  config/
    env.ts                  ← Strict Zod validation of all environment variables
    constants.ts            ← Static enums and application-wide constants
  lib/
    prisma.ts               ← Prisma ORM singleton with connection pooling adapter
    logger.ts               ← Pino structured logging singleton
    mailer.ts               ← Nodemailer transport instance
    templates.ts            ← Handlebars template compiler
    google.ts               ← Google API client wrapper
    zoom.ts                 ← Zoom API client wrapper
    microsoft.ts            ← Microsoft Graph API client wrapper
    encryption.ts           ← AES-256-GCM utilities for token encryption
  types/
    index.ts                ← Re-exports all shared TS types
    express.d.ts            ← Module augmentation for req.user
  middleware/
    auth.ts                 ← Validates JWTs and assigns req.user
    validate.ts             ← Validates req body/query/params against Zod schemas
    error-handler.ts        ← Global error catcher and formatter
    rate-limiter.ts         ← express-rate-limit implementation
    request-id.ts           ← Assigns unique UUID to every request
  utils/
    app-error.ts            ← Custom Error class for operational faults
    async-handler.ts        ← Wraps async express routes to catch unhandled rejections
    api-response.ts         ← Formats JSON payload consistently
    date.ts                 ← Timezone and date-fns wrappers
    slot-calculator.ts      ← Core algorithm for computing available times
    overlap.ts              ← Raw SQL generators for DB-level overlap locking
  services/
    auth.service.ts         ← Handles login, signup, and bypass flows
    token.service.ts        ← Generates and verifies JWTs
    user.service.ts         ← Manages user profiles and settings
    event-type.service.ts   ← Manages event configurations
    schedule.service.ts     ← Manages default and custom availability schedules
    availability.service.ts ← Reads overrides and baseline availability
    booking.service.ts      ← Transactional booking creation and cancellation
    email.service.ts        ← Dispatches templated emails
    integration.service.ts  ← Manages OAuth flows and Credential storage
    calendar.service.ts     ← Dispatches logic to provider wrappers (Google/Zoom)
  controllers/
    auth.controller.ts      ← Maps HTTP to auth.service
    user.controller.ts      ← Maps HTTP to user.service
    event-type.controller.ts← Maps HTTP to event-type.service
    availability.controller.ts← Maps HTTP to schedule/availability services
    booking.controller.ts   ← Maps HTTP to booking.service
    integration.controller.ts← Maps HTTP to integration.service
  routes/
    index.ts                ← Aggregates and mounts v1 router
    auth.routes.ts          ← Express router for /auth
    user.routes.ts          ← Express router for /users
    event-type.routes.ts    ← Express router for /event-types
    availability.routes.ts  ← Express router for /availability
    booking.routes.ts       ← Express router for /bookings
    integration.routes.ts   ← Express router for /integrations
    public.routes.ts        ← Express router for unauthenticated public endpoints
  jobs/
    booking-reminder.job.ts ← Cron job mapping pending bookings to reminders
  app.ts                    ← Express app initialization and middleware mounting
  index.ts                  ← Server bootloader and graceful shutdown logic
```

---

## 9. Implementation Sequence

1. `types/express.d.ts` — Required to augment Request for subsequent auth middleware
2. `lib/encryption.ts` — Standalone util required for auth and integrations
3. `services/token.service.ts` — Core JWT logic required for auth
4. `services/auth.service.ts` — Depends on token.service and encryption
5. `controllers/auth.controller.ts` — Depends on auth.service
6. `routes/auth.routes.ts` — Depends on auth.controller
7. `services/user.service.ts` — Core profile logic
8. `controllers/user.controller.ts` — Depends on user.service
9. `routes/user.routes.ts` — Depends on user.controller
10. `services/event-type.service.ts` — Requires user context
11. `controllers/event-type.controller.ts` — Depends on event-type.service
12. `routes/event-type.routes.ts` — Depends on event-type.controller
13. `services/schedule.service.ts` — Requires event types to be working
14. `services/availability.service.ts` — Depends on schedule service
15. `controllers/availability.controller.ts` — Depends on availability services
16. `routes/availability.routes.ts` — Depends on availability.controller
17. `utils/date.ts` — Date helpers
18. `utils/slot-calculator.ts` — Requires availability data to compute
19. `routes/public.routes.ts` — Exposes slot calculator to frontend
20. `utils/overlap.ts` — Raw SQL utility for double-bookings
21. `lib/mailer.ts` — Mailer transport
22. `lib/templates.ts` — Handlebars rendering
23. `services/email.service.ts` — Depends on mailer/templates
24. `lib/google.ts` — Google API wrapper
25. `lib/zoom.ts` — Zoom API wrapper
26. `lib/microsoft.ts` — MS API wrapper
27. `services/integration.service.ts` — Depends on API clients
28. `services/calendar.service.ts` — Depends on Integration Service
29. `services/booking.service.ts` — Heaviest service; depends on overlap, email, and calendar services
30. `controllers/booking.controller.ts` — Depends on booking.service
31. `routes/booking.routes.ts` — Depends on booking.controller
32. `controllers/integration.controller.ts` — Depends on integration.service
33. `routes/integration.routes.ts` — Depends on integration.controller
34. `jobs/booking-reminder.job.ts` — Depends on booking and email services

---

## 10. Risk Register

| Risk                                                | Likelihood | Impact | Mitigation                                                                                                                                                 |
| --------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Race condition on booking creation**              | High       | High   | Wrap booking inserts in a Prisma `$transaction` executing a `SELECT FOR UPDATE` raw SQL check for time overlaps.                                           |
| **Timezone DST causing slot miscalculation**        | Medium     | High   | Exclusively store DB values in absolute UTC. Use `date-fns-tz` to project UTC into the user's localized timezone directly before rendering.                |
| **External integration API downtime**               | Medium     | Medium | Wrap `IntegrationService` calls in `try/catch` without rejecting the booking promise. Alert via logs and flag metadata as `sync_failed`.                   |
| **Supabase connection pool exhaustion under load**  | Low        | High   | Use `@prisma/adapter-pg` connecting to Supabase's transaction pooler (port 6543) instead of direct connections to heavily multiplex connections.           |
| **Prisma migration failure in production**          | Low        | High   | Use the explicit `prisma.config.ts` design to cleanly separate the runtime pooler from the CLI's `DIRECT_URL` (port 5432) for deterministic schema pushes. |
| **Email delivery failure blocking requests**        | High       | Medium | Dispatch `EmailService` calls asynchronously after returning the HTTP 201 response. Do not await them in the controller.                                   |
| **Token expiry during long user sessions**          | High       | Medium | Implement an automatic silent refresh flow via HttpOnly cookies that rotates short-lived `access_tokens`.                                                  |
| **Large number of bookings making slot query slow** | Medium     | Medium | Index the `start_time` and `end_time` columns and heavily scope queries by `host_id` and strict absolute date boundaries.                                  |

---

## 11. Implementation Checklist

- [ ] `types/express.d.ts`
- [ ] `lib/encryption.ts`
- [ ] `services/token.service.ts`
- [ ] `services/auth.service.ts`
- [ ] `controllers/auth.controller.ts`
- [ ] `routes/auth.routes.ts`
- [ ] `services/user.service.ts`
- [ ] `controllers/user.controller.ts`
- [ ] `routes/user.routes.ts`
- [ ] `services/event-type.service.ts`
- [ ] `controllers/event-type.controller.ts`
- [ ] `routes/event-type.routes.ts`
- [ ] `services/schedule.service.ts`
- [ ] `services/availability.service.ts`
- [ ] `controllers/availability.controller.ts`
- [ ] `routes/availability.routes.ts`
- [ ] `utils/date.ts`
- [ ] `utils/slot-calculator.ts`
- [ ] `routes/public.routes.ts`
- [ ] `utils/overlap.ts`
- [ ] `lib/mailer.ts`
- [ ] `lib/templates.ts`
- [ ] `services/email.service.ts`
- [ ] `lib/google.ts`
- [ ] `lib/zoom.ts`
- [ ] `lib/microsoft.ts`
- [ ] `services/integration.service.ts`
- [ ] `services/calendar.service.ts`
- [ ] `services/booking.service.ts`
- [ ] `controllers/booking.controller.ts`
- [ ] `routes/booking.routes.ts`
- [ ] `controllers/integration.controller.ts`
- [ ] `routes/integration.routes.ts`
- [ ] `jobs/booking-reminder.job.ts`
