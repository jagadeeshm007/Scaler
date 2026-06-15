# Scaler Authentication Flow

This document details the authentication architecture, token management, and UI hydration logic in the Scaler platform.

## 1. Hard Reload Sequence

This diagram shows the sequence when a user navigates to a protected route (e.g., `/event-types`) on a fresh page load.

```text
Browser                           Next.js Middleware                  Server Components                 Client (React)                  Backend API
   |                                      |                                   |                               |                              |
   |-- GET /event-types ----------------->|                                   |                               |                              |
   |  (Cookies: session_hint,             |                                   |                               |                              |
   |   refresh_token)                     |                                   |                               |                              |
   |                                      |-- Check `session_hint` === '1'    |                               |                              |
   |                                      |   (Hint exists -> let through)    |                               |                              |
   |                                      |---------------------------------->|                               |                              |
   |                                      |                                   |-- fetch /auth/session ------->|                              |
   |                                      |                                   |   (server-side fetch)         |                              |
   |                                      |                                   |<------------------------------|                              |
   |                                      |                                   |-- prefetch user profile ----->|                              |
   |                                      |                                   |<------------------------------|                              |
   |                                      |                                   |-- render HTML (with cache)    |                              |
   |<-------------------------------------|-----------------------------------|                               |                              |
   |-- Hydrate React ---------------------------------------------------------------------------------------->|                              |
   |                                      |                                   |                               |-- AuthHydrator runs          |
   |                                      |                                   |                               |   isAuthReady = false        |
   |                                      |                                   |                               |   (renders skeleton)         |
   |                                      |                                   |                               |-- /auth/session ------------>|
   |                                      |                                   |                               |<-- accessToken, user --------|
   |                                      |                                   |                               |-- isAuthReady = true         |
   |                                      |                                   |                               |   (renders real data)        |
```

## 2. Login Flow

```text
User                      Client (React)                       Backend API
  |                             |                                   |
  |-- Enter credentials ------->|                                   |
  |                             |-- POST /auth/login -------------->|
  |                             |                                   |-- Validate credentials
  |                             |                                   |-- Generate accessToken
  |                             |                                   |-- Generate refreshToken
  |                             |<-- Set-Cookie: refresh_token -----|
  |                             |<-- Set-Cookie: session_hint=1 ----|
  |                             |<-- { accessToken, user } ---------|
  |                             |                                   |
  |                             |-- Store accessToken in memory     |
  |                             |-- isAuthReady = true              |
  |                             |-- Redirect to /event-types        |
```

## 3. Logout Flow

```text
User                      Client (React)                       Backend API
  |                             |                                   |
  |-- Click "Logout" ---------->|                                   |
  |                             |-- POST /auth/logout ------------->|
  |                             |                                   |-- Revoke refresh_token in DB
  |                             |<-- Clear-Cookie: refresh_token ---|
  |                             |<-- Clear-Cookie: session_hint ----|
  |                             |                                   |
  |                             |-- Clear accessToken from memory   |
  |                             |-- Clear React Query cache         |
  |                             |-- Clear session_hint client-side  |
  |                             |-- Redirect to /login              |
```

## 4. Token Refresh during API Call (401 Retry)

```text
Client (React)                                         Backend API
      |                                                     |
      |-- GET /users/me (Bearer expired_token) ------------>|
      |                                                     |-- Token expired
      |<-- 401 Unauthorized --------------------------------|
      |                                                     |
      |-- Intercept 401 response                            |
      |-- POST /auth/refresh (Cookie: refresh_token) ------>|
      |                                                     |-- Validate refresh_token
      |                                                     |-- Generate new tokens
      |                                                     |<-- Set-Cookie: refresh_token (new)
      |<-- { accessToken: new_token } ----------------------|
      |                                                     |
      |-- Update memory accessToken                         |
      |-- Retry GET /users/me (Bearer new_token) ---------->|
      |<-- 200 OK (data) -----------------------------------|
```

## 5. The `session_hint` Cookie

The `session_hint` cookie is a non-httpOnly cookie set by the backend alongside the `refresh_token`.

- **What it is**: A fast, synchronous UI hint. It simply tells the frontend: "The user _probably_ has an active session."
- **What it is NOT**: It is not a security token. It contains no sensitive data.
- **Why it is safe**: Even if a user manually sets `session_hint=1`, it does not grant them access. The Next.js middleware might let them view the dashboard structure, but all sensitive data requires a valid `accessToken` or a valid `refresh_token` to obtain one. The hydration process will immediately fail, clearing the hint and redirecting them to login.

## 6. Access Token in Memory Only

The `accessToken` is stored exclusively in the Zustand store (memory).

- **Security**: This mitigates XSS attacks because the token cannot be read from `localStorage` or `sessionStorage` by malicious scripts.
- **Trade-off**: On hard reload, the token is lost. The frontend must hit `/auth/session` using the `httpOnly` `refresh_token` to get a new `accessToken` before it can make authenticated API calls. The `session_hint` and layout skeleton are used to mask the UI latency during this process.

## 7. Middleware Guard and Limitations

The Next.js middleware guards protected routes based _only_ on the presence of the `session_hint` cookie.

- **Benefit**: It prevents unauthenticated users from seeing a brief flash of the dashboard layout before being redirected.
- **Limitation**: It does not cryptographically verify the session. If the `refresh_token` has expired but the `session_hint` remains (or was manually injected), the middleware will allow the request through. The React application will then attempt to hydrate, receive a 401 from `/auth/session`, and perform a clean redirect to login.

## 8. Known Edge Cases

- **Expired Refresh Token with Valid Hint**: The user hard reloads. Middleware allows the request. The UI shows the skeleton layout. The `/auth/session` request fails with 401. The frontend catches this, clears the `session_hint` cookie, and redirects to `/login`.
- **Logout Network Failure**: If the `POST /auth/logout` call fails due to a network error, the frontend will still clear its memory, clear the query cache, clear the `session_hint` client-side, and redirect to `/login`. The user is effectively logged out of the frontend, and the backend refresh token will naturally expire.
- **Hydration Mismatches**: A mismatch could occur if the server renders user-specific data (like a username) that the client does not yet have. To prevent this, auth-dependent components (like `Sidebar` and `UserAvatarDropdown`) are rendered on the client. The `session_hint` guarantees that these components wait for hydration before rendering their data.
