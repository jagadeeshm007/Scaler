# Scaler Authentication Flow

This document describes the current authentication architecture in the Scaler platform (Next.js 16 + Express JWT).

## Architecture overview

| Layer                         | Responsibility                                                                                            |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- |
| `App/proxy.ts`                | Optimistic route guard — redirects based on `refresh_token` cookie presence only                          |
| `App/lib/dal.ts`              | **Security boundary** — `verifySession()` validates session via backend, redirects to `/login` on failure |
| `App/actions/auth.actions.ts` | Login/register/logout server actions — sets httpOnly cookies on the Next.js origin                        |
| `App/app/api/auth/*`          | Same-origin BFF routes for client token refresh and logout                                                |
| `App/lib/api/`                | Axios clients — `client` (browser) and `server` (RSC / actions / route handlers)                          |
| `App/store/auth.store.ts`     | In-memory `accessToken` only (Zustand)                                                                    |
| Express `/api/v1/auth/*`      | Source of truth for credentials, refresh rotation, and session validation                                 |

> **Next.js 16 note:** `middleware.ts` was renamed to `proxy.ts`. The proxy is **not** a security boundary — always enforce auth in the DAL (`verifySession`) and on the Express API.

## 1. Hard reload sequence

```text
Browser                    proxy.ts              Server (RSC)                    Client                     Express API
  |                           |                       |                            |                            |
  |-- GET /event-types ------>|                       |                            |                            |
  |  Cookie: refresh_token    |                       |                            |                            |
  |                           |-- has refresh_token?  |                            |                            |
  |                           |   no → /login         |                            |                            |
  |                           |   yes → continue ---->|                            |                            |
  |                           |                       |-- verifySession()          |                            |
  |                           |                       |-- GET /auth/session ------>|--------------------------->|
  |                           |                       |   (axios, Cookie header)   |                            |
  |                           |                       |<-- accessToken + user -----|<---------------------------|
  |                           |                       |-- render layout + pages    |                            |
  |                           |                       |-- AuthTokenBridge -------->|-- set accessToken (memory)|
  |<---------------------------|-----------------------|----------------------------|                            |
  |                           |                       |                            |-- TanStack Query enabled   |
  |                           |                       |                            |-- api.get (Bearer token) ->|
```

`GET /auth/session` validates the refresh token **without rotating it**. Token rotation happens only on `POST /auth/refresh`.

## 2. Login flow

```text
User                 login/page.tsx          loginAction (server)           Express API              Browser cookies
  |                        |                        |                          |                         |
  |-- submit form -------->|                        |                          |                         |
  |                        |-- Server Action ------>|                          |                         |
  |                        |                        |-- POST /auth/login ----->|                         |
  |                        |                        |<-- Set-Cookie + body ----|                         |
  |                        |                        |-- set refresh_token -----|------------------------>|
  |                        |                        |-- set session_hint -------|------------------------>|
  |                        |<-- redirect /event-types                          |                         |
```

Login uses a **server action** so the refresh token is stored on the Next.js origin (`localhost:3000`), not the API origin (`localhost:4000`). This is required for RSC session verification.

## 3. Logout flow

```text
User UI                logoutAction / localApi        Express API           Cookies
  |                            |                          |                    |
  |-- Logout ----------------->|                          |                    |
  |                            |-- POST /auth/logout ----->|                    |
  |                            |-- clear cookies ----------|------------------->|
  |                            |-- redirect /login        |                    |
```

Client-side 401 handling calls `POST /api/auth/logout` (same-origin) to clear httpOnly cookies before redirecting.

## 4. Token refresh on 401

```text
Browser axios client                         Next.js route              Express API
      |                                            |                         |
      |-- GET /users/me (expired Bearer) --------->|                         |
      |<-- 401 ------------------------------------|                         |
      |-- POST /api/auth/refresh ----------------->|                         |
      |                                            |-- POST /auth/refresh -->|
      |                                            |<-- new refresh_token ---|
      |                                            |-- update cookies        |
      |<-- { accessToken } ------------------------|                         |
      |-- retry original request ------------------|------------------------>|
```

The browser **never** calls `POST /auth/refresh` on the API origin directly. Refresh tokens live on the Next.js cookie domain; the BFF route forwards them.

## 5. Cookie reference

### `refresh_token` (httpOnly, `path=/`, `sameSite=lax`)

- Set by login server action or refresh BFF route
- Used by `verifySession()`, `refreshAuthSession()`, and logout
- **This is what `proxy.ts` checks** for route redirects

### `session_hint` (non-httpOnly, `path=/`)

- UI hint only — cleared client-side on logout via `clearSessionHint()`
- **Not used by `proxy.ts`** (prevents redirect loops when hint is stale)

## 6. Access token in memory

The `accessToken` is stored exclusively in Zustand (`auth.store.ts`).

- **Security:** mitigates XSS — token is not in `localStorage`
- **Trade-off:** lost on hard reload; restored via `verifySession()` → `AuthTokenBridge` in the authenticated layout
- **Client queries:** gated by `useAuthReady()` until the bridge sets the token

## 7. API client layout

```text
App/lib/api/
├── errors.ts          # ApiError, getErrorMessage, parseApiErrorBody
├── parse-response.ts  # unwrapApiData<T>()
├── types.ts           # RequestOptions
├── axios.client.ts    # Browser axios + 401 interceptor + localApi
├── axios.server.ts    # Server-only axios instance
├── client.ts          # Browser exports (import via @/lib/api)
├── server.ts          # serverApi (import via @/lib/api.server)
├── auth.server.ts     # loginWithCredentials, getSessionWithRefreshToken, etc.
└── auth.ts            # Client auth helpers (login, logout, getSession)

App/lib/api.ts         → re-exports client surface
App/lib/api.server.ts  → re-exports serverApi as api
```

**Rules:**

- Client components / hooks → `import { api } from '@/lib/api'`
- Server Components / actions / route handlers → `import { api } from '@/lib/api.server'`
- No raw `fetch()` in application code — use axios wrappers
- Same-origin auth routes → `INTERNAL_API` in `lib/constants/internal-api.ts`

## 8. Known edge cases

- **Expired refresh token:** `verifySession()` clears cookies and redirects to `/login`. Proxy also blocks protected routes without `refresh_token`.
- **Logout network failure:** Server action and client store always clear local cookies/state; user is logged out on the frontend.
- **Cross-origin cookies:** Never rely on API-origin cookies in the browser. All auth cookie writes go through server actions or `/api/auth/*` routes.
- **Assignment bypass endpoint:** `POST /auth/bypass` exists on the backend but is **not** called automatically. Use `/login` with seeded credentials.
