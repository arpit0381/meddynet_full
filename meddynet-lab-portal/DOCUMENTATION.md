# MeddyNet Lab Partner Portal — Comprehensive Documentation

> **Version:** 0.1.0 | **Framework:** Next.js 16 (App Router) | **Language:** TypeScript 5 | **Styling:** Tailwind CSS v4

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Project Structure](#2-project-structure)
3. [Technology Stack](#3-technology-stack)
4. [Design System & Global Styles](#4-design-system--global-styles)
5. [Frontend Architecture — Pages & Routes](#5-frontend-architecture--pages--routes)
6. [Component Library](#6-component-library)
7. [Data Layer — Models & Interfaces](#7-data-layer--models--interfaces)
8. [Utilities & Validation](#8-utilities--validation)
9. [State Management & Data Flow](#9-state-management--data-flow)
10. [Core Workflows — Step-by-Step](#10-core-workflows--step-by-step)
11. [Configuration Files](#11-configuration-files)
12. [Setup & Installation Guide](#12-setup--installation-guide)
13. [Scalability & Improvement Suggestions](#13-scalability--improvement-suggestions)

---

## 1. Project Overview

### Purpose

**MeddyNet Lab Partner Portal** is a B2B SaaS-style web application built for diagnostic laboratories that are registered as partners on the MeddyNet healthcare platform. It serves as the **sole management console** for lab administrators to:

- Monitor and manage patient bookings in real-time
- Assign and track field technicians (phlebotomists)
- Upload diagnostic reports and deliver them to patients
- Manage the lab's public-facing profile (name, address, certifications, operating hours)
- Track revenue, earnings, and subscription status
- Receive and act upon real-time notifications (new bookings, report requests, technician status)

### Key Features

| Feature | Description |
|---|---|
| **Live Dashboard** | KPI cards (revenue, bookings, new patients, accuracy) + real-time booking queue |
| **Bookings Management** | Filter/search bookings by status, type, date; update status; cancel bookings |
| **Technician Management** | Add/remove field technicians, toggle duty status, view live location & stats |
| **Report Upload Center** | Drag-and-drop file upload with patient selection, upload progress, audit trail, upload history |
| **Lab Profile Editor** | Edit name, contact, address, operating hours, certifications, service facilities |
| **Notifications Hub** | Categorized notification feed (Bookings, Reports, Technicians, System) with mark-all-as-read |
| **Global Search** | ⌘K / Ctrl+K spotlight search across pages, tests, and patients |
| **Responsive Layout** | Mobile drawer sidebar + desktop fixed layout; fully responsive |

### Goals

- Provide a **premium, production-grade** management experience for lab admins
- All data operations feel instant via optimistic UI updates and local state
- Zero server / database dependency in this frontend-only version (ready for API integration)
- 100% lint-clean, type-safe TypeScript codebase

---

## 2. Project Structure

```
meddynet-lab-portal/
│
├── public/                         # Static assets (favicon, logo icon.png)
├── src/
│   ├── app/                        # Next.js App Router — all pages live here
│   │   ├── layout.tsx              # Root layout (fonts, HydrationGuard, PortalLayoutWrapper)
│   │   ├── page.tsx                # Root redirect → /login
│   │   ├── globals.css             # Global design tokens, animations, scrollbar styles
│   │   │
│   │   ├── login/page.tsx          # Login page (no sidebar layout)
│   │   ├── register/page.tsx       # Registration / onboarding page
│   │   ├── launch/page.tsx         # Landing/marketing page
│   │   ├── subscription/page.tsx   # Subscription selection (no sidebar)
│   │   │
│   │   ├── dashboard/page.tsx      # Main KPI dashboard
│   │   ├── bookings/page.tsx       # Bookings list & management
│   │   ├── calendar/page.tsx       # Appointment calendar view
│   │   ├── tests/
│   │   │   ├── page.tsx            # Lab's test catalog (list, edit, delete)
│   │   │   └── add/page.tsx        # Add a new diagnostic test
│   │   ├── reports/page.tsx        # Report upload center
│   │   ├── patients/page.tsx       # Patient records list
│   │   ├── technicians/
│   │   │   ├── page.tsx            # Technician list & onboarding
│   │   │   └── [id]/page.tsx       # Individual technician detail view
│   │   ├── queries/page.tsx        # Patient queries / support messages
│   │   ├── earnings/page.tsx       # Revenue & earnings dashboard
│   │   ├── profile/page.tsx        # Lab profile editor
│   │   ├── settings/page.tsx       # Portal settings
│   │   ├── notifications/page.tsx  # Notifications & activity log hub
│   │   └── subscription/
│   │       └── manage/page.tsx     # Subscription management
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── PortalLayoutWrapper.tsx   # Root layout orchestrator (sidebar + topbar)
│   │   ├── dashboard/
│   │   │   ├── LabSidebar.tsx            # Fixed sidebar navigation
│   │   │   ├── LabTopbar.tsx             # Fixed top header bar
│   │   │   └── BookingActions.tsx        # Inline booking action menu (view/status/cancel)
│   │   ├── cards/
│   │   │   └── LabTestCard.tsx           # Reusable test/lab listing card
│   │   └── ui/
│   │       ├── Modal.tsx                 # Animated portal modal (renders into document.body)
│   │       ├── ConfirmationModal.tsx     # Typed confirmation dialog (info/warning/danger/success)
│   │       ├── Toast.tsx                 # Auto-dismissing toast notification
│   │       └── HydrationGuard.tsx        # SSR hydration mismatch prevention wrapper
│   │
│   ├── data/                       # Static mock data (replaces a real database/API in dev)
│   │   ├── dashboard.ts            # Bookings, reports, vault files, payment transactions
│   │   ├── labs.ts                 # Lab profiles, tests, reviews, facilities
│   │   ├── tests.ts                # Popular tests info, test categories
│   │   └── user.ts                 # Current logged-in user profile
│   │
│   ├── lib/
│   │   └── utils.ts                # `cn()` utility (clsx + tailwind-merge)
│   │
│   └── utils/
│       └── validation.ts           # Form validation helpers (name, phone, email, password, DOB, OTP)
│
├── next.config.ts                  # Next.js config (React Compiler enabled)
├── tsconfig.json                   # TypeScript compiler config
├── eslint.config.mjs               # ESLint flat config (next/core-web-vitals + next/typescript)
├── postcss.config.mjs              # PostCSS config for Tailwind CSS v4
└── package.json                    # Dependencies & scripts
```

### Key Directories Explained

| Directory | Role |
|---|---|
| `src/app/` | Every folder = a URL route (Next.js App Router). Files named `page.tsx` are rendered as pages. |
| `src/components/` | Reusable React components, organized by concern (layout, dashboard, UI, cards). |
| `src/data/` | Hard-coded TypeScript mock data. **This is where a real API/database would be connected.** |
| `src/lib/` | Shared utility functions (currently only `cn()`). |
| `src/utils/` | Domain-specific utilities (input validation). |

---

## 3. Technology Stack

| Tool | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.0 | React framework with App Router, server/client components |
| **React** | 19.2.4 | UI rendering |
| **TypeScript** | ^5 | Static type safety across the entire codebase |
| **Tailwind CSS** | ^4 | Utility-first CSS with custom design tokens via `@theme` |
| **Framer Motion** | ^12 | Page transitions, list animations, AnimatePresence |
| **Lucide React** | ^0.577 | Icon library (100+ icons used) |
| **clsx** | ^2.1.1 | Conditional class name joining |
| **tailwind-merge** | ^3.5 | Merges Tailwind classes without conflicts |
| **Plus Jakarta Sans / Inter** | Google Fonts | Primary and secondary typefaces |
| **React Compiler** | 1.0.0 | Babel plugin for automatic memoization optimization |

### Why No Backend?

This is a **frontend-only** implementation. All data comes from TypeScript files in `src/data/`. This is deliberate for rapid UI prototyping. The **backend integration section** (see §13) describes how to connect a real API.

---

## 4. Design System & Global Styles

### File: `src/app/globals.css`

This is the single source of truth for the entire visual design system.

#### Color Tokens (defined via `@theme inline`)

```css
--color-primary:       #00A86B  /* MeddyNet green — main brand color */
--color-primary-light: #00c97a  /* Lighter green for hover states */
--color-primary-dark:  #008f5a  /* Darker green for active states */
--color-accent:        #1E88E5  /* Blue accent — secondary highlights */
--color-dark:          #0F172A  /* Rich dark navy — dark backgrounds */
--color-dark-light:    #1a1a2e  /* Slightly lighter dark */
--color-surface:       #F7FBFF  /* Light blue-tinted off-white surfaces */
--color-surface-white: #ffffff  /* Pure white */
--color-text:          #2C3E50  /* Primary body text */
--color-text-secondary:#546e7a  /* Secondary labels */
--color-text-muted:    #78909c  /* Muted/placeholder text */
--color-text-light:    #94a3b8  /* Very light text */
--color-border:        #eef2f7  /* Subtle borders */
--color-border-dark:   #e0e7ee  /* Slightly stronger borders */
--color-star:          #f9a825  /* Star/rating yellow */
--color-success:       #10b981  /* Success green */
--color-warning:       #f59e0b  /* Warning amber */
--color-error:         #ef4444  /* Error red */
```

> **For developers:** Use these as Tailwind classes. For example: `bg-primary`, `text-text-muted`, `border-border-dark`, `text-surface`.

#### Typography

```css
--font-sans: 'Plus Jakarta Sans', 'Inter', sans-serif;
```

Both fonts are loaded from Google Fonts in `layout.tsx` via `next/font/google` for zero layout shift (FOUT prevention).

- **Plus Jakarta Sans** — Primary font, `--font-plus-jakarta`, weights 300–900
- **Inter** — Secondary/utility font, `--font-inter`, weights 300–700

#### Border Radius Extensions

```css
--radius-4xl: 2rem   /* Extra rounded cards, pill-shaped elements */
--radius-5xl: 2.5rem /* Modals, large cards */
```

#### CSS Utility Classes

| Class | Effect |
|---|---|
| `.gradient-primary` | Green diagonal gradient |
| `.gradient-dark` | Dark navy gradient |
| `.gradient-hero` | Radial green+blue hero gradient |
| `.glass` | White glassmorphism (92% opacity + blur) |
| `.glass-dark` | Dark glassmorphism |
| `.skeleton` | Shimmer loading placeholder animation |
| `.no-scrollbar` | Hides scrollbars while keeping scrollability |
| `.animate-float` | 6s vertical bob animation |
| `.animate-pulse-ring` | Expanding ring glow animation |
| `.animate-gradient` | Animated gradient shift |
| `.animate-glow-pulse` | Pulsing green glow shadow |

---

## 5. Frontend Architecture — Pages & Routes

### Routing Model

Next.js App Router maps filesystem structure to URLs:

```
src/app/dashboard/page.tsx  →  /dashboard
src/app/technicians/[id]/page.tsx  →  /technicians/:id
```

### Route Classification

#### Public Routes (No Sidebar/Topbar)

These routes bypass `PortalLayoutWrapper`'s shell navigation. Defined in `noLayoutPaths` inside `PortalLayoutWrapper.tsx`:

```typescript
const noLayoutPaths = ['/', '/login', '/register', '/subscription', '/launch'];
```

| Route | Component | Purpose |
|---|---|---|
| `/` | `RootRedirect` | Redirects to `/login` via `useRouter` |
| `/login` | Login page | Partner authentication (email + password) |
| `/register` | Register page | New lab onboarding |
| `/subscription` | Subscription page | Plan selection before portal access |
| `/launch` | Launch page | Public landing/marketing page |

#### Protected Routes (With Sidebar + Topbar)

All other routes receive the full portal shell layout.

| Route | Component | Features |
|---|---|---|
| `/dashboard` | `LabDashboardHome` | KPI stats, today's bookings queue, popular tests chart, staff intelligence |
| `/bookings` | `BookingsPage` | Tab filters, search, status update, cancel booking |
| `/calendar` | Calendar page | Appointment calendar view |
| `/tests` | Tests catalog page | View, edit, delete lab tests |
| `/tests/add` | Add test page | Form to add a new diagnostic test |
| `/reports` | `ReportUploadPage` | Drag-and-drop upload, patient selector, upload history, audit trail |
| `/patients` | Patient records page | Patient list management |
| `/technicians` | `TechnicianManagementPage` | Technician grid, add modal, duty toggle |
| `/technicians/[id]` | Technician detail page | Individual technician analytics |
| `/queries` | Queries page | Patient support message inbox |
| `/earnings` | Earnings page | Revenue charts and payout history |
| `/profile` | `LabProfileEditPage` | Business info form, operating hours, accreditations, facilities |
| `/settings` | Settings page | Portal preferences |
| `/notifications` | `NotificationsPage` | Categorized activity log feed |
| `/subscription/manage` | Subscription manage | Current plan, upgrades/renewals |

---

### Page Details

#### `/dashboard` — `LabDashboardHome`

**Purpose:** Central command center showing today's operational intelligence.

**Local State:**
```typescript
const [stats] = useState(initialStats);        // KPI cards data
const [toast, setToast] = useState(...);       // Success/error feedback
const [recentBookings, setRecentBookings] = useState(initialRecentBookings);
```

**UI Sections:**
1. **Header** — Greeting (lab name) + current date badge
2. **Stats Grid** — 4 animated KPI cards: Total Revenue, Total Bookings, New Patients, Test Accuracy
3. **Today's Bookings** — Live list of bookings with inline `BookingActions` component per row
4. **Most Requested Tests** — Animated progress bar chart (Framer Motion)
5. **Operational Excellence** — Dark CTA card
6. **Staff Intelligence** — Timeline of key shift events

**Key Logic:**
- `handleStatusUpdate(id, newStatus)` — Maps over `recentBookings`, updates the matching record's `.status` field, and triggers a success `Toast`
- `handleCancel(id)` — Filters out the cancelled booking from state, triggers a success `Toast`

---

#### `/bookings` — `BookingsPage`

**Purpose:** Full bookings management with filtering and search.

**Local State:**
```typescript
const [activeTab, setActiveTab]         // "All Bookings" | "Today" | "Upcoming" | "Home Visits"
const [searchTerm, setSearchTerm]       // Search query string
const [toast, setToast]                 // Toast notification
const [bookings, setBookings]           // Master bookings array
```

**Filtering Logic (`useMemo`):**
```typescript
const filteredBookings = useMemo(() => {
  return bookings.filter(booking => {
    const matchesSearch = booking.patient.includes(searchTerm) || 
                          booking.id.includes(searchTerm) ||
                          booking.tests.some(t => t.includes(searchTerm));
    
    const matchesTab = activeTab === "All Bookings" || 
                       (activeTab === "Today" && booking.date.includes("Today")) || ...
    
    return matchesSearch && matchesTab;
  });
}, [bookings, searchTerm, activeTab]);
```

> **Why `useMemo`?** Avoids re-filtering on every render. Only recalculates when `bookings`, `searchTerm`, or `activeTab` changes.

**CRUD Operations:**
- **Update Status:** `handleStatusUpdate(id, newStatus)` → mutates state + shows Toast
- **Cancel Booking:** `handleCancel(id)` → filters out booking + shows Toast

---

#### `/technicians` — `TechnicianManagementPage`

**Purpose:** Manage phlebotomists/field technicians.

**Technician Interface:**
```typescript
interface Technician {
  id: string;           // e.g., "T-501"
  name: string;
  status: string;       // "On Duty" | "Idle" | "On Break"
  location: string;
  rating: number;
  collections: number;  // Today's collection count
  vehicle: string;
  email?: string;
  shift?: string;       // "Morning" | "Evening" | "Full Day"
}
```

**Key Operations:**
- **Search** (`useMemo`) — Filters by name or ID
- **Toggle Duty Status** — Cycles: `On Duty → Idle → On Break → On Duty`
- **Add Technician** — Modal form with validation (name min 3 chars, phone exactly 10 digits); uses `validateFullName()` and `validatePhone()` from `src/utils/validation.ts`
- **View Profile** — Links to `/technicians/[id]`

**Add Technician Form Fields:**
| Field | Validation | Notes |
|---|---|---|
| Full Name | Min 3 chars, letters/spaces/dots/hyphens only | Uses `validateFullName()` |
| Phone | Exactly 10 digits | Uses `validatePhone()` |
| Email | Required, email type input | |
| Govt. ID / Aadhar | Required text | |
| Vehicle | Optional text | |
| Shift | Dropdown: Morning / Evening / Full Day | |

---

#### `/reports` — `ReportUploadPage`

**Purpose:** Upload diagnostic PDFs/images and deliver them to patients.

**Upload Workflow:**
1. User selects a patient from the "Pending" sidebar
2. User clicks the upload zone (or drag-drops a file)
3. A hidden `<input type="file">` is triggered via `fileInputRef`
4. `handleFileChange()` intercepts the file, stores it in `pendingFile` state, opens a `ConfirmationModal`
5. User confirms → `handleConfirmUpload()` calls `simulateUpload(fileName)`
6. `simulateUpload()` runs a `setInterval` incrementing `uploadProgress` 0→100 every 150ms
7. On completion: new record added to `recentUploads`, patient removed from `pendingReports`, Toast shown

**State Variables:**
```typescript
const [searchTerm, setSearchTerm]             // Search pending reports
const [searchTermHistory, setSearchTermHistory] // Search upload history
const [isUploading, setIsUploading]           // Upload in-progress flag
const [uploadProgress, setUploadProgress]     // 0-100 integer
const [recentUploads, setRecentUploads]       // Upload history array
const [viewingReport, setViewingReport]       // Report being audited in modal
const [pendingReports, setPendingReports]     // Reports awaiting upload
const [selectedReportId, setSelectedReportId] // Currently selected patient
const [showConfirmUpload, setShowConfirmUpload] // Confirmation modal open
const [pendingFile, setPendingFile]           // File object awaiting confirmation
const fileInputRef                            // Ref to hidden file input element
```

---

#### `/profile` — `LabProfileEditPage`

**Purpose:** Edit the lab's public-facing profile information.

**Form Data Structure:**
```typescript
const [formData, setFormData] = useState({
  name: "National Diagnostics & Research Center",
  contact: "+91 98765 43210",
  address: "Plot 45, Ground Floor, Sector 4...",
  website: "https://www.nationaldiag.com",
  experience: "15+ Years",
  patientsServed: "50,000+"
});
```

**Dynamic Collections:**
- `accreditations: string[]` — NABL, ISO, CAP, etc. (add/remove)
- `operatingHours: { day, time, isOpen }[]` — Editable timing inputs per day
- `facilities: string[]` — Service tags (add/remove with animation)

**Save Pattern:**
```typescript
const handleSave = () => {
  setIsSaving(true);
  setTimeout(() => {
    setIsSaving(false);
    setToast({ message: "Profile updated successfully!", type: "success" });
  }, 1500);
};
```
> In production, replace `setTimeout` with an API `PATCH` request to your backend.

---

#### `/notifications` — `NotificationsPage`

**Purpose:** Full-page activity log hub with category filtering.

**Notification Structure:**
```typescript
{
  id: number,
  title: string,
  description: string,
  time: string,          // Relative: "5 mins ago", "Yesterday"
  date: string,          // Absolute: "Mar 19, 2024"
  unread: boolean,
  type: "booking" | "report" | "tech" | "system",
  category: "Bookings" | "Reports" | "Technicians" | "System"
}
```

**Tab Categories:** `All | Bookings | Reports | Technicians | System`

**Actions:**
- `markAllAsRead()` — Maps all notifications, sets `unread: false`
- Category filter — Derived via `Array.filter` from `activeCategory` state
- Individual item click — Navigates to the relevant route (`/bookings`, `/reports`, etc.)

---

## 6. Component Library

### Layout Components

#### `PortalLayoutWrapper` — `src/components/layout/PortalLayoutWrapper.tsx`

The **root layout orchestrator** that wraps every page.

**Props:** `{ children: ReactNode }`

**Behavior:**
- Reads current URL via `usePathname()`
- If URL is in `noLayoutPaths` (`/`, `/login`, `/register`, `/subscription`, `/launch`): renders children directly inside `HydrationGuard` (no shell)
- Otherwise: renders the full portal shell:
  - Mobile backdrop overlay (`AnimatePresence`)
  - `LabSidebar` (responsive: fixed drawer on mobile, sticky column on desktop)
  - `LabTopbar` (fixed top header)
  - Main content area with page-transition animation (`Framer Motion`)
- Suppresses MetaMask extension `unhandledrejection` errors in development

**Page Transition Animation:**
```typescript
initial={{ opacity: 0, scale: 0.98, y: 10 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 1.02, y: -10 }}
transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
```
> This gives every page a smooth scale-in/scale-out transition automatically.

---

#### `LabSidebar` — `src/components/dashboard/LabSidebar.tsx`

**Props:**
```typescript
{
  isOpen?: boolean;    // Mobile drawer open state
  onClose?: () => void; // Close callback
}
```

**Navigation Items (`navItems` array):**
```typescript
{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
{ href: "/bookings",  label: "Bookings",  icon: ClipboardList },
{ href: "/calendar",  label: "Calendar",  icon: Calendar },
// ... 13 items total
```

**Active State Detection:**
```typescript
const isActive = pathname === item.href;
// Active item gets: "bg-primary text-white shadow-xl shadow-primary/20"
// Inactive items get: "text-text-muted hover:bg-surface hover:text-dark-light"
```

**Responsive Behavior:**
- **Desktop (lg+):** Sticky to `top-[72px]`, always visible, `w-72`
- **Mobile:** Fixed full-height drawer from left, `w-[85%] sm:w-80`

**Bottom Section:** Lab verified badge (emerald shield), user initials + name card, logout button

---

#### `LabTopbar` — `src/components/dashboard/LabTopbar.tsx`

The **fixed top navigation bar** (72px height) with 3 zones:

**Left Zone:** Logo + "Partner Portal" label linking to `/dashboard`; hamburger menu button (mobile only)

**Middle Zone:** Global Search Bar (hidden on mobile, triggered separately)
- Activates on focus or `⌘K` / `Ctrl+K` keyboard shortcut
- Shows "Quick Access" grid (Add Test, Bookings, Reports, Technicians) when empty
- Searches across `navigationItems`, `popularTests`, and `mockPatients` simultaneously
- Groups results by type (Navigation / Test / Patient)
- Max 8 results, grouped with type labels
- Clears and closes on result click

**Right Zone:**
- Mobile search icon button
- Notification bell with unread count badge (red dot)
  - Dropdown with 3 notification previews
  - Click navigates to relevant page and marks notification as read
  - "View All Activity Logs" → `/notifications`
- Divider
- Profile dropdown (Lab name + "ND" initials avatar)
  - Shows Lab ID
  - Links to `/profile` (Lab Settings)
  - Links to `https://meddynet.com/support` (Partner Support)

---

### Dashboard Components

#### `BookingActions` — `src/components/dashboard/BookingActions.tsx`

A **self-contained inline action menu** for every booking row.

**Props:**
```typescript
interface BookingActionsProps {
  bookingId: string;
  variant?: "icon" | "button";   // "icon" = three-dot menu, "button" = Actions dropdown
  patientName?: string;
  onStatusUpdate?: (id: string, newStatus: string) => void;
  onCancel?: (id: string) => void;
}
```

**Internal State Machine:**
```typescript
const [isOpen, setIsOpen]         // Dropdown open
const [activeModal, setActiveModal] // "view" | "status" | "cancel" | null
const [pendingStatus, setPendingStatus] // Pending status change value
const [showStatusConfirm, setShowStatusConfirm] // Two-step confirmation
```

**Actions:**
1. **View Details** → Opens `Modal` with patient info, tests, date/time, amount
2. **Update Status** → Opens `Modal` with status picker (6 options); selection triggers `ConfirmationModal`; on confirm calls `onStatusUpdate` prop
3. **Cancel Booking** → Opens inline cancel `Modal`; on confirm calls `onCancel` prop

**Click-outside handling:** `useRef` + `document.addEventListener("mousedown", ...)` pattern

**Status Flow for Status Update (2-step):**
```
Click status option
  → setPendingStatus(label)
  → setShowStatusConfirm(true)  ← Opens ConfirmationModal
    → User confirms
    → onStatusUpdate(bookingId, pendingStatus)  ← Propagates to parent
    → Closes all modals
```

---

### UI Components

#### `Modal` — `src/components/ui/Modal.tsx`

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;  // default: "max-w-2xl"
}
```

**Key Implementation Details:**
- Uses `ReactDOM.createPortal()` to render into `document.body` — avoids z-index stacking issues
- Waits until mounted (`useEffect + setTimeout(0)`) before rendering portal — prevents SSR hydration errors
- Locks body scroll when open: `document.body.style.overflow = "hidden"`
- Backdrop click closes modal
- Spring animation: `{ type: "spring", damping: 25, stiffness: 300 }`
- Bottom-sheet style on mobile (`rounded-t-5xl`), centered on desktop (`rounded-5xl`)
- Content is scrollable (`max-h-[75vh] overflow-y-auto`)

---

#### `ConfirmationModal` — `src/components/ui/ConfirmationModal.tsx`

A typed confirmation dialog built on top of `Modal`.

**Props:**
```typescript
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;    // default: "Confirm"
  cancelText?: string;     // default: "Cancel"
  type?: "info" | "warning" | "danger" | "success";
  isLoading?: boolean;
}
```

**Type → Visual Config mapping:**
| Type | Icon | Icon Color | Button Color |
|---|---|---|---|
| `info` | Info | Primary blue-green | Dark |
| `warning` | AlertCircle | Amber | Amber |
| `danger` | XCircle | Red | Red |
| `success` | CheckCircle2 | Emerald | Emerald |

**Loading State:** When `isLoading=true`, confirms button shows a spinning Framer Motion loader

---

#### `Toast` — `src/components/ui/Toast.tsx`

**Props:**
```typescript
interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;  // default: 3000ms
}
```

**Behavior:**
- Renders at `bottom-8` of the viewport, centered
- Auto-dismisses after `duration` ms via `useEffect + setTimeout`
- Should be wrapped in `AnimatePresence` in parent for enter/exit animation
- Manual close X button

**Usage Pattern:**
```tsx
const [toast, setToast] = useState<{message: string, type: "success" | "error"} | null>(null);

// Trigger:
setToast({ message: "Booking cancelled", type: "success" });

// Render:
<AnimatePresence>
  {toast && (
    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
  )}
</AnimatePresence>
```

---

#### `HydrationGuard` — `src/components/ui/HydrationGuard.tsx`

**Props:** `{ children: React.ReactNode }`

**Purpose:** Prevents React hydration mismatches between server-rendered HTML and client-rendered HTML. This happens when browser extensions (like MetaMask) inject content into the DOM that differs from what Next.js SSR produces.

**Implementation:**
```typescript
export default function HydrationGuard({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);  // Only runs on client
  }, []);

  if (!mounted) return null;  // Don't render during SSR
  return <>{children}</>;
}
```

> Every page that uses browser APIs or has dynamic content that differs between server and client should be wrapped in `HydrationGuard`.

---

#### `LabTestCard` — `src/components/cards/LabTestCard.tsx`

A reusable card for displaying a lab + test combination in search/catalog views.

**Props:**
```typescript
interface LabTestCardProps {
  id: string;
  labName: string;
  initials: string;
  rating: number;
  reviewCount: number;
  testName?: string;
  price: number;
  originalPrice: number;
  distance: number;
  homeCollection: boolean;
  certified: string;    // e.g., "NABL Certified"
  turnaround: string;   // e.g., "Same Day"
  color: string;        // Tailwind gradient class
}
```

**Computed Value:**
```typescript
const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
// Shown as badge if > 0: "23% OFF"
```

**Book Now** links to `/labs/[id]` — the patient-facing lab detail page.

---

## 7. Data Layer — Models & Interfaces

Since this is a frontend-only app, all data is defined as TypeScript interfaces + exported constants in `src/data/`.

### `src/data/dashboard.ts`

#### `Booking` Interface
```typescript
interface Booking {
  id: string;          // e.g., "MN892341"
  labName: string;
  labInitials: string;
  labColor: string;    // Tailwind gradient class
  tests: string[];     // Array of test names
  date: string;        // "2024-03-20"
  time: string;        // "09:00 AM"
  status: "Upcoming" | "Completed" | "Cancelled";
  type: "Home Collection" | "Lab Visit";
  totalAmount: number; // In INR
}
```

#### `Report` Interface
```typescript
interface Report {
  id: string;           // e.g., "REP-983"
  testName: string;
  labName: string;
  date: string;
  status: "Ready" | "Processing";
  fileUrl?: string;
  abnormal: boolean;    // Flag for abnormal results
}
```

#### `VaultFile` Interface
```typescript
interface VaultFile {
  id: string;
  name: string;
  category: "Prescription" | "Lab Report" | "Scan" | "Invoice";
  uploadDate: string;
  size: string;         // e.g., "1.2 MB"
  doctorName?: string;
}
```

#### `PaymentTransaction` Interface
```typescript
interface PaymentTransaction {
  id: string;          // e.g., "TXN-88220199"
  bookingId: string;
  date: string;
  amount: number;
  method: "UPI" | "Card" | "NetBanking";
  status: "Successful" | "Pending" | "Failed";
}
```

---

### `src/data/labs.ts`

#### `Lab` Interface
```typescript
interface Lab {
  id: string;
  name: string;
  slug: string;         // URL-safe identifier
  initials: string;     // 2-letter abbreviation for avatar
  rating: number;       // 0-5 float
  reviewCount: number;
  distance: number;     // km from user
  address: string;
  city: string;
  verified: boolean;    // MeddyNet verified partner
  nabl: boolean;        // NABL accredited
  iso: boolean;         // ISO certified
  homeCollection: boolean;
  operatingHours: string;
  phone: string;
  email?: string;
  website?: string;
  about: string;
  image: string;        // Path to lab image asset
  color: string;        // Tailwind gradient for avatar
  established?: number; // Year
  totalPatients?: number;
  specialties?: string[];
  ratingBreakdown?: { stars: number; count: number }[];
  tests: LabTest[];
  reviews: Review[];
  facilities?: Facility[];
}
```

#### `LabTest` Interface
```typescript
interface LabTest {
  id: string;
  name: string;
  category: string;
  price: number;              // Current price (INR)
  originalPrice: number;      // MRP before discount
  turnaround: string;         // e.g., "Same Day", "4-6 Hours"
  homeCollectionAvailable: boolean;
  popular: boolean;
  description?: string;
  parameters?: number;        // Number of test parameters
}
```

#### Helper Functions
```typescript
getLabById(id: string): Lab | undefined
getLabBySlug(slug: string): Lab | undefined
```

---

### `src/data/tests.ts`

#### `TestInfo` Interface
```typescript
interface TestInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;         // Emoji icon
  popular: boolean;
  minPrice: number;     // Cheapest across all labs
  maxPrice: number;     // Most expensive across all labs
  labCount: number;     // Number of labs offering this test
}
```

**Exports:**
- `popularTests: TestInfo[]` — Used by `LabTopbar` for search results
- `testCategories: string[]` — Category filter list (Hematology, Thyroid, Cardiology, etc.)

---

### `src/data/user.ts`

#### `UserProfile` Interface
```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;       // Initials string, e.g., "AS"
  age: number;
  gender: "Male" | "Female" | "Other";
  bloodGroup: string;   // e.g., "O+"
  memberSince: string;  // e.g., "Jan 2024"
}
```

**Export:** `currentUser: UserProfile` — The currently authenticated user's profile data

---

## 8. Utilities & Validation

### `src/lib/utils.ts` — `cn()` function

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Purpose:** Merge Tailwind CSS class names intelligently. Resolves conflicts (e.g., `cn("p-4", "p-2")` → `"p-2"`). Use this whenever you conditionally apply Tailwind classes.

**Example:**
```tsx
<div className={cn("rounded-full px-4 py-2", isActive && "bg-primary text-white")}>
```

---

### `src/utils/validation.ts`

A collection of input sanitization and validation functions designed for on-the-fly form validation.

#### `validateFullName(name: string): string`
Sanitizes while the user types:
- Strips any character except letters, spaces, dots, hyphens
- Removes leading spaces
- Collapses multiple spaces into one

#### `validatePhone(phone: string): string`
Sanitizes while the user types:
- Strips all non-digit characters
- Caps length at 10 digits (Indian mobile number format)

#### `validateEmail(email: string): string`
Sanitizes while the user types:
- Removes all whitespace
- Converts to lowercase

#### `isValidEmail(email: string): boolean`
```typescript
const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return re.test(email);
```
Simple format check — not DNS validation.

#### `validatePassword(password: string): boolean`
Password strength rules:
- Minimum 8 characters
- At least one digit (0-9)
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- No spaces

#### `getPasswordErrorMessage(password: string): string | null`
Returns the first failing rule as a user-friendly message, or `null` if valid.

#### `validateDOB(dob: string): boolean`
Checks that the date of birth is between `1900-01-01` and today.

#### `validateOTP(otp: string): string`
- Strips non-digits
- Caps at 6 digits

#### `verifyEmailExists(email: string): Promise<boolean>` ⚠️ *Mock*
Simulates a server-side email validity check with a 1.5-second delay. Logic:
1. Validates format with `isValidEmail`
2. Blocks known disposable email domains (tempmail, mailinator, etc.)
3. Rejects domains with no vowels (keyboard-mash detection)
4. Rejects local parts > 15 chars with very low vowel density
5. Only accepts TLDs: `com, in, org, net, edu, io`

> **Production note:** Replace this with a real API call to your backend email verification service (e.g., Mailgun, ZeroBounce, or your own).

---

## 9. State Management & Data Flow

### Architecture Overview

This application uses **React's built-in local state** only — no Redux, Zustand, or Context API for data. This works because:
- All features are page-scoped (each page manages its own data)
- There is no real authentication state to share globally
- No API responses to cache across routes

### Data Flow Pattern

```
Mock Data (src/data/*.ts)
        ↓  (imported into page component)
useState() initialization
        ↓  (user interaction: click, type, submit)
Event Handler (handleX())
        ↓  (setState call)
React re-renders component
        ↓  (new UI state shown)
Toast / Modal feedback to user
```

### Cross-Component Communication

The only "parent ↔ child" communication pattern used is **callback props**:

```tsx
// Parent (dashboard/page.tsx):
<BookingActions
  bookingId={booking.id}
  onStatusUpdate={handleStatusUpdate}  // ← callback
  onCancel={handleCancel}              // ← callback
/>

// Child (BookingActions.tsx):
const handleConfirmStatusChange = () => {
  onStatusUpdate(bookingId, pendingStatus);  // ← calls parent callback
};
```

### Notification State

The `LabTopbar` and `NotificationsPage` maintain **separate notification states**. They both initialize from the same hard-coded data, but mutations (mark as read) are local to each component.

> **For production:** Use a global state manager (Zustand recommended) or React Context to share notification state between `LabTopbar` and `NotificationsPage`, so marking notifications as read in one updates the other.

---

## 10. Core Workflows — Step-by-Step

### Workflow 1: User Visits the Portal

```
1. Browser loads / → src/app/page.tsx (RootRedirect)
2. useEffect fires after mount → router.push("/login")
3. Browser navigates to /login
4. PortalLayoutWrapper detects "/login" in noLayoutPaths
5. Renders /login page WITHOUT sidebar/topbar (just HydrationGuard)
6. User logs in → navigates to /dashboard
7. PortalLayoutWrapper renders full shell: sidebar + topbar + main content
8. Framer Motion page transition animates dashboard into view
```

---

### Workflow 2: Booking Status Update (2-Step Confirmation)

```
1. User sees a booking row on /dashboard or /bookings
2. Clicks the ⋮ (three-dot) or "Actions" button on BookingActions
3. BookingActions dropdown opens (AnimatePresence)
4. User clicks "Update Status"
5. activeModal → "status" (status picker Modal opens)
6. User selects a status option (e.g., "Sample Collected")
7. handleStatusChange("Sample Collected"):
   - setPendingStatus("Sample Collected")
   - setShowStatusConfirm(true) → ConfirmationModal opens (type="warning")
8. User reads confirmation: "Change booking BK-1024 to 'Sample Collected'?"
9. User clicks "Confirm Status Update"
10. handleConfirmStatusChange():
    - Calls onStatusUpdate(bookingId, "Sample Collected") → parent handler
    - Parent: setState updates the booking's status in the array
    - Toast fires: "Status updated for Rahul Sharma"
    - All modals close
11. UI re-renders with new status badge color
```

---

### Workflow 3: Report Upload

```
1. User navigates to /reports
2. Page loads with "Pending" patient list on the right sidebar
3. User clicks on "Amit Roy" → setSelectedReportId("BK-8801")
4. Row highlights with primary color indicator
5. User clicks upload zone (or clicks Arrow button on row)
6. Hidden <input type="file" ref={fileInputRef}> is triggered via fileInputRef.current.click()
7. User selects a .pdf file from OS file picker
8. handleFileChange fires:
   - Checks selectedReportId exists (else: error Toast "Please select a patient first")
   - setPendingFile(file)
   - setShowConfirmUpload(true) → ConfirmationModal opens
9. User reads: "Upload 'lipid_profile.pdf' for Amit Roy? This will notify the patient."
10. User clicks "Sync to Patient Dashboard"
11. handleConfirmUpload():
    - simulateUpload("lipid_profile.pdf")
    - setPendingFile(null)
    - setShowConfirmUpload(false)
12. simulateUpload():
    - setIsUploading(true), setUploadProgress(0)
    - setInterval every 150ms: uploadProgress += 10
    - Upload zone shows spinner + progress bar
    - At 100%: clearInterval, after 500ms timeout:
      - Add new record to recentUploads
      - Remove patient from pendingReports
      - setToast({ message: "Report delivered!", type: "success" })
      - setIsUploading(false)
13. Upload zone resets, history panel updates with new entry
```

---

### Workflow 4: Add New Technician

```
1. User clicks "Add Technician" button on /technicians
2. isAddModalOpen → true → Modal opens with onboarding form
3. User fills:
   - Name: validated via validateFullName() on each keystroke
   - Phone: validated via validatePhone() — digits only, max 10
   - Email: required
   - ID: required
   - Vehicle: optional
   - Shift: dropdown selection
4. User submits form (handleAddTech):
   - Checks name exists and phone.length === 10
   - If invalid: error Toast "valid name and 10-digit phone number"
   - If valid: creates new Technician object:
     { id: `T-${500 + techs.length + 1}`, status: "Idle", rating: 5.0, collections: 0, ... }
   - setTechs([...techs, tech])
   - setToast({ message: "${name} onboarded successfully!" })
   - setIsAddModalOpen(false), resets form
5. New technician card animates into the grid (Framer Motion)
```

---

### Workflow 5: Global Search (⌘K)

```
1. User presses ⌘K (or Ctrl+K) anywhere in the portal
2. useEffect keyboard listener fires: searchInputRef.current.focus()
3. Search input inside LabTopbar receives focus
4. isSearchFocused → true, search dropdown appears (AnimatePresence)
5. Empty query: shows Quick Access grid (Add Test, Bookings, Reports, Technicians)
6. User types "vitamin"
7. searchQuery state updates
8. searchResults computed:
   - navigationItems filtered by name.includes("vitamin")
   - popularTests filtered by name.includes("vitamin")
   - mockPatients filtered by name.includes("vitamin")
   - All combined, deduped by type, sliced to 8 results
9. groupedResults groups them into Navigation / Test / Patient sections
10. Dropdown shows grouped results with icon, name, type, and price/date
11. User clicks a result:
    - setIsSearchFocused(false), setSearchQuery("")
    - Next.js navigates to result.href (e.g., /tests/pt2)
12. Click outside: handleClickOutside via searchContainerRef — closes dropdown
```

---

## 11. Configuration Files

### `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  reactCompiler: true,  // Enables React Compiler (babel-plugin-react-compiler)
};
```

**React Compiler** automates React memoization (the equivalent of manually writing `useMemo`, `useCallback`, `React.memo`). It analyzes component code and inserts memoization automatically, improving render performance.

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": true,          // All strict checks enabled
    "noEmit": true,          // TypeScript used for type checking only (Next.js handles emit)
    "moduleResolution": "bundler",
    "paths": { "@/*": ["./src/*"] }  // Path alias: @/components = src/components
  }
}
```

The `@/` path alias is the most important setting — it allows clean imports like:
```typescript
import Modal from "@/components/ui/Modal";  // instead of "../../../components/ui/Modal"
```

### `eslint.config.mjs`

Uses Next.js's flat config ESLint setup with `next/core-web-vitals` + `next/typescript` rulesets. This enforces:
- No unused variables or imports
- No `any` types (TypeScript strict)
- React hooks rules
- Accessibility best practices

### `postcss.config.mjs`

```javascript
{ plugins: { "@tailwindcss/postcss": {} } }
```

Required for Tailwind CSS v4 (uses PostCSS plugin instead of the v3 JIT approach).

---

## 12. Setup & Installation Guide

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18.x or 20.x (LTS recommended) |
| npm | 9.x+ (comes with Node) |
| Git | Any recent version |
| OS | Windows 10/11, macOS, or Linux |

### Step-by-Step Setup

**Step 1: Clone the repository**
```bash
git clone <repository-url>
cd meddynet-lab-portal
```

**Step 2: Install dependencies**
```bash
npm install
```
> This installs all packages listed in `package.json`. The `overrides` section forces `minimatch@^10.2.4` and `brace-expansion@^5.0.5` to patch moderate security vulnerabilities in transitive dependencies.

**Step 3: Start development server**
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

**Step 4: (Optional) Run linting**
```bash
npm run lint
```
Should report 0 errors and 0 warnings for a clean codebase.

**Step 5: (Optional) Production build**
```bash
npm run build
npm start
```

### Environment Variables

This project currently has **no environment variables required** since it uses mock data. When integrating a real backend, create a `.env.local` file:

```env
# API Base URL
NEXT_PUBLIC_API_URL=https://api.meddynet.com/v1

# Authentication (if using JWT)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# File Storage (if using cloud uploads)
NEXT_PUBLIC_S3_BUCKET=meddynet-reports
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
```

> Variables prefixed with `NEXT_PUBLIC_` are safe to expose to the browser. All others are server-only.

---

## 13. Scalability & Improvement Suggestions

### Immediate Priorities for Production

#### 1. Connect a Real Backend API

Replace all `src/data/*.ts` imports with actual API calls. The recommended pattern using Next.js App Router:

```typescript
// Server Component (no "use client") — fetch at build/request time
async function BookingsPage() {
  const bookings = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());
  
  return <BookingsList initialData={bookings} />;
}
```

#### 2. Add Authentication

Use **NextAuth.js** (Auth.js v5) for session management. Protect routes with middleware:

```typescript
// src/middleware.ts
import { withAuth } from "next-auth/middleware";
export default withAuth({ pages: { signIn: "/login" } });
export const config = { matcher: ["/dashboard/:path*", "/bookings/:path*"] };
```

#### 3. Global State Management

Use **Zustand** for shared state (notifications, auth user, lab profile):

```typescript
// src/store/notifications.ts
import { create } from "zustand";

const useNotificationsStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  markAllAsRead: () => set(state => ({
    notifications: state.notifications.map(n => ({ ...n, unread: false })),
    unreadCount: 0
  }))
}));
```

#### 4. Real File Uploads

Replace `simulateUpload()` in `/reports/page.tsx` with a real multipart upload:

```typescript
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bookingId", selectedReportId);
  
  const response = await fetch("/api/reports/upload", {
    method: "POST",
    body: formData,
    // Track progress with XMLHttpRequest for real progress bar
  });
};
```

#### 5. Real-time Updates (WebSockets)

For live booking updates, integrate **Socket.IO** or Supabase Realtime:

```typescript
useEffect(() => {
  const socket = io(process.env.NEXT_PUBLIC_WS_URL);
  socket.on("new-booking", (booking) => {
    setBookings(prev => [booking, ...prev]);
    setUnreadCount(c => c + 1);
  });
  return () => socket.disconnect();
}, []);
```

#### 6. Role-Based Access Control

As the platform scales, implement RBAC for Admin vs. Staff vs. Technician roles. Protect specific features (e.g., only Admins can access `/earnings`) using middleware or layout guards.

### Performance Optimizations

| Area | Recommendation |
|---|---|
| **Images** | Use `next/image` for all lab logos — it auto-optimizes, lazy loads, and prevents CLS |
| **Data fetching** | Use SWR or React Query for client-side data fetching with caching and revalidation |
| **Bundle splitting** | Dynamic imports for large page components: `const EarningsPage = dynamic(() => import('./EarningsPage'))` |
| **Tailwind CSS** | v4 is already configured — ensure PurgeCSS is working in production build (auto in Next.js) |
| **Fonts** | Already using `next/font/google` — zero layout shift, self-hosted in production |

### Best Practices for Scaling

1. **Keep pages thin** — Move complex logic into custom hooks (`useBookings`, `useTechnicians`)
2. **Extract form logic** — Use `react-hook-form` + `zod` for form validation instead of inline handlers
3. **Add error boundaries** — Wrap critical sections in React `ErrorBoundary` components
4. **Implement proper loading states** — Use React Suspense + loading.tsx files in the App Router
5. **Add proper SEO** — Generate `metadata` objects in each page file using Next.js's `generateMetadata` API
6. **Test coverage** — Add Vitest + React Testing Library for unit tests; Playwright for E2E tests

### Recommended Backend Stack

If building the backend from scratch:

| Layer | Recommendation |
|---|---|
| **API Framework** | Node.js + Fastify, or Next.js API Routes |
| **Database** | PostgreSQL (relational data: labs, bookings, patients) |
| **ORM** | Prisma |
| **Auth** | JWT + Refresh Token pattern, or Auth.js |
| **File Storage** | AWS S3 or Cloudflare R2 for diagnostic reports |
| **Real-time** | Socket.IO or Supabase Realtime |
| **Notifications** | Twilio SMS, SendGrid Email |
| **Monitoring** | Sentry (error tracking), Vercel Analytics |

---

*Documentation generated for MeddyNet Lab Partner Portal v0.1.0 — April 2026*
