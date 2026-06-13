# Backend Verification Checklist

This document serves as the mandatory manual verification checklist for the Scaler Backend before transitioning to frontend development or deploying to production.

## 1. Local Testing Environment

- [ ] Supabase local database is running (`supabase start` or remote dev DB configured).
- [ ] `.env` is populated with all mandatory secrets (`JWT_ACCESS_SECRET`, `ENCRYPTION_KEY`, etc.).
- [ ] `pnpm build` succeeds with zero TypeScript errors.
- [ ] `pnpm lint` yields zero or acceptable warning thresholds.
- [ ] `pnpm test` successfully executes both Unit and Integration test suites.

## 2. Security & Rate Limiting

- [ ] **JWT Rotation**: Log in via the API, take the refresh token, and manually hit the `/api/v1/auth/refresh` endpoint. Ensure a new access token is returned and the old refresh token is marked `is_revoked`.
- [ ] **Rate Limits**: Use an API client (like Postman or curl) to hit `/api/v1/auth/login` more than 10 times in 15 minutes. Verify a `429 Too Many Requests` response is returned.
- [ ] **CORS**: Verify that requests originating from non-whitelisted domains are rejected.

## 3. Asynchronous Triggers & Email (Ethereal)

- [ ] Ensure `SMTP_HOST` in `.env` is set to `smtp.ethereal.email`.
- [ ] Create a booking via `/api/v1/bookings`.
- [ ] Log into the Ethereal email dashboard (credentials from `.env`).
- [ ] Verify that a `Booking Confirmed` email arrives in the inbox containing the correct time (in the requested timezone) and guest information.

## 4. Double Booking & Row-Level Locking

- [ ] Disable the frontend UI. Send two rapid, concurrent POST requests to `/api/v1/bookings` for the exact same timeslot using a script or parallel cURL.
- [ ] Verify that only **one** request returns `201 Created` and the other returns `409 Conflict` (or equivalent AppError). Check the database to ensure exactly one booking row exists for that slot.

## 5. Integrations (OAuth & Encrypted Storage)

### Google Calendar

- [ ] Initiate the Google OAuth flow. Verify the redirect URI matches the configured Google Cloud Console origin.
- [ ] Complete the flow. Check the `integrations` table to ensure `access_token` and `refresh_token` are successfully stored in an AES-256-GCM encrypted format (should look like `base64:base64:base64`).

### Zoom

- [ ] Connect the Zoom integration.
- [ ] Create a booking for an event type with `location_type = 'ZOOM'`.
- [ ] Verify the confirmation email contains a valid `zoom.us/j/...` meeting URL.

## 6. Timezone Translation

- [ ] Create an event type with a schedule in `America/New_York`.
- [ ] Request availability slots using the `timezone=Asia/Kolkata` parameter.
- [ ] Ensure the returned slots map correctly to standard Indian Standard Time (IST) offset relative to EST.
