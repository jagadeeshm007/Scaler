# Scaler Backend System Design Review

## Executive Summary

This document provides a post-implementation architectural analysis of the Scaler Scheduling Backend. It identifies areas of strong design, structural coupling, and potential robustness gaps as the system scales to handle high-throughput scheduling scenarios.

---

## 1. Architectural Strengths

### 1.1 Strict Controller-Service-Data Separation

- The backend adheres strictly to a 3-layer architecture. Controllers only handle HTTP parsing, Zod validation, and JSON responses.
- Business logic is concentrated in isolated services (`BookingService`, `AvailabilityService`), making the system highly testable via mocked Prisma clients.

### 1.2 Defensive Double-Booking Prevention

- Standard scheduling applications rely on `COUNT(*)` checks for overlap, which fail under concurrent load. Scaler implements a robust `SELECT ... FOR UPDATE` raw SQL query natively integrated into Prisma's `$transaction` block. This leverages Postgres Row-Level Locking, guaranteeing transactional safety even across distributed server instances.

### 1.3 Asynchronous Job Delegation

- Post-booking triggers (Email Notifications, Calendar Syncing) are dispatched to background promises `.catch(...)`. This prevents third-party API latency (e.g., Google Calendar taking 2 seconds) from delaying the fast `201 Created` response back to the user interface.

---

## 2. Identified Issues & Coupling (To Be Fixed in V2)

### 2.1 Tight Coupling in In-Process Background Jobs

**Issue:** The `BookingService` directly triggers `CalendarService` and `EmailService` promises. If the Node process crashes or restarts 10 milliseconds after creating the booking but before the promises resolve, the email and calendar event are permanently lost.
**Recommendation:** Implement an external queue system (e.g., BullMQ with Redis or Supabase PG queues).

### 2.2 Hardcoded Integration Providers

**Issue:** `CalendarService` currently switches between providers (Google, Apple, Outlook) using conditional blocks. As the platform adds dozens of integrations (Zoom, Teams, Salesforce, Hubspot), this service will become a monolithic god object.
**Recommendation:** Implement a polymorphic `ProviderStrategy` pattern. Define an abstract `CalendarProvider` interface, and inject the specific provider implementation dynamically.

### 2.3 Single-Point-of-Failure Database Bottleneck

**Issue:** The raw SQL locking `FOR UPDATE` is perfect for small-to-medium scale, but can cause connection pooling exhaustion if thousands of people try to book the same celebrity's 10-minute slot simultaneously.
**Recommendation:** For extreme scale, shift availability locking to Redis (distributed lock using Redlock algorithm) before touching Postgres.

---

## 3. Robustness Gaps

### 3.1 Encryption Key Management

Currently, `ENCRYPTION_KEY` is loaded directly from `.env`. If this key is rotated, all existing connected Google/Zoom accounts will instantly fail decryption, logging everyone out of their integrations simultaneously.
**Fix Needed:** Implement Key Versioning. Store `v1:base64:base64:base64`, allowing the system to attempt decryption with older keys during a rotation phase.

### 3.2 Idempotency Keys on Bookings

There is no client-side Idempotency Key requirement. A network retry from a mobile device could accidentally book two back-to-back 30-minute slots if the overlap buffer rules allow it.
**Fix Needed:** Require an `X-Idempotency-Key` header on `POST /api/v1/bookings` and store it in Redis or a dedicated Prisma model with a 24-hour TTL.
