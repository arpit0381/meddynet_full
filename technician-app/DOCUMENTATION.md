# Meddy Technician — Comprehensive Developer Documentation

> **Version:** 0.1.0 · **Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Zustand · Framer Motion · Leaflet
> **Build identifer:** MEDDY-TECH-882-PWA

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Project Structure](#3-project-structure)
4. [Frontend Architecture](#4-frontend-architecture)
   - 4.1 [Pages & Routes](#41-pages--routes)
   - 4.2 [Component Library](#42-component-library)
   - 4.3 [State Management](#43-state-management)
   - 4.4 [Custom Hooks](#44-custom-hooks)
5. [Key Workflows (End-to-End)](#5-key-workflows-end-to-end)
   - 5.1 [Authentication Flow](#51-authentication-flow)
   - 5.2 [Job Lifecycle Flow](#52-job-lifecycle-flow)
6. [Functions & Logic Reference](#6-functions--logic-reference)
7. [Styling System](#7-styling-system)
8. [PWA & Service Worker](#8-pwa--service-worker)
9. [External Integrations](#9-external-integrations)
10. [Setup & Installation Guide](#10-setup--installation-guide)
11. [Scalability & Improvement Suggestions](#11-scalability--improvement-suggestions)

---

## 1. Project Overview

### Purpose

**Meddy Technician** (internally called *Meddy Dispatch* / *MeddyNet Dispatch*) is a **Progressive Web App (PWA)** designed for on-the-ground biomedical sample collection technicians working within the MeddyNet healthcare logistics network.

Technicians use this app on both mobile phones (primary) and desktop browsers (secondary) to:
- View and accept incoming patient sample-collection assignments dispatched by the fleet operations center.
- Navigate to patient locations via a live interactive map.
- Work through a structured job status pipeline (Assigned → Accepted → On The Way → Arrived → Sample Collected → Completed).
- Track shift duration, daily earnings, and job history.
- Monitor nearby team members in the field.

### Key Features

| Feature | Description |
|---|---|
| **OTP-based login** | Phone number + 4-digit OTP authentication flow |
| **Real-time dashboard** | Overview of pending jobs, daily earnings, shift timer, fleet pulse |
| **Assignment cards** | Horizontally-scrollable job cards with patient details, address, estimated reward |
| **Job detail page** | Full-screen map + structured sidebar/bottom-sheet with all job controls |
| **Job status pipeline** | ASSIGNED → ACCEPTED → ON\_THE\_WAY → ARRIVED → SAMPLE\_COLLECTED → COMPLETED |
| **Sample checklist** | Pre-collection checklist that must be fully completed before proceeding |
| **Job history** | Grid of all completed collections with earnings |
| **Notifications center** | Mission alerts, system messages grouped by type |
| **Profile & settings** | Technician info, stats, settings, support, privacy, payments menu |
| **Attendance (on/off duty)** | Toggle to go Online/Offline; controls whether new assignments are visible |
| **Shift timer** | Real-time HH:MM:SS counter displayed while on duty |
| **Fleet monitor** | Live view of nearby team technicians with radar tracking trigger |
| **Responsive PWA** | Mobile bottom-nav, desktop side-nav, installable, manifest + service worker |

---

## 2. Tech Stack & Dependencies

### Core

| Package | Version | Role |
|---|---|---|
| `next` | 16.2.1 | App framework (App Router, SSR, file-based routing) |
| `react` / `react-dom` | 19.2.4 | UI rendering |
| `typescript` | ^5 | Type safety |
| `tailwindcss` | ^4 | Utility-first CSS |
| `tw-animate-css` | ^1.4.0 | CSS animation utilities (slide-in, fade-in, zoom-in) |

### State & Data

| Package | Version | Role |
|---|---|---|
| `zustand` | ^5.0.12 | Lightweight global state management (no boilerplate) |
| `@tanstack/react-query` | ^5.95.2 | Installed; ready for async data fetching / caching (not yet wired) |

### UI & Animation

| Package | Version | Role |
|---|---|---|
| `framer-motion` | ^12 | Page and element entrance animations |
| `lucide-react` | ^1.0.1 | Icon set (all icons throughout the app) |
| `sonner` | ^2.0.7 | Toast notification system |
| `shadcn` | ^4.1.0 | Headless component primitives (card, button, input, label, badge) |
| `@base-ui/react` | ^1.3.0 | Additional low-level UI primitives |
| `class-variance-authority` | ^0.7.1 | Composable variant-based className helper |
| `clsx` + `tailwind-merge` | ^2.1.1 / ^3.5.0 | Conditional and conflict-free Tailwind class merging (via `cn()`) |

### Mapping

| Package | Version | Role |
|---|---|---|
| `leaflet` + `react-leaflet` | ^1.9.4 / ^5.0.0 | Open-source interactive maps (OpenStreetMap tiles) |
| `@types/leaflet` | ^1.9.21 | TypeScript types for Leaflet |

### Build & Dev

| Package | Version | Role |
|---|---|---|
| `@tailwindcss/postcss` | ^4 | PostCSS integration for Tailwind v4 |
| `eslint` + `eslint-config-next` | ^9 / 16.2.1 | Linting |
| `babel-plugin-react-compiler` | 1.0.0 | React optimising compiler plugin (disabled in next.config.ts) |

---

## 3. Project Structure

```
technician-app/
├── public/                    # Static assets served at root URL
│   ├── MeddyNetlogo.png       # App logo (used on Login + SideNav)
│   ├── favicon.png            # Browser tab icon
│   ├── apple-touch-icon.png   # iOS home screen icon
│   ├── manifest.json          # PWA manifest (name, icons, display mode)
│   └── sw.js                  # Service Worker (registered on page load)
│
├── src/
│   ├── app/                   # Next.js App Router – file-based routes
│   │   ├── layout.tsx         # Root layout: fonts, nav, toaster, SW registration
│   │   ├── page.tsx           # Root page – immediately redirects to /dashboard
│   │   ├── globals.css        # Global styles + Tailwind theme tokens + CSS utilities
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx       # Phone OTP authentication page
│   │   ├── dashboard/
│   │   │   └── page.tsx       # Main technician dashboard (protected)
│   │   ├── job/
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Dynamic job detail page with map (protected)
│   │   ├── history/
│   │   │   └── page.tsx       # Completed jobs history grid (protected)
│   │   ├── notifications/
│   │   │   └── page.tsx       # Notification center (protected)
│   │   └── profile/
│   │       ├── page.tsx       # Technician profile & menu (protected)
│   │       ├── notifications/
│   │       │   └── page.tsx   # Profile > Notification preferences sub-page
│   │       ├── settings/
│   │       │   └── page.tsx   # Profile > App Settings sub-page
│   │       ├── payments/      # (route exists, page to be built)
│   │       ├── privacy/       # (route exists, page to be built)
│   │       ├── status/        # (route exists, page to be built)
│   │       └── support/       # (route exists, page to be built)
│   │
│   ├── components/            # Reusable React components
│   │   ├── dashboard/         # Dashboard-specific widgets
│   │   │   ├── ActiveJobBanner.tsx    # Banner card for the currently active job
│   │   │   ├── AttendanceToggle.tsx   # Online/Offline duty toggle button
│   │   │   ├── FleetMonitor.tsx       # Nearby team technician list + radar
│   │   │   ├── ShiftTimer.tsx         # Real-time elapsed shift timer
│   │   │   └── StatPair.tsx           # "Pending Tasks" + "Daily Earnings" stat cards
│   │   ├── job/               # Job-related components
│   │   │   ├── HorizontalJobScroller.tsx  # Snap-scroll row of JobCards
│   │   │   ├── JobActionBtn.tsx           # Status-driven primary action CTA button
│   │   │   ├── JobAddress.tsx             # Address display block
│   │   │   ├── JobCard.tsx                # Assignment card shown in the dashboard scroller
│   │   │   ├── JobHeader.tsx              # Patient name + test type header
│   │   │   ├── JobProgressTracking.tsx    # 6-step visual progress tracker
│   │   │   └── SampleChecklist.tsx        # Pre-collection verification checklist
│   │   ├── layout/            # Application shell navigation
│   │   │   ├── BottomNav.tsx    # Mobile fixed bottom navigation bar
│   │   │   ├── SideNav.tsx      # Desktop left-side navigation panel
│   │   │   └── SubPageHeader.tsx # Back-button header for sub-pages
│   │   ├── map/               # Map components
│   │   │   └── LiveMap.tsx      # Leaflet map (dynamically imported, no SSR)
│   │   └── ui/                # Shadcn/primitive UI components
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── skeleton.tsx
│   │       └── sonner.tsx       # Toaster wrapper
│   │
│   ├── store/                 # Zustand global stores
│   │   ├── authStore.ts       # Authentication state (isAuthenticated, phone, isOnline, shift)
│   │   └── jobStore.ts        # Jobs state (list, activeJob, status mutations)
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useLocation.ts     # Browser Geolocation API watcher
│   │   └── useSocket.ts       # WebSocket stub for real-time location push
│   │
│   └── lib/                   # Utility functions
│       └── utils.ts           # cn() – merges Tailwind classes safely
│
├── next.config.ts             # Next.js configuration (Turbopack, allowed origins)
├── package.json               # Scripts, dependencies, metadata
├── tsconfig.json              # TypeScript compiler options
├── eslint.config.mjs          # ESLint flat config (Next.js + TypeScript rules)
├── postcss.config.mjs         # PostCSS with @tailwindcss/postcss
└── components.json            # Shadcn component registry configuration
```

---

## 4. Frontend Architecture

### 4.1 Pages & Routes

All routes are defined using the **Next.js App Router** (`src/app/`). Protected pages redirect to `/login` if the user is not authenticated.

#### `/` — Root Page
**File:** `src/app/page.tsx`

The root URL immediately redirects to `/dashboard` using Next.js's `redirect()` function. No UI is rendered here.

```tsx
// Executed exclusively on the server (no 'use client')
redirect('/dashboard');
```

---

#### `/login` — Authentication Page
**File:** `src/app/login/page.tsx`

A two-step OTP login form:

1. **Step 1 – Phone number entry:** The user enters their 10-digit Indian mobile number. The `+91` prefix is shown as a static label. Input is sanitized to digits only, max 10 characters. The submit button is disabled until 10 digits are entered.
2. **Step 2 – OTP entry:** After clicking "Receive Access Code" (`setOtpSent(true)`), a 4-digit OTP field appears. On successful 4-digit entry, `login(phone)` is called on the `authStore`, and the router pushes to `/dashboard`.

> **Note (Current Implementation):** The OTP is **not validated against any backend**. Any 4-digit sequence will succeed. This is a client-side mock for development.

**Key state:**
| State | Type | Purpose |
|---|---|---|
| `phone` | `string` | Current phone number input value |
| `otpSent` | `boolean` | Controls which form step is visible |
| `otp` | `string` | Current OTP input value |

**Animations:** Framer Motion `motion.div` with `initial/animate` opacity and translate transitions on the logo, heading, and card.

---

#### `/dashboard` — Main Dashboard (Protected)
**File:** `src/app/dashboard/page.tsx`

The primary hub for a technician's workday. Consists of:

- **Hero Header (green):** Time-of-day greeting, technician ID (last 4 digits of phone), shift timer, attendance toggle, notification bell.
- **Stat Cards (StatPair):** Pending tasks count + today's earnings in INR.
- **Active Assignments section:** If online and jobs are pending, renders a `HorizontalJobScroller`. If offline or no pending jobs, shows an empty-state card with contextual message.
- **Duty Operations section (3-column grid):**
  - `FleetMonitor` – nearby team list.
  - Daily Goal card – hardcoded progress to 70% toward ₹2000 target (future: dynamic).
  - Pulse / Compliance card – protocol score, safety gear status, GPS accuracy with a sync button.
- **Sidebar (desktop only):** `ActiveJobBanner` if a job is active, otherwise a Fleet Performance metrics widget and a 24/7 Support card.

**Computed values:**
```ts
const pendingJobs    = jobs.filter(j => j.status === 'ASSIGNED');
const visibleJobs    = isOnline ? pendingJobs : [];          // Hide jobs when offline
const completedJobs  = jobs.filter(j => j.status === 'COMPLETED');
const todayEarnings  = completedJobs.reduce((acc, curr) => acc + curr.amount, 0);
const greeting       = getGreeting();                         // Morning/Afternoon/Evening based on current hour
```

**Auth guard pattern:**
```ts
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);             // Prevent SSR hydration mismatch
useEffect(() => {
  if (!mounted) return;
  if (!isAuthenticated) router.push('/login');
}, [isAuthenticated, router, mounted]);
if (!isAuthenticated) return null;
```

> This two-effect pattern is used consistently across **all** protected pages to avoid Next.js hydration errors when Zustand state is read on the client.

---

#### `/job/[id]` — Job Detail Page (Protected, Dynamic)
**File:** `src/app/job/[id]/page.tsx`

A full-screen split-layout page for managing a single job in progress.

**Layout:**
- **Desktop:** Left panel (450px fixed) with job details + action controls; right area is a full-height interactive map.
- **Mobile:** Full-screen map as background; top header overlay (glassmorphism); bottom sheet (rounded card) with scrollable job details and action button.

**Key logic:**
```ts
const params = useParams();
const id = params?.id as string;
const job = jobs.find(j => j.id === id) || null;
if (!isAuthenticated || !job) return null;
```

**Status update handler:**
```ts
const handleStatusUpdate = (newStatus: JobStatus) => {
  if ('vibrate' in navigator) navigator.vibrate(50); // Haptic feedback on mobile
  updateJobStatus(job.id, newStatus);
  toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
  if (newStatus === 'COMPLETED') {
    setTimeout(() => router.push('/dashboard'), 1000); // Auto-navigate after completion
  }
};
```

**Map:** The `LiveMap` component is **dynamically imported** with `ssr: false` to prevent server-side rendering of Leaflet (which requires `window`/`document`):
```ts
const LiveMap = dynamic(() => import('@/components/map/LiveMap'), { ssr: false });
```

**Checklist visibility:** The `SampleChecklist` only appears when `job.status === 'ARRIVED'` or `'SAMPLE_COLLECTED'`, animated via `AnimatePresence`.

---

#### `/history` — Job History (Protected)
**File:** `src/app/history/page.tsx`

Displays all `COMPLETED` jobs in a responsive card grid (1 col on mobile, 2 on sm, 3 on lg). Each card shows:
- Patient name, collection date, earnings amount, address.
- Staggered Framer Motion entrance animation (`delay: index * 0.05`).

**Header** includes a sticky top bar with total daily earnings, a filter button and an export report button (desktop only; currently decorative).

**Empty state:** A full-width centered card with a `ClipboardList` icon and a "Back to Duty" button linking to `/dashboard`.

---

#### `/notifications` — Notifications Center (Protected)
**File:** `src/app/notifications/page.tsx`

Renders a static list of `NOTIFICATIONS` (currently hardcoded mock data). Each notification item has:
- `type`: `assignment | system | alert | info`
- `icon`: A Lucide React icon component reference
- `color`: Tailwind background/text classes for the icon badge
- Staggered slide-in animation

An "Archive All Read" button is present but decorative (no functionality yet).

---

#### `/profile` — Technician Profile (Protected)
**File:** `src/app/profile/page.tsx`

A dark-header profile page with:
- **Header section:** Gradient dark `from-gray-950 to-black`, avatar with green shield badge, phone number pill, attendance toggle.
- **Statistics row:** 4 stat cards – Completed jobs, Rating, Earnings, Active hours.
- **Menu sections (3 groups):**
  - **Preferences:** App Settings → `/profile/settings`, Notifications → `/profile/notifications`
  - **Security:** Privacy Policy → `/profile/privacy`, Payment Methods → `/profile/payments`
  - **Support:** Help & Support → `/profile/support`, System Status → `/profile/status`
- **Logout button:** Uses `toast.promise()` for loading/success/error states.

```ts
const handleLogout = () => {
  toast.promise(
    new Promise((resolve) => setTimeout(resolve, 800)),
    {
      loading: 'Ending tactical session...',
      success: () => { logout(); router.push('/login'); return 'Session terminated.'; },
      error: 'Logout failed',
    }
  );
};
```

---

#### `/profile/notifications` — Notification Preferences Sub-Page
**File:** `src/app/profile/notifications/page.tsx`

A sub-page reachable from the Profile menu. (Content is a stub/placeholder — build out with real notification preference toggles.)

---

#### `/profile/settings` — App Settings Sub-Page
**File:** `src/app/profile/settings/page.tsx`

A sub-page for app configuration settings. (Content is a stub/placeholder.)

---

### 4.2 Component Library

#### `src/components/layout/`

##### `BottomNav.tsx`
**Purpose:** Fixed bottom navigation bar shown **only on mobile** (`md:hidden` in root layout).
**Key behavior:**
- Hidden on `/login` route.
- Active tab indicator: green top border + scale-up icon + opacity-100 label.
- The "Active Job" tab dynamically links to `/job/{activeJob.id}` if a job is active, otherwise `/dashboard`.
- Active detection logic: exact match for `/dashboard`, `startsWith` for other routes to handle dynamic segments.

**Props:** None (reads from store internally).

---

##### `SideNav.tsx`
**Purpose:** Fixed left-side navigation panel shown **only on desktop** (`hidden md:flex` wrapping in root layout).
**Key behavior:**
- Displays MeddyNet logo + brand name.
- Same nav items and active logic as `BottomNav`.
- Active item style: `bg-gray-900 text-white shadow-xl`.
- Logout button at bottom calls `authStore.logout()`.
- Shows a hardcoded "Authenticated ID" (`MT-992-V`) at the bottom — future: read from auth store.

**Props:** None.

---

##### `SubPageHeader.tsx`
**Purpose:** Reusable back-button header for sub-pages (profile sub-routes).

---

#### `src/components/dashboard/`

##### `ActiveJobBanner.tsx`
**Purpose:** Shown in the dashboard sidebar when `activeJob` is non-null. Displays the patient name, job ID, address, current status badge, and a "Open Map Controls" button linking to `/job/{job.id}`.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `job` | `Job` | The active job object from `jobStore` |

---

##### `AttendanceToggle.tsx`
**Purpose:** Online/Offline duty toggle button. Used in the dashboard header and profile header. Calls `authStore.toggleAttendance()` on click.

**Visual states:**
- **Online:** White background, green text, green power icon, pulsing green dot indicator.
- **Offline:** Semi-transparent white background, muted text.

**Props:** None (reads/mutates `authStore` directly).

---

##### `FleetMonitor.tsx`
**Purpose:** Card showing nearby team technicians. Hardcoded mock list of 2 technicians with names and distances.

**Key interactions:**
- **Radar track button** on each team member: Fires a `toast.info()` with the member's name and distance.
- **Team Map button**: Fires a `toast.promise()` simulating a 2-second sync operation.

**Local state:** `isScanning: boolean` – controls the scanning animation overlay and button disabled state.

---

##### `ShiftTimer.tsx`
**Purpose:** Displays a live `HH:MM:SS` elapsed time counter from when the technician went online (`authStore.shiftStartTime`).

**Behavior:**
- Only renders when `isOnline === true`.
- Sets up a 1-second `setInterval` that calculates elapsed time from `shiftStartTime`.
- Cleans up the interval on unmount or when going offline.

---

##### `StatPair.tsx`
**Purpose:** Renders two stat cards side by side — pending task count and daily earnings.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `pendingCount` | `number` | Number of ASSIGNED jobs |
| `earnings` | `number` | Sum of amounts of COMPLETED jobs |

---

#### `src/components/job/`

##### `JobCard.tsx`
**Purpose:** A single assignment card displayed in the dashboard scroller. Shows patient name, address, estimated reward, ETA, and an "Accept & Review" button.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `job` | `Job` | The job object |
| `onAccept` | `(job: Job) => void` | Callback when job is accepted (sets active job in store) |
| `index` | `number` (optional) | Used for staggered animation delay |

**Important:** The "Review Assignment" button is wrapped in a `<Link href={/job/{job.id}}>`. The `onClick` handler calls `onAccept(job)` which maps to `jobStore.setActiveJob(job)`.

---

##### `HorizontalJobScroller.tsx`
**Purpose:** A horizontal snap-scroll container for multiple `JobCard` instances.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `jobs` | `Job[]` | Array of jobs to render |
| `onAccept` | `(job: Job) => void` | Passed down to each `JobCard` |

Uses `overflow-x-auto snap-x no-scrollbar scroll-smooth` with fade-edge overlays on both sides.

---

##### `JobActionBtn.tsx`
**Purpose:** A status-driven primary CTA button. The label, color, and next status are all determined by a `STATUS_CONFIG` lookup map.

**Status Config:**
| Current Status | Button Label | Next Status | Color |
|---|---|---|---|
| `ASSIGNED` | Accept Job | `ACCEPTED` | Green gradient |
| `ACCEPTED` | Start Journey | `ON_THE_WAY` | Blue gradient |
| `ON_THE_WAY` | Mark Arrived | `ARRIVED` | Orange gradient |
| `ARRIVED` | Sample Collected | `SAMPLE_COLLECTED` | Purple gradient |
| `SAMPLE_COLLECTED` | Complete Job | `COMPLETED` | Dark gradient |
| `COMPLETED` | — | `null` | *renders nothing* |

**Props:**
| Prop | Type | Description |
|---|---|---|
| `status` | `JobStatus` | Current job status |
| `onClick` | `(nextStatus: JobStatus) => void` | Called with the next status |

---

##### `JobProgressTracking.tsx`
**Purpose:** A visual 6-step progress bar with circle nodes. Completed steps show a checkmark; the active step has a glowing pulse ring and scale-up effect.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `currentStatus` | `JobStatus` | Current status (determines which circles are filled) |

**Status order:**
```ts
['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'SAMPLE_COLLECTED', 'COMPLETED']
```

The width of the green fill line is calculated as:
```ts
width = `${(currentIndex / (STATUS_ORDER.length - 1)) * 100}%`
```

---

##### `JobAddress.tsx`
**Purpose:** A simple address display block with a MapPin icon.

**Props:** `{ address: string }`

---

##### `JobHeader.tsx`
**Purpose:** Patient name + test type display header on the job detail page.

---

##### `SampleChecklist.tsx`
**Purpose:** An interactive pre-collection checklist with 4 required steps. Appears only when `job.status === 'ARRIVED'` or `'SAMPLE_COLLECTED'`.

**Checklist items:**
1. Verify Patient ID
2. Check Sample Vials Sealing
3. Sanitize Collection Kit
4. Pack in Temperature Control Bag

**Behavior:** Maintains a `checked: number[]` state. When all 4 are checked, fires `onComplete()` callback after a 500ms delay, and displays a "Verification Complete" success message (Framer Motion `AnimatePresence`).

**Props:**
| Prop | Type | Description |
|---|---|---|
| `onComplete` | `() => void` | Fired when all checklist items are ticked |

---

#### `src/components/map/`

##### `LiveMap.tsx`
**Purpose:** A Leaflet-based interactive map. Must be dynamically imported with `ssr: false`.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `center` | `[number, number]` (optional) | Override map center coordinates |
| `markerPos` | `[number, number]` (optional) | Marker position (patient location) |

**Behavior:**
- Uses `useLocation()` hook to track the technician's GPS position.
- Falls back to New Delhi coordinates `[28.6139, 77.2090]` if geolocation is unavailable.
- `MapUpdater` sub-component subscribes to `useMap()` and calls `map.setView()` whenever `center` changes, enabling smooth re-centering.
- Uses OpenStreetMap tiles; marker icon from Leaflet's CDN.
- Shows a skeleton loader (`"Loading map..."`) until `mounted === true`.

---

#### `src/components/ui/`

Shadcn-generated primitive components. All accept standard HTML attributes plus variant props.

| Component | Key Variants / Notes |
|---|---|
| `button.tsx` | `variant`: default, destructive, outline, secondary, ghost, link. `size`: default, sm, lg, icon |
| `card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` sub-components |
| `input.tsx` | Standard styled `<input>` |
| `label.tsx` | `<label>` paired with `htmlFor` |
| `badge.tsx` | `variant`: default, secondary, destructive, outline |
| `skeleton.tsx` | Loading placeholder (grey pulse animation) |
| `sonner.tsx` | Wraps the `Toaster` from `sonner` library with `richColors` and configurable position |

---

### 4.3 State Management

The app uses **Zustand** (v5) for all client-side global state. There is no server-side state persistence — state resets on page refresh (no `persist` middleware).

#### `authStore.ts` — Authentication Store

```ts
interface AuthState {
  isAuthenticated: boolean;   // Is the technician logged in?
  phone: string | null;       // Technician's phone number
  isOnline: boolean;          // Is the technician on-duty / online?
  shiftStartTime: string | null; // ISO timestamp when duty started

  login: (phone: string) => void;     // Logs in + marks online + starts shift
  logout: () => void;                  // Clears all state
  toggleAttendance: () => void;        // Flips isOnline; records shift start if going online
}
```

**`login(phone)`** sets:
```ts
{ isAuthenticated: true, phone, isOnline: true, shiftStartTime: new Date().toISOString() }
```

**`toggleAttendance()`** logic:
```ts
// When going from offline → online, record shift start time
// When going online → offline, preserve the existing shiftStartTime
shiftStartTime: !state.isOnline ? new Date().toISOString() : state.shiftStartTime
```

---

#### `jobStore.ts` — Job Management Store

```ts
export type JobStatus = 
  'ASSIGNED' | 'ACCEPTED' | 'ON_THE_WAY' | 'ARRIVED' | 'SAMPLE_COLLECTED' | 'COMPLETED';

export interface Job {
  id: string;          // e.g., "JOB-001"
  patientName: string;
  address: string;
  phone: string;
  lat: number;         // Latitude for map marker
  lng: number;         // Longitude for map marker
  status: JobStatus;
  amount: number;      // Payment for this job (INR)
  date: string;        // ISO timestamp
}
```

**Store interface:**
```ts
interface JobState {
  activeJob: Job | null;                          // The job currently in progress
  jobs: Job[];                                     // All jobs (pending + completed)
  setActiveJob: (job: Job | null) => void;
  updateJobStatus: (id: string, status: JobStatus) => void;
  acceptJob: (job: Job) => void;                   // Sets job to ACCEPTED + sets as activeJob
  setJobs: (jobs: Job[]) => void;                  // Bulk replace (for API integration)
}
```

**`updateJobStatus(id, status)`** logic:
- Updates the matching job in `jobs[]`.
- If `activeJob.id === id`, also updates `activeJob`.
- If `status === 'COMPLETED'`, sets `activeJob = null` (clears the active mission).

**Initial mock data (`MOCK_JOBS`):**
```ts
// JOB-001: Rahul Kumar, ASSIGNED status, ₹450, Delhi coordinates
// JOB-002: Priya Sharma, COMPLETED status, ₹600, Delhi coordinates
```

---

### 4.4 Custom Hooks

#### `useLocation.ts`
**Purpose:** Wraps the browser's `navigator.geolocation.watchPosition()` API to provide reactive GPS coordinates.

```ts
interface Location { lat: number; lng: number; }

// Returns:
{ location: Location | null, error: string | null }
```

**Configuration:**
```ts
{ enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
```

- Automatically cleans up the watcher on unmount (`clearWatch`).
- Falls back gracefully with an error message if geolocation is unsupported.

---

#### `useSocket.ts`
**Purpose:** Manages a WebSocket connection for real-time bidirectional communication (currently a **stub/placeholder**).

**What it does now:**
- The WebSocket connection code is commented out.
- The `useLocation()` hook is integrated — when a real location update fires *and* the socket is open, it would send:
```json
{
  "type": "LOCATION_UPDATE",
  "lat": 28.6139,
  "lng": 77.2090,
  "timestamp": "2026-04-01T06:41:00.000Z"
}
```

**To activate in production:**
1. Uncomment the WebSocket connection block.
2. Replace `"ws://localhost:8000/ws/technician"` with your actual WebSocket server URL.
3. Handle incoming messages (e.g., new job dispatches, status updates from dispatch center).

---

## 5. Key Workflows (End-to-End)

### 5.1 Authentication Flow

```
User opens app
    │
    ▼
/ (root page.tsx)
    │── server-side redirect → /dashboard
    │
    ▼
/dashboard (page.tsx)
    │── useEffect: !mounted || !isAuthenticated → router.push('/login')
    │
    ▼
/login (page.tsx)
    │
    ├─[Step 1]─ User enters 10-digit phone → "Receive Access Code" button enabled
    │                │
    │                ▼ handleSendOtp() → setOtpSent(true)
    │
    ├─[Step 2]─ User enters 4-digit OTP → "Authorize Login" button enabled
    │                │
    │                ▼ handleVerify() → authStore.login(phone)
    │                     │── sets: isAuthenticated=true, phone, isOnline=true, shiftStartTime=now
    │
    ▼
router.push('/dashboard')
    │
    ▼
Dashboard renders (isAuthenticated=true, no redirect)
```

> **To implement real OTP in production:** Add an API route `/api/auth/send-otp` and `/api/auth/verify-otp` that uses a service like Twilio Verify or MSG91. The frontend currently bypasses verification entirely.

---

### 5.2 Job Lifecycle Flow

```
MOCK_JOBS loaded in jobStore (initial state)
    │
    ▼
/dashboard
    ├── pendingJobs = jobs where status='ASSIGNED'
    ├── isOnline=true → visibleJobs = pendingJobs
    │
    ├── HorizontalJobScroller renders JobCards for each pending job
    │       │
    │       ▼ User clicks "Review Assignment"
    │           ├── onAccept(job) → jobStore.setActiveJob(job)
    │           └── router navigates to /job/[id]
    │
    ▼
/job/[id]
    ├── job = jobs.find(j => j.id === id)
    ├── Renders LiveMap with job.lat / job.lng as marker
    ├── Shows JobProgressTracking (ASSIGNED stage highlighted)
    ├── Shows JobActionBtn: "Accept Job" (green)
    │
    │── [User clicks Accept Job]
    │       └── handleStatusUpdate('ACCEPTED')
    │           ├── navigator.vibrate(50)
    │           ├── jobStore.updateJobStatus('JOB-001', 'ACCEPTED')
    │           └── toast.success('Status updated to ACCEPTED')
    │
    ├── JobActionBtn updates: "Start Journey" (blue)
    │── [User clicks Start Journey] → status: ON_THE_WAY
    │── [User clicks Mark Arrived] → status: ARRIVED
    │       └── SampleChecklist appears (AnimatePresence)
    │               ├── User checks all 4 items
    │               └── onComplete() → jobStore.updateJobStatus('JOB-001', 'SAMPLE_COLLECTED')
    │
    │── [User clicks Complete Job] → status: COMPLETED
    │       ├── jobStore.updateJobStatus: sets status=COMPLETED, activeJob=null
    │       └── setTimeout(1000) → router.push('/dashboard')
    │
    ▼
/dashboard
    ├── pendingJobs recalculated (JOB-001 now COMPLETED, not in pending list)
    ├── completedJobs now includes JOB-001
    ├── todayEarnings updated
    └── activeJob = null → shows Fleet Performance widget (not ActiveJobBanner)
```

---

## 6. Functions & Logic Reference

### `getGreeting()` — Dashboard

```ts
// File: src/app/dashboard/page.tsx
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};
```
Returns a greeting string based on the current local hour.

---

### `cn(...inputs)` — Class Merging Utility

```ts
// File: src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Usage:** Merge conditional Tailwind classes without conflicts (e.g., no `text-red-500 text-green-500` collision).

```tsx
// Example usage in a component:
<div className={cn('p-4 bg-white', isActive && 'bg-green-50', className)}>
```

---

### `STATUS_CONFIG` — Job Action Button Map

```ts
// File: src/components/job/JobActionBtn.tsx
export const STATUS_CONFIG: Record<JobStatus, { label, color, next, icon }> = {
  ASSIGNED:         { label: 'Accept Job',        next: 'ACCEPTED',          ... },
  ACCEPTED:         { label: 'Start Journey',     next: 'ON_THE_WAY',        ... },
  ON_THE_WAY:       { label: 'Mark Arrived',      next: 'ARRIVED',           ... },
  ARRIVED:          { label: 'Sample Collected',  next: 'SAMPLE_COLLECTED',  ... },
  SAMPLE_COLLECTED: { label: 'Complete Job',      next: 'COMPLETED',         ... },
  COMPLETED:        { label: 'Completed',         next: null,                ... },
};
```

This is a pure lookup map. Adding a new status to the pipeline only requires adding an entry here and to `JobStatus` type in `jobStore.ts`.

---

### `handleSync()` — Dashboard Pulse Card

```ts
// File: src/app/dashboard/page.tsx
const handleSync = () => {
  setIsSyncing(true);
  toast.loading('Syncing with Meddy Fleet Ops...', { id: 'sync' });
  setTimeout(() => {
    setIsSyncing(false);
    toast.success('System Operational & Synced!', { id: 'sync' });
  }, 2000);
};
```

Currently a mock 2-second sync. In production, replace `setTimeout` with an actual API call to a fleet synchronization endpoint.

---

### `MapUpdater` — Dynamic Map Centering

```tsx
// File: src/components/map/LiveMap.tsx
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom()); // Preserves current zoom level
  }, [center, map]);
  return null;
}
```

This **renderless child component** must be placed inside `<MapContainer>` to access the Leaflet map instance via the `useMap()` hook. It programmatically re-centers the map whenever the `center` prop changes without triggering a full re-render of the map.

---

## 7. Styling System

### Design Language

The app uses a consistent design language built on **Tailwind CSS v4** with the following principles:
- **Brand color:** `#00A86B` (MeddyNet green) — used for primary CTAs, active states, indicators.
- **Dark accents:** `gray-900` / `black` — secondary CTAs, sidebar active state, dark cards.
- **Background:** `#F9FAFB` (near-white) — main page background.
- **Typography:** `Inter` (loaded via `next/font/google`) — `font-black` for headings, `font-bold` for body.
- **Corner radius:** Aggressively rounded — up to `rounded-[3rem]` for cards, creating a soft modern feel.
- **Shadows:** Subtle, using semi-transparent `shadow-black/3` rather than heavy box shadows.
- **Glassmorphism:** `backdrop-blur-md` + `bg-white/10` used for overlay elements (header, map overlays).

### Key CSS Utilities (globals.css)

**`pb-safe`** — Safe area bottom padding for iOS home bar:
```css
@utility pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 1rem);
}
```

**`no-scrollbar`** — Hides scrollbars while preserving scroll functionality:
```css
@utility no-scrollbar {
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

**Custom scrollbar** — Styled thin scrollbar with green hover accent on non-hidden scrollbars.

### Tailwind v4 Theming

The app uses Tailwind v4's `@theme inline` block and CSS custom properties (OKLCH color space):
```css
:root {
  --background: oklch(1 0 0);       /* white */
  --foreground: oklch(0.145 0 0);   /* near-black */
  --radius: 0.625rem;               /* base radius token */
  /* ... shadcn design tokens ... */
}
```

Dark mode is supported via the `.dark` class (via `next-themes`), though not actively toggled in the current UI.

---

## 8. PWA & Service Worker

### Manifest
The app declares itself as a PWA via `/public/manifest.json`, referenced in `layout.tsx`:
```ts
export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Meddy Technician" },
};
```

### Viewport
```ts
export const viewport: Viewport = {
  themeColor: '#00A86B',  // Green matches the brand header
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,    // Prevents zoom on mobile for app-like feel
};
```

### Service Worker Registration
Registered via an inline `<Script>` in `layout.tsx` with `strategy="afterInteractive"`:
```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js');
  });
}
```

The `sw.js` file lives in `/public/sw.js` (not generated by Next.js — must be manually maintained or replaced with `next-pwa` in the future).

---

## 9. External Integrations

### OpenStreetMap (via Leaflet)

- **Tile URL:** `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **License:** Free to use; must provide attribution.
- **Custom Marker Icon:** Loaded from Leaflet's unpkg CDN.

> **Note:** For production, consider self-hosting tile icons or using a paid tile provider (Mapbox, MapTiler) for better performance, custom styling, and offline support.

### WebSocket (Planned / Stub)

- **Endpoint (placeholder):** `ws://localhost:8000/ws/technician`
- **Purpose:** Real-time bidirectional communication for location updates and live job dispatching.
- **Message format defined:** `{ type: 'LOCATION_UPDATE', lat, lng, timestamp }`

See `src/hooks/useSocket.ts` to activate.

### Sonner (Toast Notifications)

Global `<Toaster position="top-center" richColors />` mounted in `layout.tsx`. Used throughout the app for:
- Job status updates
- Sync feedback
- Fleet tracking actions
- Login/logout lifecycle events

---

## 10. Setup & Installation Guide

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 18.x (20.x recommended) |
| npm | ≥ 9.x |
| Git | Latest |

### Step-by-Step Setup

**1. Clone the repository**
```bash
git clone <repository-url>
cd technician-app
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment variables**

Create a `.env.local` file in the project root. Currently no `.env` variables are required for the mock/development mode. For production, add:

```env
# Example future variables
NEXT_PUBLIC_WS_URL=ws://your-websocket-server.com/ws/technician
NEXT_PUBLIC_API_BASE_URL=https://api.meddynet.com
NEXT_PUBLIC_MAPS_API_KEY=your-mapbox-key   # If switching from OSM to Mapbox
```

**4. Run the development server**
```bash
npm run dev
```

Opens at `http://localhost:3000`. The app auto-redirects to `/dashboard`, which redirects to `/login` (since no auth state exists in a fresh session).

**5. Log in (development)**
- Enter **any** 10-digit number in the phone field.
- Click "Receive Access Code".
- Enter **any** 4-digit code (e.g., `1234`).
- Click "Authorize Login" — you will be directed to the dashboard.

**6. Build for production**
```bash
npm run build
npm run start
```

**7. Lint the codebase**
```bash
npm run lint
```

### Network Access (Local Device Testing)

The `next.config.ts` allows `192.168.56.1` as an allowed dev origin for LAN testing. To test on a real mobile device on the same Wi-Fi network:
1. Find your computer's LAN IP address.
2. Add it to `allowedDevOrigins` in `next.config.ts`.
3. Access `http://<your-ip>:3000` from the mobile browser.

---

## 11. Scalability & Improvement Suggestions

### Backend Integration

| Feature | Recommendation |
|---|---|
| **Authentication** | Implement a real OTP verification service (MSG91, Twilio Verify) with a `/api/auth/send-otp` and `/api/auth/verify-otp` endpoint. Store auth tokens (JWT) in HTTP-only cookies. |
| **Job data** | Replace `MOCK_JOBS` with a REST/GraphQL API call. Use `@tanstack/react-query` (already installed) for caching and refetching. |
| **Real-time dispatch** | Activate `useSocket.ts` WebSocket hook. Have the dispatch backend push new jobs as WebSocket messages. |
| **State persistence** | Add Zustand's `persist` middleware with `localStorage` to survive page reloads. |

### Performance

| Optimization | Details |
|---|---|
| **Map tiles** | Use `next-pwa` or a service worker strategy to pre-cache map tiles for the technician's current city for offline use. |
| **Code splitting** | `LiveMap` is already dynamically imported. Consider dynamic imports for heavy dashboard widgets. |
| **Image optimization** | Ensure all images in `/public/` are WebP format. Use Next.js `<Image>` component (already used for the logo). |

### UX Enhancements

| Feature | Details |
|---|---|
| **Real OTP input** | Replace the single `<input>` for OTP with a 4-box separated input for better UX. |
| **Push notifications** | Wire the Service Worker to receive Web Push notifications for new job dispatches while the app is in the background. |
| **Offline support** | Implement a proper `sw.js` with caching strategies (stale-while-revalidate for job data). |
| **Notification state** | The notification center currently uses a static `NOTIFICATIONS` array. Persist read/unread state in Zustand + store. |
| **Profile sub-pages** | `payments/`, `privacy/`, `support/`, `status/` routes exist but need page content implemented. |
| **Filter/Export History** | The History page has filter and export buttons that are currently decorative — wire to actual filter logic and CSV export. |

### Security

| Risk | Mitigation |
|---|---|
| No route protection server-side | Currently uses client-side redirect only. Add Next.js Middleware (`middleware.ts`) to check auth cookies server-side and redirect unauthenticated requests to `/login`. |
| Phone + OTP not validated | Must be replaced with server-backed verification before production deployment. |
| Zustand state in memory only | Auth state is lost on refresh. Implement secure token-based sessions. |

### Testing

| Test Type | Tools |
|---|---|
| Unit tests | Jest + React Testing Library for stores and utility functions |
| Component tests | Storybook for isolated component review |
| E2E tests | Playwright for full login + job lifecycle flows |

---

*Documentation generated: April 2026 · MeddyNet Technician App · Build MEDDY-TECH-882-PWA*
