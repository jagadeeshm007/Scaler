# Scaler — Scheduling Platform (Cal.com Clone)

A full-stack scheduling/booking web application that replicates Cal.com's design and user experience. Built as a Scaler SDE Fullstack Assignment.

## 1. Project Overview

A highly robust, production-ready scheduling platform. Features dynamic availability rules, robust timezone handling, double-booking prevention, and full integration with external calendars (Google, Outlook) and conferencing tools (Google Meet, Zoom, MS Teams).

> 📄 **See the detailed [Backend Implementation Plan](file:///home/jagadeesh/Desktop/task/Scaler/docs/backend-implementation-plan.md) for architectural specifics.**

## 2. Monorepo Structure

```
Scaler/
├── App/                  # Next.js 15 App Router + Tailwind v4 + shadcn/ui
├── server/               # Express 4.x + Prisma + PostgreSQL
├── packages/
│   └── types/            # Shared Zod schemas and TS interfaces
├── task/ref/             # UI reference screenshots (Cal.com)
├── .cursor/rules/        # Project conventions
└── CLAUDE.md             # This file
```

**The `packages/types/` Contract**: This is the most critical piece of the architecture. Both `server/` and `App/` depend on `@scaler/types`. It contains Zod schemas that are used by the backend for API validation and by the frontend for form validation. The inferred TS types ensure the frontend always knows exactly what shape the API returns. No guessing, no `any`.

## 3. Dev Setup

```bash
# 1. Install dependencies across all workspaces
pnpm install

# 2. Environment setup
cp server/.env.example server/.env
# (Fill in DATABASE_URL and ENCRYPTION_KEY)

# 3. Database
cd server
npx prisma generate
npx prisma db push
npx prisma db seed

# 4. Run development servers (in separate terminals)
cd server && npm run dev    # http://localhost:4000
cd App && npm run dev       # http://localhost:3000
```

## 4. Architecture Decisions

- **Express 4.x (Backend)**: Chosen over Next.js API routes for stricter architectural layering (Routes → Controllers → Services → DB) and better background job handling.
- **Prisma + Supabase**: Strongly typed ORM paired with a connection-pooled PostgreSQL instance.
- **Dynamic App Store**: Integrations are NOT hardcoded in `.env`. They are defined in the database, allowing admin to add new OAuth providers without code deploys. Credentials are encrypted at rest via AES-256-GCM.
- **TanStack Query + Zustand (Frontend)**: Server state is managed by React Query. Client UI state (like auth bypass) is managed by Zustand.
- **Zod Validation**: Used everywhere. Middlewares validate requests before they hit controllers. React Hook Form validates inputs before they hit network.
- **Auth Bypass**: Full JWT implementation exists, but frontend automatically logs in as the seeded default user to meet assignment requirements.

## 5. Full-Stack Type Safety

All endpoint request/response shapes are defined in `packages/types/src/schemas/`. Backend controllers don't need to manually type `req.body` because the validation middleware infers it from the schema. Frontend API hooks get perfect autocompletion for responses.

## 6. Rules Index

- `project.mdc` — Global conventions, naming, error/date handling, constants.
- `backend.mdc` — Layered architecture, Prisma rules, Express rules.
- `frontend.mdc` — Next.js rules, strict UI/UX guidelines from reference screenshots.
- `testing.mdc` — Arrange-Act-Assert, mocking boundaries, coverage targets (Vitest, Supertest).
- `performance.mdc` — Query budgets, N+1 prevention, Core Web Vitals targets.
- `git.mdc` — Conventional commits, branch strategy, husky hooks.

## 7. Integration Status

| Provider          | Purpose             | Status  |
| ----------------- | ------------------- | ------- |
| Google Calendar   | Sync + Conflicts    | Planned |
| Google Meet       | Video Links         | Planned |
| Microsoft Outlook | Sync + Conflicts    | Planned |
| Microsoft Teams   | Video Links         | Planned |
| Zoom              | Video Links         | Planned |
| SMTP              | Email Notifications | Planned |

## 8. Implementation Status

- [x] Phase 0: Project Memory & Rules Setup
- [x] Phase 1: Backend Foundation
- [x] Phase 2: Auth Module
- [x] Phase 3: Event Types Module
- [x] Phase 4: Availability Module
- [x] Phase 5: Booking Module
- [x] Phase 6: Integrations Module
- [x] Phase 7: User/Profile Module
- [x] Phase 8: Database Seed
- [ ] Phase 8.5: Backend Audit & Testing
- [ ] Phase 9: Frontend Implementation

## 9. Known Constraints & Assumptions

- Assignment specifies "No Login Required" for admin side. We assume a default seeded user (`jagadeesh.m@deeptaai.com`) exists and is automatically authenticated by the frontend.
- Dates are strictly UTC in DB. Timezone conversion happens at the edge/frontend.
- Cal.com reference UI is the single source of truth for design.

## 10. Performance Budgets

- **DB Queries**: 95p < 100ms. Zero N+1 queries.
- **API Response**: 95p < 200ms (reads), < 500ms (writes).
- **Slot Calculation**: < 100ms per day.
- **Frontend LCP**: < 2.5s (Target < 2.0s for public booking).
- **Initial JS Bundle**: < 150kb gzipped.

## 11. DO NOT List (Top 10 Sins)

1. **NEVER** use `any` or `@ts-ignore`.
2. **NEVER** write a controller that talks directly to Prisma.
3. **NEVER** return `password_hash` or unencrypted tokens from an API.
4. **NEVER** use `moment.js` — only `date-fns` and `date-fns-tz`.
5. **NEVER** store integration OAuth credentials in `.env`.
6. **NEVER** commit secrets, `.env` files, or `console.log` statements.
7. **NEVER** fetch data without a loading skeleton and error boundary.
8. **NEVER** hardcode magic strings/numbers — use `constants.ts`.
9. **NEVER** use inline styles or raw CSS — use Tailwind utilities.
10. **NEVER** skip pagination on a list query.
