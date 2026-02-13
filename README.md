# Event Ticket Platform ? Frontend

Modern Next.js 15 frontend for an event ticketing platform. It provides public event browsing, ticket purchase, organizer dashboards, and staff scanning/validation, backed by a separate Spring (or similar) API.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: Custom components + Lucide icons
- **Charts**: Recharts (for analytics)
- **Testing**: Playwright + Jest-style smoke tests (`tests/`)

---

## Features

### Public / Attendee
- Landing page with marketing content
- Browse published events
- Purchase tickets (Stripe-style mock checkout UI)
- "My tickets" page with QR codes and ticket details

### Organizer
- Organizer dashboard with event list and filters
- Create / edit events
- Manage ticket types (create/update/delete, active/inactive)
- Basic staff assignment UI
- Event analytics (sales trends, operations metrics)

### Staff
- Staff workspace (`/staff`) with links to:
  - High-speed QR scanner (`/staff/scan`)
  - Validation logs (`/staff/validation-logs`)

### Auth & Roles
- Cookie-based auth integrated with the backend
- Roles: `admin`, `organizer`, `staff`, `attendee`
- Middleware routes users to the correct dashboard based on role

---

## Configuration

Create a `.env.local` file in the project root and configure at least:

```env
# Public API base URL used by the browser (must be reachable from the client)
NEXT_PUBLIC_BACKEND_API_URL=https://your-backend.example.com

# Server-side API base URL used by Next.js (can be private/VPN)
BACKEND_API_URL=https://your-backend.internal

NODE_ENV=development
```

**Notes:**
- Both URLs should point to the same backend in most setups; you can use two values if you have a private internal address for the server and a public one for the browser.
- All backend calls in this frontend go through those env-driven URLs via the helpers in `src/lib/api/http.ts` and `src/config/*`, so nothing is hardcoded for production.

---

## Scripts

**Install dependencies:**
```bash
npm install
```

**Run in development mode:**
```bash
npm run dev
# App is available at http://localhost:3000
```

**Create a production build:**
```bash
npm run build
```

**Start the production server** (after `npm run build`):
```bash
npm run start
```

**Run tests:**
```bash
npm test           # basic smoke tests (if configured)
npx playwright test
```

---

## Architecture Overview

- **App routes** live under `src/app/` (e.g. `browse-events`, `organizer`, `staff`, `events/[eventId]`).
- **UI components** are under `src/components/`, grouped by domain (`events`, `organizer`, `attendee`, `staff`, `ui`).
- **Domain API clients** are in `src/lib/api/`:
  - `http.ts` ? shared helpers (`createAuthHeaders`, `apiFetch`, `unwrapPageResponse`, `getBackendUrl`, `getCurrentUserId`)
  - `events.ts`, `tickets.ts`, `users.ts`, `staff.ts`, `analytics.ts` ? small, focused modules
- **Types** are centralized in `src/types/` (users, events, tickets, staff, analytics) with a barrel export in `src/types/index.ts`.
- **Auth helpers** for API routes are in `src/lib/api-route-auth.ts` and for client-side checks in `src/lib/client-auth.ts`.
- **Error handling** for API routes is standardized via `src/lib/api-response.ts`.

This structure keeps the code modular and easier to maintain while avoiding duplicate logic and hardcoded URLs.

---

## Ticket Model and Normalization

The backend can return ticket payloads in slightly different shapes (e.g. `ticketId` vs `id`, nested `event` object, etc.). To keep the rest of the frontend simple, we normalize all ticket responses to a single `Ticket` type in `src/lib/api/tickets.ts`:

```ts
// Simplified view of the normalization
function normalizeTicketResponse(raw: any): Ticket {
  const toIsoString = (value: string | null | undefined) =>
    value ? new Date(value).toISOString() : undefined;

  return {
    id: raw.id ?? raw.ticketId ?? "",
    order_id: raw.order_id ?? raw.orderId ?? "",
    event_id: raw.event_id ?? raw.eventId ?? "",
    ticket_type: raw.ticket_type ?? raw.ticketType ?? raw.ticketTypeName ?? "Ticket",
    qr_code: raw.qr_code ?? raw.qrCode ?? "",
    status: (raw.status ?? raw.ticketStatus ?? "DEFAULT").toString(),
    checked_in_at: toIsoString(raw.checked_in_at ?? raw.checkedInAt) ?? null,
    created_at: new Date(raw.created_at ?? raw.createdAt ?? Date.now()).toISOString(),
    updated_at: new Date(raw.updated_at ?? raw.updatedAt ?? Date.now()).toISOString(),
    event_title: raw.event_title ?? raw.eventTitle ?? raw.event?.title,
    event_location: raw.event_location ?? raw.eventLocation ?? raw.event?.location,
    event_start_time: toIsoString(raw.event_start_time ?? raw.eventStartTime ?? raw.event?.startTime),
    event_end_time: toIsoString(raw.event_end_time ?? raw.eventEndTime ?? raw.event?.endTime),
    event_description: raw.event_description ?? raw.eventDescription ?? raw.event?.description,
    ticket_type_name: raw.ticket_type_name ?? raw.ticketTypeName ?? raw.ticket_type ?? raw.ticketType,
    qr_code_id: raw.qr_code_id ?? raw.qrCodeId ?? raw.qr_code ?? raw.qrCode,
    purchase_date: toIsoString(raw.purchase_date ?? raw.purchaseDate ?? raw.created_at ?? raw.createdAt),
    attendee_name: raw.attendee_name ?? raw.attendeeName ?? raw.user?.fullName ?? raw.user?.name ?? raw.ownerName,
    user_email: raw.user_email ?? raw.userEmail ?? raw.user?.email,
    user_id: raw.userId ?? raw.user_id ?? raw.ownerId ?? raw.owner_id ?? raw.user?.id,
  };
}
```

This lets all UI code (`MyTicketsList`, ticket details modals, etc.) work against one consistent model instead of handling backend variations everywhere.

---

## Production Readiness & Next.js Best Practices

This frontend follows most Next.js and general production best practices:

- Uses the **App Router** with server components where appropriate and server actions for backend calls.
- All backend URLs are derived from env-driven config (`BACKEND_API_URL`, `NEXT_PUBLIC_BACKEND_API_URL`) via helpers instead of being hardcoded.
- API routes share auth and error-handling helpers (`api-route-auth.ts`, `api-response.ts`) to keep behavior consistent.
- Types are centralized and reused, avoiding ad-hoc interfaces inside components.
- Large components were split into focused sub-components and tabs to keep files readable.

If you later add more features (e.g. Google sign-in, admin management for organizers/staff), you can keep following the same patterns: small domain-focused API modules, shared helpers, and typed models at the edges of your backend API.
