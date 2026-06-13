# Frontend Implementation Plan

> **Source of truth for all frontend decisions. Read before writing any component.**
> Design tokens: [docs/design-tokens.md](./design-tokens.md)

---

## 1. Tech Stack — Final Decisions

### Core Framework

**`next@15.x`**

- App Router, React Server Components, streaming, View Transitions API
- Replaces nothing — this IS the framework
- Used for: routing, server components, image optimization, font optimization

**`typescript@5.x`** (strict mode)

- `strict: true`, `noUncheckedIndexedAccess: true`
- No `any`, no `@ts-ignore`

**`react@19.x`** + **`react-dom@19.x`**

- Required peer dep for Next.js 15
- `useTransition` for loading states during navigation

### Styling

**`tailwindcss@4.x`** + **`@tailwindcss/postcss@4.x`**

- CSS-first configuration via `@theme { }` in `globals.css` — no `tailwind.config.js`
- `@import "tailwindcss"` in globals.css
- Replaces all CSS modules, styled-components, inline styles

**`shadcn/ui`** (via CLI: `npx shadcn@latest init`)

- Components managed by CLI, live in `components/ui/`, never edited manually
- Style: `new-york`, base color: `neutral`
- Exact components to install (see Section 13)

### State Management

**`@tanstack/react-query@5.x`**

- All server state (API data): fetching, caching, background refetch, optimistic updates
- `@tanstack/react-query-devtools` in development
- Replaces: SWR, Redux Toolkit Query, manual `useEffect` fetching

**`zustand@5.x`**

- All client UI state: auth token (in memory), sidebar open/close, theme
- Replaces: React Context for global state, Redux for non-server state
- No persistence except theme preference

**`nuqs@2.x`**

- URL search param state: booking filters, pagination, date selection on booking page
- `NuqsAdapter` wraps root layout
- Replaces: manual `useSearchParams` + `router.replace` boilerplate

### Forms

**`react-hook-form@7.x`** + **`@hookform/resolvers@3.x`**

- All forms: uncontrolled inputs, performance, validation
- Every form uses `zodResolver`

**`zod`** — consumed from `@scaler/types` workspace package

- Schemas shared with backend. Import from `@scaler/types` not from `zod` directly for form schemas
- Replaces all manual validation logic

### Date / Time

**`date-fns@4.x`**

- All date arithmetic, formatting, comparison
- Replaces: `moment.js` (banned), `dayjs`, native Date manipulation

**`date-fns-tz@3.x`**

- Timezone conversion (UTC to user timezone for display)
- `toZonedTime`, `formatInTimeZone` for all time display

**`react-day-picker@9.x`**

- Calendar widget in booking page and availability date override picker
- Consumed indirectly via shadcn `Calendar` component (shadcn wraps react-day-picker v9)
- Styled via `classNames` prop with Tailwind utilities

### Animations

**`motion@11.x`** (formerly framer-motion, same library, new package name)

- Component-level animations: Dialog open/close, Sheet slide-in, booking form slide-in, time slot stagger
- Use `m.*` components inside `LazyMotion` with `domAnimation` feature set for minimal bundle size
- Replaces: CSS keyframes for complex multi-step animations

**CSS View Transitions API** (via `experimental.viewTransition: true` in `next.config.ts`)

- Page-level route transitions: crossfade between dashboard pages
- Zero JavaScript cost, all browsers supported in 2026
- Replaces: Framer Motion `AnimatePresence` for page transitions (which is complex in App Router)

**Tailwind `transition-*` utilities**

- Hover states, simple show/hide, color transitions
- Replaces: Framer Motion for anything that can be done with CSS

### UI Utilities

**`lucide-react@latest`**

- All icons. Never use emoji as icons, never use other icon libraries alongside
- Tree-shaken: import individual icons only

**`next/font`** (built-in)

- Inter font via `next/font/google`. Zero layout shift, self-hosted

**`sonner@2.x`**

- Toast notifications (success, error, loading states)
- `<Toaster />` in root layout

**`next-themes@0.4.x`**

- System/Light/Dark theme switching
- `ThemeProvider` in root layout, `dark` class on `<html>`
- Persists to `localStorage`

**`clsx@2.x`** + **`tailwind-merge@3.x`** (installed by shadcn as `cn` utility)

- Conditional class merging. Always use `cn()` from `lib/utils.ts`

---

## 2. Project Structure — Complete File Tree

The `App/` directory starts empty. This is the complete target structure.

```
App/
├── package.json                          # Next.js 15 workspace package
├── next.config.ts                        # experimental.viewTransition, images
├── tsconfig.json                         # strict TypeScript config
├── postcss.config.mjs                    # @tailwindcss/postcss
├── components.json                       # shadcn/ui configuration
├── .env.example                          # public env vars template
│
├── app/
│   ├── globals.css                       # @import "tailwindcss", @theme tokens, base styles (SC)
│   ├── layout.tsx                        # Root layout: fonts, Providers, Toaster (SC)
│   ├── not-found.tsx                     # 404 page (SC)
│   ├── providers.tsx                     # CC: QueryClientProvider + NuqsAdapter + ThemeProvider
│   │
│   ├── (unauthorised)/
│   │   ├── layout.tsx                    # Minimal layout: no sidebar, no auth guard (SC)
│   │   ├── login/
│   │   │   └── page.tsx                  # Login form page (CC - RHF form)
│   │   └── signup/
│   │       └── page.tsx                  # Register form page (CC - RHF form)
│   │
│   ├── (authorised)/
│   │   ├── layout.tsx                    # CC: auth guard + sidebar + mobile header
│   │   │
│   │   ├── event-types/
│   │   │   ├── page.tsx                  # SC: prefetch event types, render EventTypeList
│   │   │   ├── loading.tsx               # SC: skeleton for event type list
│   │   │   ├── error.tsx                 # CC: error boundary for event types route
│   │   │   ├── new/
│   │   │   │   └── page.tsx              # CC: dialog-style create event type page
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           ├── page.tsx          # SC: prefetch event type, render EventTypeForm
│   │   │           ├── loading.tsx       # SC: skeleton for edit form
│   │   │           └── error.tsx         # CC: error boundary for edit route
│   │   │
│   │   ├── bookings/
│   │   │   ├── page.tsx                  # SC: render BookingList with HydrationBoundary
│   │   │   ├── loading.tsx               # SC: booking list skeleton
│   │   │   └── error.tsx                 # CC: error boundary
│   │   │
│   │   ├── availability/
│   │   │   ├── page.tsx                  # SC: prefetch schedules, render ScheduleList
│   │   │   ├── loading.tsx               # SC: schedule list skeleton
│   │   │   ├── error.tsx                 # CC: error boundary
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # SC: prefetch schedule by id, render ScheduleEditor
│   │   │       ├── loading.tsx           # SC: editor skeleton
│   │   │       └── error.tsx             # CC: error boundary
│   │   │
│   │   ├── apps/
│   │   │   ├── page.tsx                  # SC: prefetch integrations, render IntegrationList
│   │   │   ├── loading.tsx               # SC: integration list skeleton
│   │   │   └── error.tsx                 # CC: error boundary
│   │   │
│   │   └── settings/
│   │       ├── page.tsx                  # SC: settings overview grid
│   │       ├── loading.tsx               # SC: settings grid skeleton
│   │       ├── profile/
│   │       │   ├── page.tsx              # SC: prefetch user, render ProfileForm
│   │       │   ├── loading.tsx           # SC: form skeleton
│   │       │   └── error.tsx             # CC: error boundary
│   │       └── general/
│   │           ├── page.tsx              # SC: render GeneralSettingsForm (CC)
│   │           └── loading.tsx           # SC: form skeleton
│   │
│   └── [username]/
│       └── [slug]/
│           ├── page.tsx                  # SC: fetch event type server-side, render booking UI
│           ├── loading.tsx               # SC: booking page skeleton
│           ├── error.tsx                 # CC: booking page error (not found, etc.)
│           └── confirmed/
│               ├── page.tsx              # SC: fetch booking by id, render confirmation card
│               └── loading.tsx           # SC: confirmation skeleton
│
├── components/
│   ├── ui/                               # shadcn managed — never edit manually
│   │
│   ├── layout/
│   │   ├── sidebar.tsx                   # CC: desktop persistent sidebar with nav items
│   │   ├── mobile-header.tsx             # CC: mobile top bar (logo + search + avatar)
│   │   ├── mobile-bottom-nav.tsx         # CC: fixed bottom nav bar + FAB
│   │   └── page-transition.tsx           # CC: motion wrapper for component-level transitions
│   │
│   ├── event-types/
│   │   ├── event-type-list.tsx           # CC: list container, uses useEventTypes query
│   │   ├── event-type-card.tsx           # CC: single row with toggle, actions
│   │   ├── event-type-actions.tsx        # CC: three-dot DropdownMenu (Edit/Duplicate/Delete)
│   │   ├── event-type-form.tsx           # CC: multi-section form with RHF + zodResolver
│   │   ├── add-event-type-dialog.tsx     # CC: modal for quick create (title/URL/duration)
│   │   └── event-type-skeleton.tsx       # SC: pulsing row placeholders
│   │
│   ├── bookings/
│   │   ├── booking-list.tsx              # CC: infinite query list grouped by date
│   │   ├── booking-card.tsx              # CC: single booking row
│   │   ├── booking-filters.tsx           # CC: tab bar using nuqs for filter state
│   │   ├── booking-detail-panel.tsx      # CC: Sheet component with full booking info
│   │   ├── booking-action-menu.tsx       # CC: three-dot dropdown with all booking actions
│   │   ├── cancel-booking-dialog.tsx     # CC: reason textarea + confirm dialog
│   │   └── booking-skeleton.tsx          # SC: pulsing row placeholders
│   │
│   ├── availability/
│   │   ├── schedule-list.tsx             # CC: list of schedule cards
│   │   ├── schedule-card.tsx             # CC: single schedule row with actions
│   │   ├── schedule-editor.tsx           # CC: full editor (day rows + overrides + timezone)
│   │   ├── day-row.tsx                   # CC: single day toggle + time range
│   │   ├── time-range-picker.tsx         # CC: start/end time input pair
│   │   ├── date-override-picker.tsx      # CC: calendar popup for adding overrides
│   │   ├── date-override-list.tsx        # CC: list of existing overrides
│   │   └── timezone-selector.tsx         # CC: searchable timezone combobox
│   │
│   ├── booking-page/
│   │   ├── event-info-panel.tsx          # SC: host avatar + event details (static)
│   │   ├── calendar-picker.tsx           # CC: react-day-picker calendar, date → URL param
│   │   ├── time-slot-list.tsx            # CC: fetches slots via useSlots, renders buttons
│   │   ├── booking-form.tsx              # CC: name/email/notes form, useCreateBooking
│   │   ├── booking-confirmed.tsx         # CC: success state with add-to-calendar
│   │   └── slot-skeleton.tsx             # SC: 6 placeholder slot buttons
│   │
│   ├── integrations/
│   │   ├── integration-list.tsx          # CC: category tabs + app cards
│   │   ├── integration-card.tsx          # CC: app row with connect/disconnect
│   │   └── integration-skeleton.tsx      # SC: placeholder cards
│   │
│   ├── settings/
│   │   ├── settings-nav.tsx              # CC: left sidebar navigation for settings pages
│   │   ├── settings-card.tsx             # SC: clickable card for settings overview grid
│   │   ├── profile-form.tsx              # CC: avatar + RHF form for user profile
│   │   └── general-settings-form.tsx     # CC: language/timezone/format settings
│   │
│   └── shared/
│       ├── async-boundary.tsx            # CC: ErrorBoundary + Suspense combined
│       ├── empty-state.tsx               # SC: centered icon + title + description
│       ├── page-header.tsx               # SC: title + description + action slot
│       ├── confirm-dialog.tsx            # CC: generic confirm/cancel dialog
│       ├── loading-skeleton.tsx          # SC: generic pulsing rectangle
│       └── avatar-fallback.tsx           # SC: colored initial fallback for avatar
│
├── hooks/
│   ├── queries/
│   │   ├── use-event-types.ts            # GET /event-types
│   │   ├── use-event-type.ts             # GET /event-types/:id
│   │   ├── use-bookings.ts               # GET /bookings (with filter params)
│   │   ├── use-booking.ts                # GET /bookings/:id
│   │   ├── use-availability.ts           # GET /availability (schedules list)
│   │   ├── use-schedule.ts               # GET /availability/:id
│   │   ├── use-slots.ts                  # GET /slots?eventTypeId&date&timezone
│   │   ├── use-public-event-type.ts      # GET /public/:username/:slug
│   │   ├── use-integrations.ts           # GET /integrations
│   │   └── use-user-profile.ts           # GET /users/me
│   │
│   ├── mutations/
│   │   ├── use-create-event-type.ts      # POST /event-types
│   │   ├── use-update-event-type.ts      # PATCH /event-types/:id
│   │   ├── use-delete-event-type.ts      # DELETE /event-types/:id
│   │   ├── use-create-booking.ts         # POST /bookings (public, with idempotency key)
│   │   ├── use-cancel-booking.ts         # PATCH /bookings/:id/status {status: CANCELLED}
│   │   ├── use-create-schedule.ts        # POST /availability
│   │   ├── use-update-schedule.ts        # PUT /availability/:id
│   │   ├── use-delete-schedule.ts        # DELETE /availability/:id
│   │   ├── use-connect-integration.ts    # GET /integrations/:slug/connect (redirect)
│   │   ├── use-disconnect-integration.ts # DELETE /integrations/:slug
│   │   └── use-update-profile.ts         # PATCH /users/me
│   │
│   ├── use-debounce.ts                   # generic value debounce hook
│   ├── use-media-query.ts                # responsive breakpoint detection
│   ├── use-timezone.ts                   # Intl.DateTimeFormat auto-detect + override
│   └── use-pagination.ts                 # rows-per-page + page cursor state
│
├── lib/
│   ├── api.ts                            # typed fetch client (get/post/put/patch/del)
│   ├── query-client.ts                   # TanStack Query factory (server + client)
│   ├── query-keys.ts                     # typed query key factory
│   ├── routes.ts                         # typed internal route constants
│   ├── endpoints.ts                      # typed API endpoint constants
│   ├── format.ts                         # date/time/duration formatters (date-fns + tz)
│   └── utils.ts                          # cn() + misc helpers
│
├── store/
│   ├── auth.store.ts                     # Zustand: user, accessToken, isAuthenticated
│   └── ui.store.ts                       # Zustand: sidebarOpen, theme
│
└── types/
    └── index.ts                          # re-export from @scaler/types
```

---

## 3. Routing Architecture

| Route                          | Type | Auth | Data fetched         | Suspense                             | Error.tsx |
| ------------------------------ | ---- | ---- | -------------------- | ------------------------------------ | --------- |
| `/login`                       | CC   | No   | none                 | No                                   | No        |
| `/signup`                      | CC   | No   | none                 | No                                   | No        |
| `/event-types`                 | SC   | Yes  | event types list     | `<EventTypeList>`                    | Yes       |
| `/event-types/new`             | CC   | Yes  | none (form only)     | No                                   | No        |
| `/event-types/[id]/edit`       | SC   | Yes  | event type by id     | `<EventTypeForm>`                    | Yes       |
| `/bookings`                    | SC   | Yes  | bookings (paginated) | `<BookingList>`                      | Yes       |
| `/availability`                | SC   | Yes  | schedules list       | `<ScheduleList>`                     | Yes       |
| `/availability/[id]`           | SC   | Yes  | schedule by id       | `<ScheduleEditor>`                   | Yes       |
| `/apps`                        | SC   | Yes  | integrations list    | `<IntegrationList>`                  | Yes       |
| `/settings`                    | SC   | Yes  | none (static grid)   | No                                   | No        |
| `/settings/profile`            | SC   | Yes  | user/me              | `<ProfileForm>`                      | Yes       |
| `/settings/general`            | SC   | Yes  | user/me              | `<GeneralSettingsForm>`              | Yes       |
| `/[username]/[slug]`           | SC   | No   | event type (public)  | `<CalendarPicker>`, `<TimeSlotList>` | Yes       |
| `/[username]/[slug]/confirmed` | SC   | No   | booking by id        | `<BookingConfirmedCard>`             | Yes       |

**Route conflict**: The `[username]/[slug]` catch-all at root level and `(authorised)` route groups coexist because Next.js resolves route groups first. Named routes (`/bookings`, `/event-types`, etc.) match before dynamic segments.

**Auth guard**: The `(authorised)/layout.tsx` is a CC that reads `auth.store`. On mount, if `isAuthenticated` is false, it calls `POST /auth/bypass` to log in as the seeded default user, then stores the token. This satisfies the "No Login Required" assignment requirement while preserving full JWT auth for future use.

---

## 4. Data Fetching Strategy

### Server Components (prefetch on server, HydrationBoundary to client)

Pages where initial data is critical for SEO or first paint:

**`/event-types/page.tsx`** (SC)

```typescript
const queryClient = getQueryClient();
await queryClient.prefetchQuery(queryKeys.eventTypes.list());
return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <EventTypeList />
  </HydrationBoundary>
);
```

**`/availability/page.tsx`** and **`/availability/[id]/page.tsx`** (SC) — same pattern.

**`/apps/page.tsx`** (SC) — prefetch integrations list.

**`/settings/profile/page.tsx`** (SC) — prefetch user profile.

### Client Components (TanStack Query only)

Pages/components that respond to user interaction or URL params:

- `BookingList` — filter tab selection drives query refetch via nuqs params
- `TimeSlotList` — fetches when `?date=` param changes (user picks a day)
- `ScheduleEditor` — all edits are local state until Save

### Hybrid (Public Booking Page)

The most critical page — optimized for public performance:

```
/[username]/[slug]/page.tsx (SC)
  ├── Fetches event type + host info server-side (cacheable, 5min revalidate)
  ├── Renders <EventInfoPanel> (SC — pure display, no interactivity)
  ├── Renders <CalendarPicker> (CC — manages selected date in URL via nuqs)
  └── Renders <TimeSlotList> (CC — fetches slots when date changes)
       └── Renders <BookingForm> (CC — shown after slot selected)
```

The SC/CC boundary: `page.tsx` passes `eventType` and `host` as props to the `<CalendarPicker>` CC. The CC owns all interaction state. When a date is selected, it writes `?date=2026-06-24` to the URL (nuqs). `TimeSlotList` reads this param and calls `useSlots({ eventTypeId, date, timezone })`.

### Optimistic Updates

| Mutation                      | Optimistic action                        | Rollback trigger |
| ----------------------------- | ---------------------------------------- | ---------------- |
| Toggle event type `is_hidden` | `setQueryData` to flip boolean           | `onError`        |
| Toggle event type `is_active` | `setQueryData` to flip boolean           | `onError`        |
| Cancel booking                | `setQueryData` to set status `CANCELLED` | `onError`        |
| Update profile fields         | `setQueryData` with new values           | `onError`        |
| Delete event type             | `setQueryData` to filter out item        | `onError`        |

---

## 5. State Management Architecture

### Zustand stores

**`store/auth.store.ts`**

```typescript
interface AuthState {
  user: {
    id: string;
    email: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}
interface AuthActions {
  setAuth: (user: AuthState['user'], token: string) => void;
  logout: () => void;
  hydrate: () => Promise<void>; // calls POST /auth/bypass on first load
}
```

- `accessToken` stored in Zustand memory only — never `localStorage`, never `sessionStorage`
- `hydrate()` called once in `(authorised)/layout.tsx` on mount
- `hydrate()` calls `POST /auth/bypass` → stores returned user + token

**`store/ui.store.ts`**

```typescript
interface UIState {
  sidebarOpen: boolean;
  theme: 'system' | 'light' | 'dark';
}
interface UIActions {
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: UIState['theme']) => void;
}
```

- `theme` persisted to `localStorage` via Zustand persist middleware (key: `scaler-theme`)
- `sidebarOpen` not persisted — resets to closed on page reload on mobile

### URL state (nuqs)

| State                 | URL param          | Parser                                                                            | Used in                               |
| --------------------- | ------------------ | --------------------------------------------------------------------------------- | ------------------------------------- |
| Booking filter tab    | `?status=upcoming` | `parseAsStringLiteral(['upcoming','unconfirmed','recurring','past','cancelled'])` | BookingFilters, BookingList           |
| Booking page number   | `?page=1`          | `parseAsInteger.withDefault(1)`                                                   | BookingList                           |
| Selected booking date | `?date=2026-06-24` | `parseAsString`                                                                   | CalendarPicker → TimeSlotList         |
| Event types search    | `?q=`              | `parseAsString.withDefault('')`                                                   | EventTypeList (if search implemented) |

### TanStack Query cache lifetime

| Query             | Stale time        | Refetch on window focus              |
| ----------------- | ----------------- | ------------------------------------ |
| Event types list  | 30s               | Yes                                  |
| Single event type | 60s               | Yes                                  |
| Bookings list     | 0s (always fresh) | Yes                                  |
| Available slots   | 30s               | No (avoid interrupting booking flow) |
| Public event type | 5min              | No (public page, SSR cached)         |
| Schedules list    | 30s               | Yes                                  |
| Integrations      | 60s               | No                                   |
| User profile      | 60s               | Yes                                  |

---

## 6. Component Architecture Rules

### Server vs Client split (enforced)

A component is a **Server Component** unless it requires one of:

- `useState`, `useReducer`, `useContext`, `useEffect`
- Browser APIs (`window`, `document`, `navigator`, `Intl`)
- Event listeners on interactive elements (`onClick`, `onChange`)
- TanStack Query hooks (`useQuery`, `useMutation`)
- Zustand store access (`useAuthStore`, `useUIStore`)
- Motion/animation components
- `nuqs` hooks (`useQueryState`)

Everything else: Server Component.

### SC/CC annotations for key components

| Component                   | Type | Reason                                                   |
| --------------------------- | ---- | -------------------------------------------------------- |
| `page.tsx` (all routes)     | SC   | Data prefetch, no interaction                            |
| `loading.tsx` (all routes)  | SC   | Static markup only                                       |
| `error.tsx` (all routes)    | CC   | `useEffect` for error reporting, `reset()` callback      |
| `providers.tsx`             | CC   | QueryClientProvider, NuqsAdapter, ThemeProvider          |
| `sidebar.tsx`               | CC   | Zustand for sidebar state, `usePathname` for active item |
| `mobile-header.tsx`         | CC   | Hamburger button state                                   |
| `mobile-bottom-nav.tsx`     | CC   | `usePathname` for active item                            |
| `event-type-list.tsx`       | CC   | `useEventTypes` query                                    |
| `event-type-card.tsx`       | CC   | Toggle mutation, action menu state                       |
| `event-type-form.tsx`       | CC   | React Hook Form, create/update mutation                  |
| `add-event-type-dialog.tsx` | CC   | Dialog state, form, mutation                             |
| `booking-list.tsx`          | CC   | `useBookings` with nuqs filter params                    |
| `booking-card.tsx`          | CC   | Action menu state, detail panel trigger                  |
| `booking-filters.tsx`       | CC   | `useQueryState` for tab selection                        |
| `booking-detail-panel.tsx`  | CC   | Sheet open/close state                                   |
| `cancel-booking-dialog.tsx` | CC   | Form state, cancel mutation                              |
| `schedule-list.tsx`         | CC   | `useAvailability` query                                  |
| `schedule-editor.tsx`       | CC   | Complex local state, update mutation                     |
| `day-row.tsx`               | CC   | Toggle and time input state                              |
| `date-override-picker.tsx`  | CC   | Calendar open state, react-day-picker                    |
| `timezone-selector.tsx`     | CC   | Combobox state                                           |
| `event-info-panel.tsx`      | SC   | Pure display, data passed as props                       |
| `calendar-picker.tsx`       | CC   | nuqs date param, react-day-picker                        |
| `time-slot-list.tsx`        | CC   | `useSlots` query                                         |
| `booking-form.tsx`          | CC   | React Hook Form, create booking mutation                 |
| `booking-confirmed.tsx`     | CC   | Add-to-calendar buttons, clipboard                       |
| `integration-list.tsx`      | CC   | Category tabs state                                      |
| `integration-card.tsx`      | CC   | Connect/disconnect mutations                             |
| `profile-form.tsx`          | CC   | React Hook Form, update mutation                         |
| `settings-nav.tsx`          | CC   | `usePathname` for active item                            |
| `empty-state.tsx`           | SC   | Pure display                                             |
| `page-header.tsx`           | SC   | Pure display                                             |
| `async-boundary.tsx`        | CC   | ErrorBoundary is class component, needs `reset`          |

### No God Components — enforced splits

**EventTypesPage flow:**

```
page.tsx (SC) → prefetches → HydrationBoundary → EventTypeList (CC)
EventTypeList → renders → EventTypeCard (CC) × N
EventTypeCard → renders → EventTypeActions (CC) for action menu
```

**BookingPage flow:**

```
page.tsx (SC) → fetches event type → passes as props to:
  └── EventInfoPanel (SC) — pure display
  └── CalendarPicker (CC) — nuqs ?date=, month navigation
      └── On date select → TimeSlotList (CC) — useSlots query
          └── On slot select → BookingForm (CC) — useCreateBooking mutation
```

**AvailabilityEditor flow:**

```
page.tsx (SC) → prefetches schedule → HydrationBoundary → ScheduleEditor (CC)
ScheduleEditor → renders → DayRow (CC) × 7 → TimeRangePicker (CC)
ScheduleEditor → renders → DateOverrideList (CC)
ScheduleEditor → renders → DateOverridePicker (CC) — modal
ScheduleEditor → submits → useUpdateSchedule mutation
```

### Error Boundary placement

Every route segment `error.tsx` covers the entire route.

For client components that fetch data asynchronously:

```tsx
// components/shared/async-boundary.tsx
'use client';
import { ErrorBoundary } from 'react-error-boundary';
import { Suspense } from 'react';

export function AsyncBoundary({
  children,
  skeleton,
  fallback,
}: {
  children: React.ReactNode;
  skeleton: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <ErrorBoundary fallback={fallback ?? <ComponentError />}>
      <Suspense fallback={skeleton}>{children}</Suspense>
    </ErrorBoundary>
  );
}
```

Usage pattern:

```tsx
<AsyncBoundary skeleton={<SlotSkeleton />}>
  <TimeSlotList eventTypeId={eventType.id} />
</AsyncBoundary>
```

---

## 7. API Client Design

**`lib/api.ts`** — single fetch client, all components go through this.

```typescript
// Interface contract
class ApiClient {
  get<T>(path: string, options?: RequestInit): Promise<T>;
  post<T>(path: string, body: unknown, options?: RequestInit): Promise<T>;
  put<T>(path: string, body: unknown, options?: RequestInit): Promise<T>;
  patch<T>(path: string, body: unknown, options?: RequestInit): Promise<T>;
  del<T>(path: string, options?: RequestInit): Promise<T>;
}
```

Implementation rules:

- Base URL: `process.env.NEXT_PUBLIC_API_URL` (e.g., `http://localhost:4000/api/v1`)
- All methods return `Promise<T>` — unwrap from `{ success, data, message }` envelope
- On non-2xx: parse error body, throw `ApiError extends Error` with `status` and `code`
- Inject `Authorization: Bearer <token>` from `auth.store.getState().accessToken`
- 401 handling: call `POST /auth/refresh`, update store token, retry original request once. If refresh fails: call `auth.store.getState().logout()`, redirect to `/login`
- Request timeout: 15 seconds via `AbortController`
- No `axios` — native `fetch` only

**`lib/endpoints.ts`** — all API paths as typed constants:

```typescript
export const ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    bypass: '/auth/bypass',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  users: {
    me: '/users/me',
  },
  eventTypes: {
    list: '/event-types',
    create: '/event-types',
    byId: (id: string) => `/event-types/${id}`,
    update: (id: string) => `/event-types/${id}`,
    delete: (id: string) => `/event-types/${id}`,
    public: (username: string, slug: string) => `/public/${username}/${slug}`,
    publicList: (username: string) => `/public/${username}/event-types`,
  },
  availability: {
    list: '/availability',
    create: '/availability',
    byId: (id: string) => `/availability/${id}`,
    update: (id: string) => `/availability/${id}`,
    delete: (id: string) => `/availability/${id}`,
  },
  slots: '/slots',
  bookings: {
    list: '/bookings',
    create: '/bookings',
    byId: (id: string) => `/bookings/${id}`,
    status: (id: string) => `/bookings/${id}/status`,
  },
  integrations: {
    list: '/integrations',
    connect: (slug: string) => `/integrations/${slug}/connect`,
    callback: (slug: string) => `/integrations/${slug}/callback`,
    delete: (slug: string) => `/integrations/${slug}`,
  },
} as const;
```

**`lib/query-keys.ts`** — typed query key factory:

```typescript
export const queryKeys = {
  eventTypes: {
    all: () => ['event-types'] as const,
    list: () => ['event-types', 'list'] as const,
    byId: (id: string) => ['event-types', id] as const,
    public: (username: string, slug: string) => ['event-types', 'public', username, slug] as const,
  },
  bookings: {
    all: () => ['bookings'] as const,
    list: (filters: Record<string, unknown>) => ['bookings', 'list', filters] as const,
    byId: (id: string) => ['bookings', id] as const,
  },
  availability: {
    all: () => ['availability'] as const,
    list: () => ['availability', 'list'] as const,
    byId: (id: string) => ['availability', id] as const,
  },
  slots: {
    byDate: (eventTypeId: string, date: string, timezone: string) =>
      ['slots', eventTypeId, date, timezone] as const,
  },
  integrations: {
    all: () => ['integrations'] as const,
    list: () => ['integrations', 'list'] as const,
  },
  user: {
    me: () => ['user', 'me'] as const,
  },
} as const;
```

---

## 8. Forms Architecture

All forms use: `react-hook-form` + `zodResolver` + schemas from `@scaler/types`.

**Standard form pattern:**

```typescript
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEventTypeSchema, type CreateEventTypeInput } from '@scaler/types';

export function EventTypeForm() {
  const form = useForm<CreateEventTypeInput>({
    resolver: zodResolver(createEventTypeSchema.shape.body),
    defaultValues: { title: '', slug: '', duration_mins: 30, location_type: 'CAL_VIDEO' },
  });
  // ...
}
```

### Forms to build

| Form                   | Zod schema                         | Special behaviour                                     |
| ---------------------- | ---------------------------------- | ----------------------------------------------------- |
| `LoginForm`            | `loginSchema.shape.body`           | Auto-login via bypass on mount in (authorised) layout |
| `RegisterForm`         | `registerSchema.shape.body`        | Confirm password field (local schema extension only)  |
| `EventTypeForm`        | `createEventTypeSchema.shape.body` | Slug auto-generated from title with 500ms debounce    |
| `EventTypeForm` (edit) | `updateEventTypeSchema.shape.body` | Populated from existing event type                    |
| `CreateScheduleForm`   | `createScheduleSchema.shape.body`  | 7 day rows managed as field array                     |
| `UpdateScheduleForm`   | `updateScheduleSchema.shape.body`  | Day rows + date overrides as field arrays             |
| `BookingForm`          | `createBookingSchema.shape.body`   | timezone auto-detected via `useTimezone` hook         |
| `ProfileForm`          | `updateUserSchema.shape.body`      | Avatar URL set via upload (future: base64 or S3 URL)  |

### EventTypeForm slug field behaviour

1. `useWatch` on `title` field
2. `useDebounce(title, 500)` — 500ms after last keystroke
3. `slugify(debouncedTitle)` — lowercase, replace spaces with hyphens, strip special chars
4. Set `form.setValue('slug', generatedSlug)` unless user has manually edited slug
5. Track `isSlugManuallyEdited` in local state — once user edits slug field directly, stop auto-updating
6. Show preview: `<span className="text-muted-foreground">cal.com/username/</span><span>{watch('slug')}</span>`
7. Slug availability check: `useQuery` with `enabled: debouncedSlug.length > 1` — calls `GET /public/:username/:slug` and treats 404 as "available", 200 as "taken"
8. Show `<CheckCircle>` (green) for available, `<XCircle>` (red) for taken

---

## 9. Public Booking Page — Detailed Design

**Route**: `/[username]/[slug]`  
**Auth required**: No  
**This is the most performance-sensitive page.**

### Component tree

```
page.tsx (SC)
├── Fetch eventType + host from GET /public/:username/:slug
├── <EventInfoPanel> (SC, props: { host, eventType })
│   └── Avatar + host name + event title + duration + location + TimezoneSelector (CC)
├── <CalendarPicker> (CC, props: { eventType })
│   ├── useQueryState('date', parseAsString) — nuqs
│   ├── react-day-picker DayPicker component
│   ├── Fetch month availability for disabled dates
│   └── On day click: setDate(day) → URL updates → TimeSlotList re-fetches
└── <AsyncBoundary skeleton={<SlotSkeleton />}>
    └── <TimeSlotList> (CC, props: { eventTypeId, hostId })
        ├── useSlots({ eventTypeId, date, timezone })
        ├── useQueryState('date') — reads selected date
        └── On slot click: setSelectedSlot(slot) in local state
            └── <BookingForm> (CC) — slides in with motion
                ├── useCreateBooking mutation
                └── On success: router.push('/[username]/[slug]/confirmed?bookingId=X')
```

### Calendar section

- Use `shadcn Calendar` component (wraps react-day-picker v9)
- `mode="single"`, `selected={selectedDate}`, `onSelect={setDate}`
- `disabled`: dates before today + dates in the past
- `modifiers={{ available: availableDates, dot: datesWithBookings }}`
- `modifiersClassNames`: `available: 'bg-neutral-700'`, `dot: 'after:content-["•"] after:absolute after:bottom-1'`
- **Month availability fetch**: `useQuery` for `GET /slots?eventTypeId=X&date=[first-day-of-month]&timezone=Z` — determines which days have any available slots
- **On month change** (`onMonthChange`): fetch availability for new month
- **Loading state**: Calendar shows with `cursor-wait` while fetching month data
- **No past dates**: `disabled={(date) => date < startOfToday()}`

### Time slots section

- Appears after date is selected (via URL `?date=` param being non-null)
- Fetch: `GET /api/v1/slots?eventTypeId=X&date=YYYY-MM-DD&timezone=Z`
- `timezone`: `useTimezone()` hook — reads user's browser timezone via `Intl.DateTimeFormat().resolvedOptions().timeZone`, overrideable via `TimezoneSelector`
- Slot buttons: `w-full` bordered button, green dot, time text
- **12h/24h toggle**: local UI state stored in `useQueryState('fmt', parseAsStringLiteral(['12h','24h']))`
- **Loading skeleton**: 6 placeholder `<div className="h-10 rounded-md animate-pulse bg-neutral-800" />`
- **Empty state**: `<EmptyState icon={Clock} title="No available times" description="No slots available on this date. Please select another day." />`
- **Stagger animation**: each slot button uses `motion` with `initial={{ opacity: 0, y: 4 }}`, stagger 0.03s delay per item

### Booking form

- **Appears after slot click**: `motion` slide-in from right (`x: 20 → 0, opacity: 0 → 1, duration: 0.2s`)
- Selected time summary bar at top (date + time + duration badge)
- Fields: `Your name *`, `Email address *`, `Additional notes` (optional textarea)
- Back button: returns to slot list (clears `selectedSlot` local state, motion slide-out)
- Submit: `POST /api/v1/bookings` with `Idempotency-Key` header (generate via `crypto.randomUUID()`)
- Loading: button spinner, form fields `disabled`
- Success: redirect to `/[username]/[slug]/confirmed?bookingId=X`
- Error: inline `<p className="text-sm text-red-500">` below the form, form not reset

### Confirmation page

```
/[username]/[slug]/confirmed?bookingId=X
```

- Fetch booking by id: client-side via `useQuery` (bookingId from URL searchParam)
- `<motion.div>` green checkmark circle with draw animation (`pathLength: 0 → 1`)
- "This meeting is scheduled" heading (bold, centered)
- Details rows: What | When (timezone in parentheses) | Who (Host badge) | Where (link with external icon + copy button)
- "Add to calendar" row: Google Calendar link, Outlook link, ICS download (constructed from booking data)
- "Need to make a change? Reschedule or Cancel" text links
- "Back to bookings" link at top left

---

## 10. Animations & Transitions

### Page transitions (CSS View Transitions API — zero JS cost)

In `next.config.ts`:

```typescript
experimental: {
  viewTransition: true;
}
```

Sidebar nav links use a `TransitionLink` component:

```tsx
// components/layout/transition-link.tsx (CC)
'use client';
export function TransitionLink({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const onClick = (e: React.MouseEvent) => {
    if (!('startViewTransition' in document)) return;
    e.preventDefault();
    document.startViewTransition(() => {
      startTransition(() => router.push(href));
    });
  };
  return (
    <Link href={href} onClick={onClick} data-pending={isPending}>
      {children}
    </Link>
  );
}
```

CSS in `globals.css`:

```css
::view-transition-old(root) {
  animation: 120ms ease-in fade-out;
}
::view-transition-new(root) {
  animation: 160ms ease-out fade-in;
}
@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

### Component animations (motion library)

| Element                   | Animation                                                      | Spec                                          |
| ------------------------- | -------------------------------------------------------------- | --------------------------------------------- |
| Dialog/Modal open         | Scale + fade                                                   | `scale: 0.95→1, opacity: 0→1, 150ms ease-out` |
| Dialog/Modal close        | Scale + fade                                                   | `scale: 1→0.95, opacity: 1→0, 120ms ease-in`  |
| Sheet (mobile sidebar)    | Slide from left                                                | `x: -100%→0, 200ms ease-out`                  |
| Booking form appear       | Slide from right                                               | `x: 20→0, opacity: 0→1, 200ms ease-out`       |
| Time slot list            | Stagger children                                               | `opacity: 0→1, y: 4→0, 150ms, stagger: 30ms`  |
| Booking success checkmark | SVG path draw                                                  | `pathLength: 0→1, 600ms ease-in-out`          |
| Toast (sonner)            | Built-in — do not override                                     | —                                             |
| Dropdown menu             | Framer `AnimatePresence` not needed — shadcn handles via Radix | —                                             |

### Do NOT use motion for:

- Hover state color changes (Tailwind `transition-colors duration-150`)
- Simple conditional show/hide (conditional rendering + Tailwind)
- Skeleton shimmer (CSS `animate-pulse`)
- Anything on scroll or resize
- Nav item active state changes

### Respect reduced motion:

```typescript
// Always check in motion components
import { useReducedMotion } from 'motion/react';
const reduced = useReducedMotion();
const variants = reduced ? {} : { initial: ..., animate: ..., exit: ... };
```

---

## 11. Responsive Design Rules

### Breakpoints

| Name   | Min-width | Tailwind prefix      |
| ------ | --------- | -------------------- |
| mobile | 0px       | (default, no prefix) |
| sm     | 640px     | `sm:`                |
| md     | 768px     | `md:`                |
| lg     | 1024px    | `lg:`                |
| xl     | 1280px    | `xl:`                |

### Sidebar behaviour

| Viewport        | Behaviour                                           | Implementation                        |
| --------------- | --------------------------------------------------- | ------------------------------------- |
| Desktop (`lg:`) | Persistent, always visible, `w-64` (256px)          | CSS `flex-shrink-0`                   |
| Tablet (`md:`)  | Persistent, icon-only `w-16` (64px)                 | `hidden lg:block` → icon-only variant |
| Mobile (`< md`) | Hidden, opens as `<Sheet side="left">` on hamburger | `ui.store.sidebarOpen`                |

The layout structure:

```tsx
// (authorised)/layout.tsx
<div className="flex min-h-screen bg-neutral-950">
  <Sidebar className="hidden md:flex" /> {/* desktop */}
  <MobileHeader className="md:hidden" /> {/* mobile top bar */}
  <main className="flex-1 overflow-y-auto">{children}</main>
  <MobileBottomNav className="md:hidden" /> {/* mobile bottom bar */}
</div>
```

### Booking page layout

```tsx
<div className="flex flex-col lg:flex-row gap-0">
  <EventInfoPanel className="lg:w-[280px] lg:border-r border-neutral-800" />
  <CalendarPicker className="lg:flex-1 border-b lg:border-b-0 lg:border-r border-neutral-800" />
  <TimeSlotList className="lg:w-[280px]" />
</div>
```

### Event types page

| Viewport | Layout                                                        |
| -------- | ------------------------------------------------------------- |
| Desktop  | Full-width list (NOT grid) — each item is a horizontal row    |
| Tablet   | Same full-width list                                          |
| Mobile   | Same list, but inline actions replaced by three-dot menu only |

### Bookings page

| Viewport | Layout                                                                              |
| -------- | ----------------------------------------------------------------------------------- |
| Desktop  | Table-like rows with date column (200px) + content + actions visible                |
| Mobile   | Stacked card: title on top, date below, join button below, three-dot menu top-right |

---

## 12. Implementation Sequence

Files must be created in this order (no file may import from a file not yet created):

```
[1]  App/package.json                           — next@15, react@19, all deps
[2]  App/next.config.ts                         — experimental.viewTransition, images
[3]  App/tsconfig.json                          — strict TypeScript
[4]  App/postcss.config.mjs                     — @tailwindcss/postcss
[5]  App/.env.example                           — public env vars
[6]  App/components.json                        — shadcn configuration
[7]  App/app/globals.css                        — @import "tailwindcss", @theme tokens
[8]  App/lib/utils.ts                           — cn() helper (shadcn generates this)
[9]  App/types/index.ts                         — re-exports from @scaler/types
[10] App/lib/endpoints.ts                       — depends on nothing
[11] App/lib/query-keys.ts                      — depends on nothing
[12] App/lib/routes.ts                          — depends on nothing
[13] App/lib/format.ts                          — depends on: date-fns, date-fns-tz
[14] App/store/auth.store.ts                    — depends on: zustand
[15] App/store/ui.store.ts                      — depends on: zustand
[16] App/lib/api.ts                             — depends on: endpoints.ts, auth.store.ts
[17] App/lib/query-client.ts                    — depends on: @tanstack/react-query
[18] App/app/providers.tsx                      — depends on: query-client.ts, ui.store.ts, nuqs
[19] App/app/layout.tsx                         — depends on: providers.tsx, next/font, sonner
[20] App/app/not-found.tsx                      — depends on: components/ui/* (Button, Link)
[21] App/components/shared/empty-state.tsx      — depends on: lucide-react, utils.ts
[22] App/components/shared/page-header.tsx      — depends on: utils.ts
[23] App/components/shared/loading-skeleton.tsx — depends on: utils.ts
[24] App/components/shared/async-boundary.tsx   — depends on: react-error-boundary
[25] App/components/shared/confirm-dialog.tsx   — depends on: components/ui/dialog
[26] App/components/shared/avatar-fallback.tsx  — depends on: utils.ts
[27] App/components/layout/sidebar.tsx          — depends on: ui.store.ts, routes.ts, lucide-react
[28] App/components/layout/mobile-header.tsx    — depends on: sidebar.tsx, ui.store.ts
[29] App/components/layout/mobile-bottom-nav.tsx — depends on: routes.ts, lucide-react
[30] App/components/layout/page-transition.tsx  — depends on: motion
[31] App/components/layout/transition-link.tsx  — depends on: next/navigation
[32] App/app/(unauthorised)/layout.tsx          — depends on: no sidebar
[33] App/app/(unauthorised)/login/page.tsx      — depends on: lib/api.ts, store/auth.store.ts
[34] App/app/(unauthorised)/signup/page.tsx     — depends on: lib/api.ts, @scaler/types
[35] App/app/(authorised)/layout.tsx            — depends on: layout components, auth.store.ts
[36] App/hooks/use-debounce.ts                  — depends on: react
[37] App/hooks/use-media-query.ts               — depends on: react
[38] App/hooks/use-timezone.ts                  — depends on: react
[39] App/hooks/use-pagination.ts                — depends on: nuqs
[40] App/hooks/queries/use-event-types.ts       — depends on: lib/api.ts, query-keys.ts
[41] App/hooks/queries/use-event-type.ts        — depends on: lib/api.ts, query-keys.ts
[42] App/hooks/mutations/use-create-event-type.ts — depends on: lib/api.ts, query-keys.ts
[43] App/hooks/mutations/use-update-event-type.ts — depends on: lib/api.ts, query-keys.ts
[44] App/hooks/mutations/use-delete-event-type.ts — depends on: lib/api.ts, query-keys.ts
[45] App/components/event-types/event-type-skeleton.tsx — depends on: loading-skeleton.tsx
[46] App/components/event-types/event-type-actions.tsx  — depends on: components/ui/dropdown-menu
[47] App/components/event-types/event-type-card.tsx     — depends on: event-type-actions.tsx, mutations
[48] App/components/event-types/event-type-list.tsx     — depends on: use-event-types.ts, event-type-card.tsx
[49] App/components/event-types/add-event-type-dialog.tsx — depends on: components/ui/dialog, mutations
[50] App/components/event-types/event-type-form.tsx     — depends on: RHF, @scaler/types, mutations
[51] App/app/(authorised)/event-types/loading.tsx       — depends on: event-type-skeleton.tsx
[52] App/app/(authorised)/event-types/error.tsx         — depends on: components/ui/button
[53] App/app/(authorised)/event-types/page.tsx          — depends on: query-client.ts, event-type-list.tsx
[54] App/app/(authorised)/event-types/new/page.tsx      — depends on: event-type-form.tsx
[55] App/app/(authorised)/event-types/[id]/edit/page.tsx — depends on: event-type-form.tsx, use-event-type.ts
[56] App/hooks/queries/use-bookings.ts           — depends on: lib/api.ts, query-keys.ts
[57] App/hooks/queries/use-booking.ts            — depends on: lib/api.ts, query-keys.ts
[58] App/hooks/mutations/use-cancel-booking.ts   — depends on: lib/api.ts, query-keys.ts
[59] App/components/bookings/booking-skeleton.tsx — depends on: loading-skeleton.tsx
[60] App/components/bookings/booking-filters.tsx — depends on: components/ui/tabs, nuqs
[61] App/components/bookings/booking-action-menu.tsx — depends on: components/ui/dropdown-menu
[62] App/components/bookings/booking-card.tsx    — depends on: booking-action-menu.tsx, format.ts
[63] App/components/bookings/booking-detail-panel.tsx — depends on: components/ui/sheet
[64] App/components/bookings/cancel-booking-dialog.tsx — depends on: components/ui/dialog, use-cancel-booking.ts
[65] App/components/bookings/booking-list.tsx    — depends on: use-bookings.ts, booking-card.tsx, booking-filters.tsx
[66] App/app/(authorised)/bookings/loading.tsx   — depends on: booking-skeleton.tsx
[67] App/app/(authorised)/bookings/error.tsx     — depends on: components/ui/button
[68] App/app/(authorised)/bookings/page.tsx      — depends on: query-client.ts, booking-list.tsx
[69] App/hooks/queries/use-availability.ts       — depends on: lib/api.ts, query-keys.ts
[70] App/hooks/queries/use-schedule.ts           — depends on: lib/api.ts, query-keys.ts
[71] App/hooks/mutations/use-create-schedule.ts  — depends on: lib/api.ts, query-keys.ts
[72] App/hooks/mutations/use-update-schedule.ts  — depends on: lib/api.ts, query-keys.ts
[73] App/hooks/mutations/use-delete-schedule.ts  — depends on: lib/api.ts, query-keys.ts
[74] App/components/availability/timezone-selector.tsx — depends on: components/ui/popover, components/ui/command
[75] App/components/availability/time-range-picker.tsx — depends on: components/ui/input
[76] App/components/availability/day-row.tsx     — depends on: time-range-picker.tsx, components/ui/switch
[77] App/components/availability/date-override-picker.tsx — depends on: components/ui/calendar, components/ui/popover
[78] App/components/availability/date-override-list.tsx  — depends on: format.ts
[79] App/components/availability/schedule-editor.tsx — depends on: day-row.tsx, date-override-picker.tsx, timezone-selector.tsx, use-update-schedule.ts
[80] App/components/availability/schedule-card.tsx   — depends on: components/ui/dropdown-menu, format.ts
[81] App/components/availability/schedule-list.tsx   — depends on: use-availability.ts, schedule-card.tsx
[82] App/app/(authorised)/availability/loading.tsx   — depends on: loading-skeleton.tsx
[83] App/app/(authorised)/availability/error.tsx     — depends on: components/ui/button
[84] App/app/(authorised)/availability/page.tsx      — depends on: query-client.ts, schedule-list.tsx
[85] App/app/(authorised)/availability/[id]/page.tsx — depends on: query-client.ts, schedule-editor.tsx
[86] App/hooks/queries/use-public-event-type.ts  — depends on: lib/api.ts, query-keys.ts
[87] App/hooks/queries/use-slots.ts              — depends on: lib/api.ts, query-keys.ts
[88] App/hooks/mutations/use-create-booking.ts   — depends on: lib/api.ts, query-keys.ts
[89] App/components/booking-page/slot-skeleton.tsx    — depends on: loading-skeleton.tsx
[90] App/components/booking-page/event-info-panel.tsx — depends on: lucide-react, format.ts
[91] App/components/booking-page/calendar-picker.tsx  — depends on: components/ui/calendar, nuqs, use-slots.ts
[92] App/components/booking-page/time-slot-list.tsx   — depends on: use-slots.ts, nuqs, motion
[93] App/components/booking-page/booking-form.tsx     — depends on: RHF, @scaler/types, use-create-booking.ts
[94] App/components/booking-page/booking-confirmed.tsx — depends on: format.ts, motion
[95] App/app/[username]/[slug]/loading.tsx        — depends on: loading-skeleton.tsx
[96] App/app/[username]/[slug]/error.tsx          — depends on: components/ui/button
[97] App/app/[username]/[slug]/page.tsx           — depends on: lib/api.ts, all booking-page components
[98] App/app/[username]/[slug]/confirmed/page.tsx — depends on: use-booking.ts, booking-confirmed.tsx
[99] App/hooks/queries/use-integrations.ts        — depends on: lib/api.ts, query-keys.ts
[100] App/hooks/queries/use-user-profile.ts        — depends on: lib/api.ts, query-keys.ts
[101] App/hooks/mutations/use-connect-integration.ts — depends on: lib/api.ts
[102] App/hooks/mutations/use-disconnect-integration.ts — depends on: lib/api.ts, query-keys.ts
[103] App/hooks/mutations/use-update-profile.ts    — depends on: lib/api.ts, query-keys.ts
[104] App/components/integrations/integration-card.tsx — depends on: use-connect-integration.ts, use-disconnect-integration.ts
[105] App/components/integrations/integration-list.tsx  — depends on: use-integrations.ts, integration-card.tsx
[106] App/app/(authorised)/apps/loading.tsx        — depends on: loading-skeleton.tsx
[107] App/app/(authorised)/apps/error.tsx          — depends on: components/ui/button
[108] App/app/(authorised)/apps/page.tsx           — depends on: query-client.ts, integration-list.tsx
[109] App/components/settings/settings-nav.tsx     — depends on: routes.ts, lucide-react
[110] App/components/settings/settings-card.tsx    — depends on: lucide-react
[111] App/components/settings/profile-form.tsx     — depends on: RHF, @scaler/types, use-update-profile.ts
[112] App/components/settings/general-settings-form.tsx — depends on: RHF, @scaler/types, use-update-profile.ts
[113] App/app/(authorised)/settings/page.tsx       — depends on: settings-card.tsx
[114] App/app/(authorised)/settings/profile/page.tsx — depends on: settings-nav.tsx, profile-form.tsx
[115] App/app/(authorised)/settings/general/page.tsx — depends on: settings-nav.tsx, general-settings-form.tsx
```

---

## 13. shadcn Components to Install

Run after `npx shadcn@latest init` (with `new-york` style, `neutral` base color):

```bash
# Core primitives used everywhere
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add badge
npx shadcn@latest add card
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add avatar
npx shadcn@latest add tooltip

# Navigation & layout
npx shadcn@latest add tabs
npx shadcn@latest add sheet
npx shadcn@latest add scroll-area

# Interaction
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add popover
npx shadcn@latest add command
npx shadcn@latest add switch
npx shadcn@latest add checkbox
npx shadcn@latest add select
npx shadcn@latest add toggle-group

# Forms
npx shadcn@latest add form
npx shadcn@latest add textarea
npx shadcn@latest add radio-group

# Data display
npx shadcn@latest add calendar
npx shadcn@latest add table

# Feedback
npx shadcn@latest add sonner
```

### Component → Usage mapping

| shadcn component | Used in                                                                  |
| ---------------- | ------------------------------------------------------------------------ |
| `button`         | Every interactive action across all pages                                |
| `input`          | All text fields: title, slug, name, email, time inputs                   |
| `label`          | All form field labels                                                    |
| `badge`          | DurationBadge, HiddenBadge, StatusBadge, HostBadge, DefaultBadge         |
| `card`           | EventTypeList container, SettingsCard, BookingConfirmed card             |
| `separator`      | Dropdown menu dividers, section dividers                                 |
| `skeleton`       | All loading states in loading.tsx files                                  |
| `avatar`         | User avatar in sidebar, BookingDetailPanel, BookingConfirmedCard         |
| `tooltip`        | Action button tooltips (copy link, external link icons)                  |
| `tabs`           | BookingFilters (Upcoming/Past/etc), AvailabilityList (My/Team)           |
| `sheet`          | Mobile sidebar overlay, BookingDetailPanel on mobile                     |
| `scroll-area`    | TimeSlotList (scrollable), Mobile sidebar                                |
| `dialog`         | AddEventTypeDialog, ConfirmDialog, CancelBookingDialog                   |
| `dropdown-menu`  | EventTypeActions, BookingActionMenu, ScheduleCard actions                |
| `popover`        | DateOverridePicker calendar, TimezoneSelector                            |
| `command`        | TimezoneSelector search, GlobalCommandSearch                             |
| `switch`         | DayAvailabilityRow toggle, EventTypeCard active toggle                   |
| `checkbox`       | BookingForm (add guests checkbox)                                        |
| `select`         | Rows-per-page, status filter, time format, language                      |
| `toggle-group`   | 12h/24h toggle on time slot list                                         |
| `form`           | All forms (wraps React Hook Form context)                                |
| `textarea`       | BookingForm notes, CancelBookingDialog reason, EventTypeForm description |
| `radio-group`    | AppearanceSettings theme selection                                       |
| `calendar`       | DateOverridePicker (availability), CalendarPicker (booking page)         |
| `table`          | (future: bookings table view)                                            |
| `sonner`         | All success/error toast notifications                                    |

---

## 14. Environment Variables

**`App/.env.example`**:

```bash
# API backend base URL (include /api/v1)
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# Frontend app URL (for generating public booking links)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Default user credentials (for assignment bypass mode)
# These are used by POST /auth/bypass — no actual secrets here
NEXT_PUBLIC_DEFAULT_USERNAME=jagadeesh.deeptaai
```

Note: `NEXT_PUBLIC_*` vars are exposed to the browser. No secrets here. The backend holds all OAuth secrets.

---

## 15. Performance Checklist

Before marking any page as done, verify every item:

### Layout Stability (CLS = 0)

- [ ] All images use `next/image` with explicit `width` and `height`
- [ ] All skeleton placeholders match exact dimensions of loaded content
- [ ] Font loaded via `next/font` — zero FOUT/FOIT
- [ ] Time slot list has explicit min-height to prevent layout jump when loading
- [ ] Sidebar has explicit `w-64` — never shrinks

### Bundle Size

- [ ] Run `next build` and check "First Load JS" per route
- [ ] Target: dashboard pages < 100kb First Load JS
- [ ] Target: public booking page < 80kb First Load JS
- [ ] No moment.js (banned), no lodash (use native), no large date libraries
- [ ] Icons imported individually: `import { Calendar } from 'lucide-react'` not `import * as Icons`
- [ ] motion: use `LazyMotion` + `domAnimation` feature (18kb instead of 90kb for full motion)

### Server Components

- [ ] All `page.tsx` files are Server Components (no `'use client'` at top)
- [ ] No TanStack Query hooks in Server Components
- [ ] No Zustand store reads in Server Components
- [ ] Dynamic imports for heavy CC components: `dynamic(() => import('./schedule-editor'), { ssr: false })`

### API Performance

- [ ] No `useEffect` that fetches data directly — always use `useQuery`
- [ ] Bookings list uses `useInfiniteQuery` for pagination
- [ ] Prefetch queries in Server Components for dashboard pages
- [ ] Slot fetching: `staleTime: 30_000`, `refetchOnWindowFocus: false`

### Accessibility

- [ ] All form fields have associated `<label>` via `htmlFor`
- [ ] All icon-only buttons have `aria-label`
- [ ] Focus ring visible: `ring-2 ring-blue-500 ring-offset-2 ring-offset-neutral-900`
- [ ] Color not the only indicator (badges have text labels too)
- [ ] Keyboard navigation works for: sidebar nav, dropdown menus, calendar, time slots

### Lighthouse (public booking page target)

- [ ] Performance > 90
- [ ] LCP < 2.5s (target < 2.0s)
- [ ] FID / INP < 100ms
- [ ] No render-blocking resources

---

## Appendix A: Backend API Quick Reference

Base URL: `http://localhost:4000/api/v1`

| Method | Path                            | Auth        | Body / Query                                          | Notes                                         |
| ------ | ------------------------------- | ----------- | ----------------------------------------------------- | --------------------------------------------- |
| POST   | `/auth/bypass`                  | No          | `{}`                                                  | Returns user + tokens for seeded default user |
| POST   | `/auth/register`                | No          | `{ email, password, username, full_name, timezone? }` |                                               |
| POST   | `/auth/login`                   | No          | `{ email, password }`                                 |                                               |
| POST   | `/auth/refresh`                 | No (cookie) | —                                                     | refresh token in httpOnly cookie              |
| POST   | `/auth/logout`                  | Yes         | —                                                     |                                               |
| GET    | `/users/me`                     | Yes         | —                                                     | Returns current user                          |
| PATCH  | `/users/me`                     | Yes         | `{ full_name?, timezone?, avatar_url? }`              |                                               |
| GET    | `/event-types`                  | Yes         | —                                                     | All event types for authenticated user        |
| POST   | `/event-types`                  | Yes         | `CreateEventTypeInput`                                |                                               |
| GET    | `/event-types/:id`              | Yes         | —                                                     |                                               |
| PATCH  | `/event-types/:id`              | Yes         | `UpdateEventTypeInput`                                |                                               |
| DELETE | `/event-types/:id`              | Yes         | —                                                     |                                               |
| GET    | `/availability`                 | Yes         | —                                                     | All schedules for user                        |
| POST   | `/availability`                 | Yes         | `CreateScheduleInput`                                 |                                               |
| GET    | `/availability/:id`             | Yes         | —                                                     |                                               |
| PUT    | `/availability/:id`             | Yes         | `UpdateScheduleInput`                                 | Replaces entire schedule                      |
| DELETE | `/availability/:id`             | Yes         | —                                                     |                                               |
| POST   | `/bookings`                     | No          | `CreateBookingInput`                                  | Requires `Idempotency-Key` header             |
| GET    | `/bookings`                     | Yes         | `?status=`                                            | Filter by booking status                      |
| GET    | `/bookings/:id`                 | Yes         | —                                                     |                                               |
| PATCH  | `/bookings/:id/status`          | Yes         | `{ status, cancellation_reason? }`                    | Also requires `?timezone=` query param        |
| GET    | `/integrations`                 | Yes         | —                                                     | All integrations with connection status       |
| GET    | `/integrations/:slug/connect`   | Yes         | —                                                     | Returns OAuth redirect URL                    |
| DELETE | `/integrations/:slug`           | Yes         | —                                                     | Disconnect integration                        |
| GET    | `/public/:username/event-types` | No          | —                                                     | Public event types for a user                 |
| GET    | `/public/:username/:slug`       | No          | —                                                     | Single event type details + host info         |
| GET    | `/slots`                        | No          | `?eventTypeId=&date=YYYY-MM-DD&timezone=`             | Available time slots                          |
| GET    | `/health`                       | No          | —                                                     | Health check                                  |

**API response envelope**:

```typescript
{ success: true, message: string, data: T }
// or on error:
{ success: false, error: string, details?: string, code?: string }
```

---

## Appendix B: Key Design Decisions

### Why View Transitions API instead of Framer Motion for page transitions

In 2026, all major browsers support the View Transitions API. It produces smoother transitions than `AnimatePresence` in App Router because it's browser-native (no React component tree involvement). Framer Motion page transitions in App Router require the fragile `FrozenRouter` pattern. The View Transitions API is enabled with a single config flag and CSS.

### Why Zustand for auth (not cookies / localStorage)

Access tokens are stored in Zustand memory only. This prevents XSS attacks from reading tokens via `localStorage`. The `httpOnly` refresh token cookie (set by the server) handles persistence across page reloads — the `(authorised)/layout.tsx` calls `POST /auth/bypass` on mount to hydrate the token.

### Why nuqs for URL state (not useState)

Booking filter tabs (`?status=upcoming`) and date selection (`?date=2026-06-24`) stored in URL means: shareable links work, browser back button works, page refresh preserves state, server can read filter params for SSR.

### Why not use shadcn Sidebar component

The Cal.com sidebar has very specific layout (logo + search + avatar in header, bottom links section, specific spacing). The shadcn Sidebar component is opinionated and would require more overriding than building custom with the same primitives.

### Why `PUT` (not `PATCH`) for availability schedule update

The backend `PUT /availability/:id` replaces the entire schedule including all day availability rows and date overrides. The frontend `ScheduleEditor` always sends the complete updated schedule state.

### Why Idempotency-Key for booking creation

The backend requires an `Idempotency-Key` header on `POST /bookings` to prevent double-booking from network retries. The frontend generates this via `crypto.randomUUID()` on form mount and reuses the same key for retries.
