# Design Tokens — Scaler (Cal.com Clone)

Extracted from all 78 reference screenshots in `task/ref/`. Cal.com uses a near-black dark theme as its primary UI. These tokens are the ground truth for every component built in `App/`.

---

## Colors

### Background Colors

| Token name | Hex value | Tailwind class | Usage |
|---|---|---|---|
| `bg-page` | `#0a0a0a` | `bg-neutral-950` | Root page background |
| `bg-sidebar` | `#0a0a0a` | `bg-neutral-950` | Sidebar (same as page, no visual divide) |
| `bg-card` | `#161616` | `bg-neutral-900` | Card containers, list wrappers |
| `bg-card-hover` | `#1f1f1f` | `hover:bg-neutral-800/60` | Row hover state |
| `bg-input` | `#1a1a1a` | `bg-neutral-900` | Form inputs, time pickers |
| `bg-overlay` | `rgba(0,0,0,0.6)` | `bg-black/60` | Modal/Sheet backdrop |
| `bg-popover` | `#1a1a1a` | `bg-neutral-900` | Dropdowns, popovers, tooltips |
| `bg-muted` | `#262626` | `bg-neutral-800` | Muted/secondary surfaces |
| `bg-selected` | `#ffffff` | `bg-white` | Selected date in calendar |
| `bg-available-day` | `#404040` | `bg-neutral-700` | Available days in booking calendar |

### Border Colors

| Token name | Hex value | Tailwind class | Usage |
|---|---|---|---|
| `border-default` | `#2a2a2a` | `border-neutral-800` | Card borders, row dividers |
| `border-strong` | `#404040` | `border-neutral-700` | Input focus ring base, time input |
| `border-focus` | `#3b82f6` | `ring-blue-500` | Keyboard focus ring |
| `border-error` | `#ef4444` | `border-red-500` | Error state on inputs |
| `border-selected` | `#ffffff` | `border-white` | Selected date cell in calendar |

### Text Colors

| Token name | Hex value | Tailwind class | Usage |
|---|---|---|---|
| `text-primary` | `#ffffff` | `text-white` | Primary headings, card titles, nav items |
| `text-secondary` | `#a3a3a3` | `text-neutral-400` | Subtitles, slugs, secondary labels |
| `text-muted` | `#737373` | `text-neutral-500` | Placeholder text, helper text, timestamps |
| `text-disabled` | `#404040` | `text-neutral-700` | Disabled form elements |
| `text-link` | `#3b82f6` | `text-blue-500` | Meeting URLs, action links |
| `text-destructive` | `#ef4444` | `text-red-500` | Delete buttons, cancel actions, error messages |

### Brand / Accent Colors

| Token name | Hex value | Tailwind class | Usage |
|---|---|---|---|
| `brand-avatar` | `#e91e8c` | custom pink | User avatar background (vivid pink/magenta) |
| `brand-dot-active` | `#22c55e` | `bg-green-500` | Online presence dot on avatar |
| `brand-toggle-active` | `#2563eb` | `bg-blue-600` | Active toggle switch (Switch component) |

### Status Colors

| Token name | Hex value | Tailwind class | Usage |
|---|---|---|---|
| `status-success` | `#22c55e` | `text-green-500` / `bg-green-500/15` | Confirmed bookings, success states |
| `status-warning` | `#f59e0b` | `text-amber-500` / `bg-amber-500/15` | Hidden event type badge, warning notices |
| `status-error` | `#ef4444` | `text-red-500` / `bg-red-500/15` | Cancelled status, error states |
| `status-info` | `#3b82f6` | `text-blue-500` / `bg-blue-500/15` | Host badge, info notices |
| `status-pending` | `#d97706` | `text-amber-600` / `bg-amber-600/15` | Pending/unconfirmed bookings |

### Booking Status Badge Colors

| Status | Text color | Background | Tailwind |
|---|---|---|---|
| Confirmed | `#22c55e` | `rgba(34,197,94,0.12)` | `text-green-500 bg-green-500/10` |
| Cancelled | `#ef4444` | `rgba(239,68,68,0.12)` | `text-red-500 bg-red-500/10` |
| Pending | `#f59e0b` | `rgba(245,158,11,0.12)` | `text-amber-500 bg-amber-500/10` |
| Rescheduled | `#a78bfa` | `rgba(167,139,250,0.12)` | `text-violet-400 bg-violet-400/10` |

### Integration / Provider Colors (for Join buttons)

| Provider | Background | Tailwind |
|---|---|---|
| Google Meet | `#1a7340` | `bg-green-900 text-green-300` |
| Cal Video | `#262626` | `bg-neutral-800 text-neutral-300` |
| Zoom | `#1a4a8a` | `bg-blue-900 text-blue-300` |
| Microsoft Teams | `#4b5eaa` | `bg-indigo-800 text-indigo-200` |

---

## Typography

**Font family**: Inter (Google Font via `next/font/google`)  
**Fallback**: `system-ui, -apple-system, sans-serif`

### Font Size Scale

| Semantic name | Size (px/rem) | Weight | Line height | Tailwind | Usage |
|---|---|---|---|---|---|
| `heading-xl` | 24px / 1.5rem | 700 bold | 1.3 | `text-2xl font-bold` | Page hero headings |
| `heading-lg` | 20px / 1.25rem | 600 semibold | 1.4 | `text-xl font-semibold` | Page titles ("Event types", "Bookings") |
| `heading-md` | 18px / 1.125rem | 600 semibold | 1.4 | `text-lg font-semibold` | Section headings, dialog titles |
| `heading-sm` | 16px / 1rem | 500 medium | 1.5 | `text-base font-medium` | Card titles, event type names |
| `body` | 14px / 0.875rem | 400 normal | 1.5 | `text-sm` | Default body text, descriptions |
| `body-sm` | 13px / 0.8125rem | 400 normal | 1.5 | `text-[13px]` | Secondary info, attendee names |
| `label` | 14px / 0.875rem | 500 medium | 1.4 | `text-sm font-medium` | Form labels, tab labels, button text |
| `caption` | 12px / 0.75rem | 400 normal | 1.4 | `text-xs` | Badges, timestamps, copyright |
| `overline` | 11px / 0.6875rem | 500 medium | 1.4 | `text-[11px] font-medium uppercase tracking-wide` | Category labels, status overlines |

### Font Weights Used
- `400` normal — body text, secondary labels
- `500` medium — labels, button text, form labels
- `600` semibold — page titles, section headings
- `700` bold — primary headings, event type names in cards

---

## Spacing

**Base unit**: 4px (Tailwind default)

| Context | Value | Tailwind class |
|---|---|---|
| Page horizontal padding | 24px | `px-6` |
| Page vertical padding | 24px | `py-6` |
| Section gap (between sections) | 24px | `space-y-6` / `gap-6` |
| Card internal padding | 16–20px | `p-4` or `p-5` |
| Card row item padding | 16px vertical, 16px horizontal | `px-4 py-4` |
| Form field vertical gap | 16px | `space-y-4` |
| Form field label-to-input gap | 6px | `space-y-1.5` |
| Sidebar nav item padding | 8px v, 12px h | `px-3 py-2` |
| Badge padding | 2px v, 8px h | `px-2 py-0.5` |
| Button padding (md) | 8px v, 16px h | `px-4 py-2` |
| Button padding (sm) | 4px v, 12px h | `px-3 py-1` |
| Icon size (nav) | 20px | `size-5` |
| Icon size (inline) | 16px | `size-4` |
| Sidebar width (desktop) | 256px | `w-64` |
| Content max-width (forms) | 672px | `max-w-2xl` |
| Content max-width (settings) | 800px | `max-w-3xl` |

---

## Border Radius

| Context | Value | Tailwind class |
|---|---|---|
| Page/root | none | — |
| Card container | 8px | `rounded-lg` |
| Button (default) | 6px | `rounded-md` |
| Button (pill) | 999px | `rounded-full` |
| Input | 6px | `rounded-md` |
| Badge | 999px | `rounded-full` |
| Dialog / Modal | 12px | `rounded-xl` |
| Popover / Dropdown | 8px | `rounded-lg` |
| Avatar | 999px | `rounded-full` |
| Calendar day cell | 6px | `rounded-md` |
| Toggle switch | 999px | `rounded-full` (handled by shadcn) |
| Tooltip | 6px | `rounded-md` |

---

## Shadows

| Context | CSS value | Tailwind class |
|---|---|---|
| Card (subtle, list items) | `0 1px 3px rgba(0,0,0,0.3)` | `shadow-sm` |
| Dropdown / Popover | `0 4px 16px rgba(0,0,0,0.5)` | `shadow-lg` |
| Modal / Dialog | `0 8px 32px rgba(0,0,0,0.6)` | `shadow-2xl` |
| Sidebar (mobile overlay) | `4px 0 16px rgba(0,0,0,0.4)` | `shadow-xl` |
| Booking calendar | `0 2px 8px rgba(0,0,0,0.4)` | `shadow-md` |

---

## Component Inventory

Every distinct UI element observed across all 78 reference screenshots.

### Layout & Navigation

| Component | Description | Screenshots |
|---|---|---|
| `Sidebar` | 256px left nav: logo, main nav items, bottom links, user avatar | `side-menu.png`, all dashboard pages |
| `MobileHeader` | Top bar: logo left, search icon, avatar right | all `*-mobile.png` |
| `MobileBottomNav` | Fixed bottom bar: 4 icon buttons (link, calendar, clock, three-dot) + FAB (+) | all `*-mobile.png` |
| `SidebarNavItem` | Nav link: Lucide icon + label, active/hover state | `side-menu.png` |
| `SettingsNav` | Left sub-nav for settings pages, grouped by category | `settings.png`, `profile-page.png` |

### Shared / Utility

| Component | Description | Screenshots |
|---|---|---|
| `PageHeader` | Title + subtitle left, action buttons right | All dashboard pages |
| `EmptyState` | Centered: icon in rounded box + bold title + muted description | `booking-mobile-empty.png` |
| `CommandSearch` | Global search modal triggered by search icon | `gloable-search.png` |
| `AsyncBoundary` | Combines `ErrorBoundary` + `Suspense` with skeleton fallback | (architecture) |
| `ConfirmDialog` | shadcn `Dialog` with cancel + destructive confirm buttons | (pattern) |
| `Toast` (sonner) | Success/error notifications, bottom-right, auto-dismiss | (pattern) |
| `LoadingSkeleton` | `animate-pulse` placeholder matching UI shape | (pattern) |

### Event Types

| Component | Description | Screenshots |
|---|---|---|
| `EventTypeList` | Bordered card container with divider lines, no grid | `event-types-full.png` |
| `EventTypeCard` | Horizontal row: title+slug, duration badges, toggle, action icons | `event-types-full.png`, `event-types-action-menu.png` |
| `DurationBadge` | Small neutral pill: clock icon + "15m" / "30m" | `event-types-full.png` |
| `HiddenBadge` | Amber pill: eye-off icon + "Hidden" text | `event-types-full.png` |
| `EventTypeActionMenu` | Three-dot dropdown: Edit, Duplicate, Embed, Troubleshoot, Delete (red) | `event-types-action-menu.png` |
| `AddEventTypeDialog` | Modal: Title input, URL preview, Duration input, type selector cards | `add-new-event.png` |
| `EventTypeForm` | Multi-section form: title, description, URL, duration, location, calendar | `creation-eding-page.png` |
| `EventTypeFormNav` | Left sidebar tabs: Basics, Availability, Booking form, Confirmation, Appearance, Seats, Recurring, Policies | `creation-eding-page.png` |
| `BookingFormEditor` | Toggle+edit per booking question field | `booking-form.png` |
| `AppearanceTab` | Layout selection thumbnails, event type color picker, timezone lock | `apperance-option.png` |
| `LimitsTab` | Buffer time, notice, booking frequency, future limit controls | `limits-and-buffers.png` |

### Bookings

| Component | Description | Screenshots |
|---|---|---|
| `BookingTabBar` | Tabs: Upcoming, Unconfirmed, Recurring, Past, Cancelled + Filter | `bookings-page.png`, `booking-page-mobile.png` |
| `BookingList` | Grouped rows with date section headers ("Next", date grouping) | `bookings-page.png` |
| `BookingCard` | Row: date+time column, title+attendees, join button, three-dot menu | `bookings-page.png`, `booking-card-actions.png` |
| `JoinButton` | Provider-colored pill: icon + "Join Google Meet" / "Join Cal Video" | `bookings-page.png` |
| `BookingDetailPanel` | Slide-in right panel (desktop) / Sheet (mobile): Confirmed badge, title, When/Who/Where details | `side-menu.png`, `side-menu-mobile.png` |
| `BookingActionMenu` | Dropdown: Reschedule, Request reschedule, Edit location, Add guests \| View recordings, Session details, Mark no-show \| Report (red), Cancel (red) | `booking-card-actions.png`, `options-mobile.png` |
| `BookingCalendarView` | Full week/month calendar grid with time axis | `booking-calender-view.png` |

### Availability

| Component | Description | Screenshots |
|---|---|---|
| `AvailabilityScheduleList` | List of schedule cards + "My/Team" tab toggle | `avalibality-page.png`, `avalibility-page-mobile.png` |
| `AvailabilityScheduleCard` | Row: name + Default badge, day range summary, timezone with globe icon, three-dot menu | `avalibality-page.png` |
| `ScheduleEditor` | Full page editor: back arrow, editable name, day rows, date overrides, timezone selector | `avalibitly-creation-page.png`, `avalibitly-creation-page-filled.png` |
| `DayAvailabilityRow` | Toggle switch + day name + start time input + dash + end time input + add (+) + copy button | `avalibitly-creation-page.png` |
| `TimeRangePicker` | Paired time inputs (HH:MMam format), small `w-24` inputs | `avalibitly-creation-page.png` |
| `DateOverrideList` | List of override entries: date + time range / "Unavailable", delete + edit icons | `avalibitly-creation-page-filled.png` |
| `DateOverridePicker` | Calendar popup: month navigation, multi-date selection, Close button | `avalibitly-creation-page-override-pop-up.png` |
| `TimezoneSelector` | Dropdown with searchable timezone list (e.g., "Asia/Kolkata") | `avalibitly-creation-page.png` |
| `OOORedirectBanner` | "Temporarily out-of-office? Add a redirect" CTA link | `avalibality-page.png` |

### Public Booking Page

| Component | Description | Screenshots |
|---|---|---|
| `EventInfoPanel` | Left panel: avatar, host name, event title, duration, location, timezone dropdown | `cal-card.png`, `cal-card-mobile-view.png` |
| `BookingCalendar` | Center panel: month/year header, prev/next, SUN-SAT columns, day grid with available/unavailable/selected states | `cal-card.png`, `cal-card-mobile-view.png`, `rechudule-1.png` |
| `TimeSlotList` | Right panel: day label, 12h/24h toggle, scrollable list of available slot buttons | `cal-card.png`, `rechudule-1.png` |
| `TimeSlotButton` | Bordered button: green dot + time text, selected state | `rechudule-1.png` |
| `BookingFormPanel` | Replaces time slots after slot select: Your name, Email address, Additional notes, Add guests, Back/Confirm | `next-form.png`, `next-form-mobile.png` |
| `BookingConfirmedCard` | Success card: green checkmark circle, "This meeting is scheduled", What/When/Who/Where table, Add-to-calendar icons | `sucessfull.png` |
| `CancelBookingPage` | Booking details + "Reason for cancellation" textarea + Nevermind/Cancel event buttons | `cancel-1.png` |
| `ReschedulePage` | Booking calendar with "Former time" shown strikethrough | `rechudule-1.png` |

### Integrations / Apps

| Component | Description | Screenshots |
|---|---|---|
| `InstalledAppsNav` | Left sidebar tabs: Analytics, AI & Automation, Calendar, Conferencing, CRM, Messaging, Payment, Other | `installed-apps.png`, `installed-apps-confrerencing-section.png` |
| `InstalledAppCard` | Row: app icon + name + description + Default badge if applicable + three-dot menu | `installed-apps-confrerencing-section.png` |
| `AppStoreCard` | Grid card: icon + name + description + "Details" button | `app-store.png` |
| `CalendarSettings` | Add-to-calendar selector + conflict check calendar list with toggles | `installed-apps.png` |
| `ConferencingList` | Connected conferencing apps with Default badge | `installed-apps-confrerencing-section.png` |

### Settings

| Component | Description | Screenshots |
|---|---|---|
| `SettingsOverviewGrid` | 3-column grid of clickable category cards with icons | `settings.png` |
| `SettingsCard` | Icon in circle + bold title + muted description, full-card clickable | `settings.png` |
| `ProfileForm` | Avatar upload + username (with cal.com/ prefix) + full name + email badges + About rich text editor + Update button | `profile-page.png` |
| `GeneralSettingsForm` | Language/Timezone/Time format/Start of week selects + toggle cards | `general.png` |
| `AppearanceSettings` | Theme preview thumbnails with radio selection (System/Light/Dark) | `apparence.png` |
| `AvatarUpload` | Circular avatar with "Upload avatar" + "Remove" buttons | `profile-page.png` |
