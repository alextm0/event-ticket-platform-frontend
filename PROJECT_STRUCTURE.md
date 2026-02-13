# Project Structure

This document provides an overview of the project's directory structure and organization.

## Root Directory

```
event-ticket-platform-frontend/
├── .cursor/              # Cursor IDE configuration and plans
├── src/                  # Main source code directory
├── tests/                # Playwright end-to-end tests
├── public/               # Static assets (if any)
├── .gitignore           # Git ignore rules
├── components.json      # shadcn/ui component configuration
├── eslint.config.mjs    # ESLint configuration
├── next.config.ts       # Next.js configuration
├── package.json         # Dependencies and scripts
├── playwright.config.ts # Playwright test configuration
├── postcss.config.mjs   # PostCSS configuration
├── tsconfig.json        # TypeScript configuration
└── README.md            # Project documentation
```

---

## Source Directory (`src/`)

### `src/app/` - Next.js App Router Pages

All routes follow Next.js 15 App Router conventions:

```
app/
├── (auth)/              # Auth route group (shared layout)
│   ├── sign-in/         # Sign-in page
│   └── sign-up/         # Sign-up page
├── actions/             # Server actions
│   └── analytics.ts     # Analytics data fetching
├── admin/               # Admin dashboard
│   └── page.tsx
├── api/                 # Next.js API routes (proxies to backend)
│   ├── auth/            # Authentication endpoints
│   ├── events/          # Event-related endpoints
│   ├── purchase-ticket/ # Ticket purchase endpoint
│   ├── tickets/         # Ticket endpoints (download, QR code)
│   ├── users/           # User endpoints
│   └── v1/              # Versioned API routes
├── browse-events/       # Public event browsing
│   ├── BrowseEventsClient.tsx
│   └── page.tsx
├── events/              # Event detail pages
│   └── [eventId]/
│       └── page.tsx
├── my-tickets/          # User's ticket list
│   └── page.tsx
├── onboarding/          # User onboarding flow
│   ├── actions.ts
│   ├── loading.tsx
│   └── page.tsx
├── organizer/           # Organizer dashboard and management
│   ├── actions.ts
│   ├── create-event/
│   ├── edit-event/
│   ├── OrganizerDashboardClient.tsx
│   └── page.tsx
├── staff/               # Staff workspace
│   ├── page.tsx
│   ├── scan/            # QR scanner for ticket validation
│   │   ├── components/  # ScannerView, EventSelector, ScanHistory
│   │   ├── hooks/       # useScanCooldown, useTicketValidator
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── StaffScanClient.tsx
│   │   └── types.ts
│   └── validation-logs/ # Validation history
│       ├── page.tsx
│       └── ValidationLogsClient.tsx
├── layout.tsx           # Root layout
├── loading.tsx          # Global loading UI
└── page.tsx             # Landing page
```

---

### `src/components/` - React Components

Organized by domain/feature:

```
components/
├── attendee/            # Attendee-specific components
│   ├── AttendeePromo.tsx
│   ├── MyTicketsList.tsx
│   ├── TicketCard.tsx
│   └── TicketDetailsModal.tsx
├── events/              # Event-related components
│   ├── EventCard.tsx
│   ├── EventDetailsView.tsx  # Main event detail view
│   ├── PurchaseTicketButton.tsx
│   ├── TicketTypeList.tsx
│   └── tabs/            # Tab components for EventDetailsView
│       ├── AnalyticsTab.tsx
│       ├── OverviewTab.tsx
│       ├── StaffTab.tsx
│       └── TicketsTab.tsx
├── layout/              # Layout components
│   └── app-header/
│       ├── AccountButton.tsx
│       ├── AppHeader.tsx
│       ├── HeaderLink.tsx
│       └── HomepageButton.tsx
├── onboarding/          # Onboarding flow components
│   ├── OnboardingForm.tsx
│   └── RoleSelectionCard.tsx
├── organizer/           # Organizer dashboard components
│   ├── EventAnalytics.tsx
│   ├── EventForm.tsx
│   ├── OrganizerEventCard.tsx
│   ├── OrganizerManagementBar.tsx
│   ├── PulseCard.tsx
│   ├── StaffManagement.tsx
│   ├── TicketRevenueRow.tsx
│   ├── TicketSalesPreview.tsx
│   ├── TicketTypeForm.tsx
│   ├── TicketTypeManagement.tsx
│   └── TicketTypeManagementWrapper.tsx
├── payment/             # Payment-related components
│   └── StripeMockModal.tsx
├── staff/               # Staff-specific components
│   └── ValidationLogsList.tsx
├── ui/                  # Reusable UI primitives
│   ├── badge.tsx
│   ├── button.tsx
│   ├── calendar.tsx
│   ├── card.tsx
│   ├── confirmation-modal.tsx
│   ├── date-filter-input.tsx
│   ├── date-time-picker.tsx
│   ├── dialog.tsx
│   ├── glass-card.tsx
│   ├── google-map-embed.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── page-header.tsx
│   ├── popover.tsx
│   ├── select.tsx
│   ├── tabs.tsx
│   └── textarea.tsx
└── GetStartedButton.tsx # Shared CTA component
```

---

### `src/lib/` - Core Library Code

Shared utilities, API clients, and business logic:

```
lib/
├── api/                 # Domain-specific API clients
│   ├── analytics.ts    # Analytics API calls
│   ├── events.ts       # Event CRUD operations
│   ├── http.ts         # Shared HTTP utilities (auth headers, fetch wrapper)
│   ├── staff.ts        # Staff management API calls
│   ├── tickets.ts      # Ticket operations and normalization
│   └── users.ts        # User-related API calls
├── api-response.ts     # Standardized API route response helpers
├── api-route-auth.ts   # Authentication helpers for API routes
├── auth-error-handler.ts # Centralized auth error handling
├── auth-guards.ts      # Server-side role-based access control
├── backend-client.ts   # Barrel export (re-exports from api/*)
├── client-auth.ts      # Client-side auth utilities (localStorage)
├── session-events.ts   # Custom event names for session updates
├── share-utils.ts      # Social sharing utilities
├── user-profile.ts     # User profile type definitions
├── utils.ts            # General utilities (cn, parseDateDMY)
└── validation/         # Ticket validation logic
    ├── client.ts       # Client-side validation (calls Next.js API)
    ├── helpers.ts      # Validation response helpers
    ├── index.ts        # Barrel export
    └── server.ts       # Server-side validation (calls backend directly)
```

---

### `src/types/` - TypeScript Type Definitions

Centralized type definitions organized by domain:

```
types/
├── analytics.ts        # Analytics types (SalesHistoryItem, RecentOrder, etc.)
├── events.ts           # Event types (Event, PublishedEvent, EventTicketType)
├── index.ts            # Barrel export (re-exports all types)
├── staff.ts            # Staff types (StaffMember, AssignedEvent)
├── tickets.ts          # Ticket types (Ticket, RawTicketType, normalizeTicketType)
└── users.ts            # User types (UserProfile, CreateUserPayload)
```

---

### `src/config/` - Configuration

Environment and runtime configuration:

```
config/
├── env.ts              # Client-side env vars (NEXT_PUBLIC_*)
└── server-env.ts       # Server-side env vars (BACKEND_API_URL)
```

---

### `src/constants/` - Application Constants

```
constants/
└── roles.ts            # Role configuration (ROLE_CONFIG, ROLE_DESTINATIONS, etc.)
```

---

### `src/styles/` - Global Styles

```
styles/
└── globals.css         # Global CSS with CSS variables for theming
```

---

### `src/middleware.ts` - Next.js Middleware

Handles route protection and role-based redirects.

---

## Key Architectural Patterns

### 1. **Domain-Driven API Clients**

Each domain (`events`, `tickets`, `users`, `staff`, `analytics`) has its own API client module in `src/lib/api/`. All share common utilities from `http.ts` (auth headers, error handling, URL construction).

### 2. **Normalization at the Edge**

Backend responses are normalized to consistent TypeScript types at the API client layer:
- `normalizeTicketType()` in `src/types/tickets.ts` - normalizes ticket type responses
- `normalizeTicketResponse()` in `src/lib/api/tickets.ts` - normalizes ticket responses

This keeps UI components simple and consistent.

### 3. **Centralized Types**

All TypeScript interfaces are in `src/types/` organized by domain, with a barrel export in `index.ts` for easy imports.

### 4. **Shared Helpers**

- **Auth**: `api-route-auth.ts` (API routes), `client-auth.ts` (client-side)
- **Error handling**: `api-response.ts` (standardized responses)
- **HTTP**: `http.ts` (headers, fetch wrapper, pagination unwrapping)

### 5. **Component Organization**

- Domain-specific components in their own folders (`attendee/`, `organizer/`, `events/`, `staff/`)
- Reusable UI primitives in `ui/`
- Large components split into sub-components (e.g., `EventDetailsView` → tab components)

---

## File Naming Conventions

- **Components**: PascalCase (e.g., `EventDetailsView.tsx`)
- **Utilities/Helpers**: camelCase (e.g., `normalizeTicketType.ts`)
- **Types**: camelCase (e.g., `tickets.ts`, `events.ts`)
- **Constants**: camelCase (e.g., `roles.ts`)
- **API Routes**: `route.ts` (Next.js convention)
- **Server Actions**: `actions.ts` or `*.ts` in `actions/` folder

---

## Import Patterns

### Type Imports
```ts
import type { Event, PublishedEvent } from "@/types";
```

### Component Imports
```ts
import { EventDetailsView } from "@/components/events/EventDetailsView";
```

### API Client Imports
```ts
import { getEvents, createEvent } from "@/lib/backend-client";
// or directly:
import { getEvents } from "@/lib/api/events";
```

### Utility Imports
```ts
import { cn, parseDateDMY } from "@/lib/utils";
```

---

## Testing Structure

```
tests/
├── auth.spec.ts        # Authentication flow tests
├── smoke.spec.ts       # Basic smoke tests
└── helpers.ts          # Test utilities
```

---

## Environment Variables

Required environment variables (set in `.env.local`):

- `NEXT_PUBLIC_BACKEND_API_URL` - Public backend API URL (client-side)
- `BACKEND_API_URL` - Server-side backend API URL
- `NODE_ENV` - Environment (development/production)

---

## Build Output

- `.next/` - Next.js build output (gitignored)
- `node_modules/` - Dependencies (gitignored)
