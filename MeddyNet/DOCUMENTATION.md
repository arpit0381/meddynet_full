# MeddyNet Healthcare Platform - Complete Technical & Product Documentation

> **Document Version:** 2.0  
> **Last Updated:** March 2026  
> **Classification:** Internal - Product & Engineering  
> **Authors:** MeddyNet Product & Engineering Team  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Technical Architecture](#3-technical-architecture)
4. [Page Catalog](#4-page-catalog)
5. [Component Library](#5-component-library)
6. [Data Architecture](#6-data-architecture)
7. [State Management](#7-state-management)
8. [User Journeys & Flows](#8-user-journeys--flows)
9. [Design System](#9-design-system)
10. [API Integration Points](#10-api-integration-points)
11. [Security & Compliance](#11-security--compliance)
12. [Deployment & Operations](#12-deployment--operations)
13. [Development Guidelines](#13-development-guidelines)
14. [Appendix](#14-appendix)

---

## 1. Executive Summary

### 1.1 What is MeddyNet?

MeddyNet is India's premier digital healthcare diagnostics platform that connects patients with accredited pathology laboratories. Our platform enables users to discover nearby diagnostic centers, compare test prices in real-time, book home sample collection services, and maintain secure digital health records—all through a seamless, mobile-first experience.

### 1.2 Market Position

MeddyNet operates in India's diagnostic services market, valued at **₹1 Lakh Crore+** with an annual growth rate of **10-14%**. Unlike competitors who own physical labs, MeddyNet follows an **asset-light network aggregation model**, positioning us to scale rapidly across Tier 1, Tier 2, and Tier 3 cities without heavy capital expenditure.

### 1.3 Core Value Proposition

| Pillar | Description |
|--------|-------------|
| **Accessibility** | Quality diagnostics available within 5km of any user |
| **Transparency** | Real-time price comparison across verified labs |
| **Convenience** | Home sample collection with certified phlebotomists |
| **Security** | Encrypted health records with lifetime access |
| **Trust** | Only NABL/ISO certified labs on the platform |

### 1.4 Business Model

MeddyNet generates revenue through:

1. **Transaction Commissions** (20-30% per booking)
2. **Subscription Services** (MeddyPlus premium packages)
3. **Corporate Health Contracts** (Enterprise wellness programs)
4. **Partner Lab Subscriptions** (Premium visibility features)

---

## 2. Product Overview

### 2.1 Platform Architecture

MeddyNet operates as a three-tier modular system:

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER APPLICATION                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ Discovery│ │  Booking │ │  Health  │ │    Support       │  │
│  │ - Search │ │  Engine  │ │  Vault   │ │ - Help Center    │  │
│  │ - Maps   │ │ - Payment│ │ - Reports│ │ - Live Chat      │  │
│  │ - Compare│ │ - Status │ │ - Rx     │ │ - FAQs           │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MEDDYNET CORE API                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │   Auth   │ │  Labs DB │ │ Booking  │ │  Notifications   │  │
│  │  Service │ │          │ │  Engine  │ │     Service      │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   LAB PARTNERS  │ │    TECHNICIAN   │ │   CORPORATE     │
│     DASHBOARD   │ │     NETWORK     │ │    CLIENTS       │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 2.2 User Personas

| Persona | Demographics | Primary Use Case | Key Features |
|---------|-------------|------------------|--------------|
| **Priya, 32** | Working Professional, Urban | Quick health checkups | Home collection, digital reports |
| **Rajesh, 58** | Retiree, Tier 2 City | Regular diabetes monitoring | Lab comparison, price alerts |
| **Dr. Amit** | Physician | Patient referrals | Lab verification, report sharing |
| **Rahul, 28** | Corporate Employee | Annual health benefits | Corporate packages, insurance claims |

### 2.3 Product Roadmap

| Phase | Timeline | Features |
|-------|----------|----------|
| **Foundation** | Q1 2026 | Lab discovery, booking, digital vault |
| **Growth** | Q2 2026 | Medicine finder, pharmacy network |
| **Expansion** | Q3 2026 | Doctor consultation, AI insights |
| **Scale** | Q4 2026 | Corporate dashboard, multi-city rollout |

---

## 3. Technical Architecture

### 3.1 Technology Stack

#### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.7 | React framework with App Router |
| **React** | 19.2.3 | UI component library |
| **TypeScript** | 5.x | Type safety and IDE support |
| **Tailwind CSS** | v4 | Utility-first styling |

#### UI & Animation
| Technology | Purpose |
|------------|---------|
| **Framer Motion** | Declarative animations and transitions |
| **Lucide React** | Consistent icon system |
| **Leaflet + React-Leaflet** | Interactive mapping |

#### Utilities
| Technology | Purpose |
|------------|---------|
| **clsx** | Conditional className merging |
| **tailwind-merge** | Tailwind class deduplication |

### 3.2 Project Structure

```
meddynet/
├── public/                          # Static Assets
│   ├── MeddyNetlogo.png             # Brand logo
│   ├── icon.png                     # App favicon
│   ├── hero-illustration.png        # Hero graphics
│   └── [other-assets]               # Images, SVGs
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout + metadata
│   │   ├── page.tsx                 # Landing page (/)
│   │   ├── globals.css              # Global styles + theme
│   │   │
│   │   ├── about/                   # About page
│   │   │   └── page.tsx
│   │   │
│   │   ├── blog/                    # Blog/Articles
│   │   │   └── page.tsx
│   │   │
│   │   ├── book/                    # Booking Flow
│   │   │   ├── page.tsx             # Multi-step booking
│   │   │   └── confirmation/        # Booking confirmation
│   │   │       └── page.tsx
│   │   │
│   │   ├── careers/                 # Careers page
│   │   │   └── page.tsx
│   │   │
│   │   ├── chat/                    # Support chat
│   │   │   └── page.tsx
│   │   │
│   │   ├── compare/                  # Lab comparison tool
│   │   │   └── page.tsx
│   │   │
│   │   ├── contact/                  # Contact form
│   │   │   └── page.tsx
│   │   │
│   │   ├── dashboard/               # User Dashboard (Protected)
│   │   │   ├── layout.tsx           # Dashboard shell
│   │   │   ├── page.tsx             # Dashboard home
│   │   │   ├── bookings/            # Booking management
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx    # Booking detail
│   │   │   ├── health-records/      # Health history
│   │   │   │   └── page.tsx
│   │   │   ├── notifications/        # Notifications center
│   │   │   │   └── page.tsx
│   │   │   ├── payments/             # Payment history
│   │   │   │   └── page.tsx
│   │   │   ├── prescriptions/        # Prescription management
│   │   │   │   └── page.tsx
│   │   │   ├── profile/              # User profile
│   │   │   │   └── page.tsx
│   │   │   ├── reports/               # Lab reports
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx      # Report detail
│   │   │   └── vault/                  # Document storage
│   │   │       └── page.tsx
│   │   │
│   │   ├── faq/                      # FAQ page
│   │   │   └── page.tsx
│   │   │
│   │   ├── help-center/              # Help & support
│   │   │   └── page.tsx
│   │   │
│   │   ├── labs/                     # Lab Directory
│   │   │   └── [id]/page.tsx         # Lab detail page
│   │   │
│   │   ├── login/                    # Authentication
│   │   │   └── page.tsx
│   │   │
│   │   ├── map/                      # Lab map view
│   │   │   └── page.tsx
│   │   │
│   │   ├── maintenance/              # Maintenance mode
│   │   │   └── page.tsx
│   │   │
│   │   ├── partnership/              # Lab partner signup
│   │   │   └── page.tsx
│   │   │
│   │   ├── privacy/                 # Privacy policy
│   │   │   └── page.tsx
│   │   │
│   │   ├── refund/                  # Refund policy
│   │   │   └── page.tsx
│   │   │
│   │   ├── register/                # User registration
│   │   │   └── page.tsx
│   │   │
│   │   ├── search/                  # Test search
│   │   │   └── page.tsx
│   │   │
│   │   ├── terms/                   # Terms of service
│   │   │   └── page.tsx
│   │   │
│   │   └── verify-otp/              # OTP verification
│   │       └── page.tsx
│   │
│   ├── components/                   # React Components
│   │   │
│   │   ├── cards/                    # Card Components
│   │   │   └── LabTestCard.tsx      # Lab/test display card
│   │   │
│   │   ├── dashboard/                # Dashboard Components
│   │   │   ├── BookingActions.tsx   # Booking action menu
│   │   │   ├── DashboardSidebar.tsx # Sidebar navigation
│   │   │   ├── DashboardTopbar.tsx  # Top navigation bar
│   │   │   └── MapComponent.tsx     # Leaflet map wrapper
│   │   │
│   │   ├── layout/                   # Layout Components
│   │   │   ├── Footer.tsx           # Site footer
│   │   │   ├── LayoutWrapper.tsx    # Conditional layout wrapper
│   │   │   └── Navbar.tsx           # Navigation header
│   │   │
│   │   └── ui/                      # UI Primitives
│   │       ├── AnimatedPartnerLink.tsx # Partner CTA button
│   │       ├── Modal.tsx             # Reusable modal
│   │       └── Toast.tsx             # Notification toast
│   │
│   ├── context/                      # React Context
│   │   └── UserContext.tsx          # User state management
│   │
│   ├── data/                        # Static Data Layer
│   │   ├── dashboard.ts             # Dashboard mock data
│   │   ├── labs.ts                  # Lab data & interfaces
│   │   ├── tests.ts                 # Test categories & data
│   │   └── user.ts                  # User profile data
│   │
│   └── lib/                         # Utilities
│       └── utils.ts                 # Helper functions
│
├── next.config.ts                   # Next.js configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
└── eslint.config.mjs               # ESLint rules
```

### 3.3 Routing Architecture

The application uses Next.js App Router with the following routing patterns:

| Pattern | Example | Description |
|---------|---------|-------------|
| **Static Routes** | `/about`, `/search` | Pre-rendered pages |
| **Dynamic Routes** | `/labs/[id]` | Lab detail pages |
| **Nested Dynamic** | `/dashboard/bookings/[id]` | Booking details |
| **Route Groups** | `(dashboard)` | Logical grouping |
| **Parallel Routes** | `@modal` | Future modal support |

### 3.4 Layout Architecture

The application uses a conditional layout system:

```
LayoutWrapper
├── Public Pages (Navbar + Footer + Main)
│   ├── Home (/)
│   ├── About, Blog, Careers
│   ├── Search, Map, Compare
│   ├── Book (multi-step)
│   └── Legal (Privacy, Terms, Refund)
│
└── Protected Pages (Dashboard Shell)
    └── Dashboard Layout
        ├── DashboardSidebar
        ├── DashboardTopbar
        └── Main Content
```

---

## 4. Page Catalog

### 4.1 Public Pages

#### 4.1.1 Home Page (`/`)

**File:** [`src/app/page.tsx`](src/app/page.tsx)  
**Purpose:** Primary landing and conversion page

**Key Sections:**
1. **Hero Section**
   - Animated headline with product value proposition
   - Search bar with autocomplete
   - Quick search tags (CBC, Thyroid, Vitamin D, etc.)
   - Animated partner CTA button

2. **Statistics Bar**
   - Animated counters showing platform metrics
   - "Lacs+ Tests Booked", "10K+ Happy Customers", "500+ Labs", "50+ Cities"

3. **How It Works**
   - 4-step visual guide: Search → Compare → Book → Get Reports
   - Animated icons and connecting lines

4. **Features Grid**
   - 4-column feature cards with icons
   - Compare Labs, Home Collection, Nearby Map, Digital Vault
   - Hover animations with accent colors

5. **Popular Tests**
   - Horizontal scrollable test categories
   - Direct links to search results

6. **Testimonials**
   - User review carousel
   - Star ratings and city indicators

7. **Partner CTA**
   - Lab partner registration call-to-action
   - Animated partner link component

**Components Used:**
- Custom Framer Motion animations
- CountUp animated counter component
- Inline SVG decorative elements

---

#### 4.1.2 About Page (`/about`)

**File:** [`src/app/about/page.tsx`](src/app/about/page.tsx)  
**Purpose:** Company story, mission, and team

**Key Sections:**
1. **Company Overview**
   - Founding story and mission
   - Vision statement
   - Key statistics (labs, cities, patients)

2. **Team Section**
   - Founder profiles (Arpit Sharma, Ashwin Kumar, Aviral Mishra)
   - Role descriptions and social links

3. **Mission & Values**
   - Core principles
   - Impact metrics

4. **Statistics Counter**
   - Animated number displays
   - Achievement highlights

---

#### 4.1.3 Search Page (`/search`)

**File:** [`src/app/search/page.tsx`](src/app/search/page.tsx)  
**Purpose:** Find and filter lab tests

**Key Features:**
1. **Search Bar**
   - Text input with search icon
   - Category quick-select tabs
   - Active filter indicators

2. **Sort Dropdown**
   - Relevance, Price (Low/High), Rating, Distance
   - Animated dropdown with backdrop

3. **Filter Panel**
   - Category checkboxes
   - Price range slider
   - Rating filter
   - Home collection toggle
   - NABL certified filter

4. **Results Grid**
   - LabTestCard components
   - Infinite scroll or pagination
   - Empty state handling

**URL Parameters:**
- `?q=<search_term>` - Search query
- `?category=<category>` - Category filter
- `?sort=<sort_option>` - Sort preference

---

#### 4.1.4 Labs Detail Page (`/labs/[id]`)

**File:** [`src/app/labs/[id]/page.tsx`](src/app/labs/[id]/page.tsx)  
**Purpose:** Individual lab profile and test listings

**Key Sections:**
1. **Lab Header**
   - Lab logo/initials with colored background
   - Name, rating, review count
   - Verification badges (NABL, ISO)
   - Address and operating hours

2. **Test Listings**
   - Categorized test list
   - Price display with discount
   - "Book Now" CTAs
   - Home collection availability

3. **Reviews Section**
   - Rating breakdown bar chart
   - Individual review cards
   - Verified purchase badges

4. **Facilities Grid**
   - Available/unavailable indicators
   - Icon-based facility display

5. **About Section**
   - Lab description
   - Specialties list
   - Established year, patient count

6. **Booking CTA**
   - Sticky bottom bar on mobile
   - Selected test summary

---

#### 4.1.5 Map Page (`/map`)

**File:** [`src/app/map/page.tsx`](src/app/map/page.tsx)  
**Purpose:** Geographic lab discovery

**Key Features:**
1. **Interactive Map**
   - Leaflet with OpenStreetMap tiles
   - Custom markers for each lab
   - Popup cards on marker click
   - Auto-center on selection

2. **Lab List**
   - Vertical list alongside map
   - Lab preview cards
   - Distance indicators

3. **Search Controls**
   - Location search
   - Radius filter

---

#### 4.1.6 Compare Page (`/compare`)

**File:** [`src/app/compare/page.tsx`](src/app/compare/page.tsx)  
**Purpose:** Price and feature comparison

**Key Features:**
1. **Test Selector**
   - Dropdown to select test for comparison
   - Search within dropdown

2. **Comparison Table**
   - Side-by-side lab columns
   - Row comparisons: Price, Rating, Distance, Home Collection, Turnaround
   - Highlight best values
   - "Book Now" buttons

3. **Sort Options**
   - Sort by price, rating, or distance

---

#### 4.1.7 Book Page (`/book`)

**File:** [`src/app/book/page.tsx`](src/app/book/page.tsx)  
**Purpose:** Multi-step booking flow

**URL Parameters:**
- `?lab=<lab_id>` - Pre-selected lab
- `?test=<test_id>` - Pre-selected test
- `?type=<home|visit>` - Booking type

**Steps:**
1. **Select Time Slot**
   - Date picker (calendar view)
   - Available time slots (7AM-6PM)
   - Selected slot highlight

2. **Choose Service Type**
   - Home Collection vs Lab Visit
   - Type description cards
   - Price difference indicator

3. **Patient Details**
   - Name, phone, address fields
   - Address from saved addresses
   - Add new address option

4. **Payment**
   - Price summary
   - Payment method selection (UPI, Card, NetBanking, Wallet)
   - Terms checkbox
   - "Confirm Booking" button

**Confirmation:** [`src/app/book/confirmation/page.tsx`](src/app/book/confirmation/page.tsx)
- Booking ID display
- Test/lab summary
- Date/time confirmation
- Address (if home collection)
- Download/Share options

---

#### 4.1.8 Authentication Pages

**Login:** [`src/app/login/page.tsx`](src/app/login/page.tsx)
- Email/phone input
- Password field
- Remember me checkbox
- Forgot password link
- Social login buttons (Google, Apple)

**Register:** [`src/app/register/page.tsx`](src/app/register/page.tsx)
- Name, email, phone fields
- Password with strength indicator
- Terms acceptance
- "Already have account?" link

**Verify OTP:** [`src/app/verify-otp/page.tsx`](src/app/verify-otp/page.tsx)
- 6-digit OTP input
- Auto-submit on complete
- Resend option with timer
- Masked phone/email display

---

#### 4.1.9 Support Pages

**Contact:** [`src/app/contact/page.tsx`](src/app/contact/page.tsx)
- Contact form (name, email, phone, message)
- Company contact details
- Social media links

**Help Center:** [`src/app/help-center/page.tsx`](src/app/help-center/page.tsx)
- Searchable FAQ
- Category tabs
- Contact options

**FAQ:** [`src/app/faq/page.tsx`](src/app/faq/page.tsx)
- Accordion-style Q&A
- Categories: Booking, Reports, Payment, Account

**Chat:** [`src/app/chat/page.tsx`](src/app/chat/page.tsx)
- Live chat interface (placeholder)
- Chat history view
- Quick action buttons

---

#### 4.1.10 Marketing Pages

**Blog:** [`src/app/blog/page.tsx`](src/app/blog/page.tsx)
- Article grid layout
- Category filters
- Featured article highlight

**Careers:** [`src/app/careers/page.tsx`](src/app/careers/page.tsx)
- Open positions list
- Job detail cards
- Application form
- Company benefits

**Partnership:** [`src/app/partnership/page.tsx`](src/app/partnership/page.tsx)
- Lab partner registration form
- Benefits section
- Requirements list
- Animated partner link

---

#### 4.1.11 Legal Pages

**Privacy Policy:** [`src/app/privacy/page.tsx`](src/app/privacy/page.tsx)  
**Terms of Service:** [`src/app/terms/page.tsx`](src/app/terms/page.tsx)  
**Refund Policy:** [`src/app/refund/page.tsx`](src/app/refund/page.tsx)

All legal pages follow consistent structure:
- Table of contents
- Section-by-section content
- Last updated date
- Contact information

---

#### 4.1.12 Utility Pages

**Maintenance:** [`src/app/maintenance/page.tsx`](src/app/maintenance/page.tsx)
- Maintenance mode splash screen
- Expected duration
- Contact info for urgent issues

**404 Not Found:** [`src/app/not-found.tsx`](src/app/not-found.tsx)
- Custom 404 page
- Search bar
- Navigation links

---

### 4.2 Dashboard Pages (Protected)

All dashboard pages use the shared layout: [`src/app/dashboard/layout.tsx`](src/app/dashboard/layout.tsx)

**Layout Structure:**
```
┌──────────────────────────────────────────────────────┐
│ ┌────────────┐ ┌────────────────────────────────────┐ │
│ │            │ │           TOPBAR                   │ │
│ │            │ │  Search | Notifications | Profile   │ │
│ │  SIDEBAR   │ ├────────────────────────────────────┤ │
│ │            │ │                                    │ │
│ │  - Overview│ │         MAIN CONTENT              │ │
│ │  - Bookings│ │                                    │ │
│ │  - Reports │ │    (Page-specific content)         │ │
│ │  - Health  │ │                                    │ │
│ │  - Vault   │ │                                    │ │
│ │  - Account │ │                                    │ │
│ │            │ │                                    │ │
│ │  [Sign Out]│ │                                    │ │
│ └────────────┘ └────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

#### 4.2.1 Dashboard Overview (`/dashboard`)

**File:** [`src/app/dashboard/page.tsx`](src/app/dashboard/page.tsx)  
**Purpose:** Central hub with key metrics and quick actions

**Sections:**
1. **Welcome Header**
   - User greeting with name
   - Date/time
   - Quick action buttons

2. **Stats Cards**
   - Total Bookings
   - Reports Viewed
   - Health Score
   - Wallet Balance
   - Each with mini-graph visualization

3. **Upcoming Bookings**
   - Next 3 upcoming appointments
   - Status indicators
   - Quick reschedule/cancel actions

4. **Recent Activity**
   - Latest reports, bookings, payments
   - Timestamp display

5. **Quick Actions Grid**
   - Search Tests, Book Home Collection
   - View Reports, Health Vault
   - Profile, Help

6. **Health Insights**
   - AI-powered health tips
   - Upcoming reminders

---

#### 4.2.2 Bookings Management

**Bookings List:** [`src/app/dashboard/bookings/page.tsx`](src/app/dashboard/bookings/page.tsx)
- Filter tabs: All, Upcoming, Completed, Cancelled
- Booking cards with status badges
- Search by booking ID or lab name
- Sort by date

**Booking Detail:** [`src/app/dashboard/bookings/[id]/page.tsx`](src/app/dashboard/bookings/[id]/page.tsx)
- Full booking information
- Status tracking timeline
- Test details
- Lab information
- Patient details
- Payment summary
- Action buttons (Cancel, Reschedule, View Report)

**Components:** [`BookingActions.tsx`](src/components/dashboard/BookingActions.tsx)
- View Details modal
- Update Status modal
- Cancel confirmation modal

---

#### 4.2.3 Reports

**Reports List:** [`src/app/dashboard/reports/page.tsx`](src/app/dashboard/reports/page.tsx)
- Filter: All, Ready, Processing
- Report cards with abnormal indicators
- Lab name and date
- Quick view actions

**Report Detail:** [`src/app/dashboard/reports/[id]/page.tsx`](src/app/dashboard/reports/[id]/page.tsx)
- Patient information
- Test results table
- Parameter values with status (normal/high/low)
- Reference ranges
- Doctor notes
- Download PDF button
- Share options

---

#### 4.2.4 Health Records

**File:** [`src/app/dashboard/health-records/page.tsx`](src/app/dashboard/health-records/page.tsx)

**Features:**
- Timeline view of medical history
- Filter by type: Tests, Prescriptions, Reports, Scans
- Doctor information
- Tags/labels
- File attachments
- Add new record button

---

#### 4.2.5 Prescriptions

**File:** [`src/app/dashboard/prescriptions/page.tsx`](src/app/dashboard/prescriptions/page.tsx)

**Features:**
- Upload prescription (image/PDF)
- Prescription cards
- Doctor and hospital info
- Suggested tests from prescription
- Expiry indicators
- Share with lab feature

---

#### 4.2.6 Health Vault

**File:** [`src/app/dashboard/vault/page.tsx`](src/app/dashboard/vault/page.tsx)

**Features:**
- Categorized document storage
- Categories: Prescription, Lab Report, Scan, Invoice
- File metadata display
- Upload functionality
- Search documents
- Download and share options
- Storage usage indicator

---

#### 4.2.7 Notifications

**File:** [`src/app/dashboard/notifications/page.tsx`](src/app/dashboard/notifications/page.tsx)

**Features:**
- Notification list with timestamps
- Type indicators: Booking, Report, Reminder, Offer
- Read/unread status
- Mark as read action
- Delete notification
- Notification settings

---

#### 4.2.8 Payments

**File:** [`src/app/dashboard/payments/page.tsx`](src/app/dashboard/payments/page.tsx)

**Features:**
- Transaction history
- Payment method icons
- Amount display
- Status badges
- Invoice download
- Filter by status/date
- Summary cards: Total Spent, This Month, Pending

---

#### 4.2.9 Profile

**File:** [`src/app/dashboard/profile/page.tsx`](src/app/dashboard/profile/page.tsx)

**Sections:**
1. **Personal Information**
   - Avatar with initials
   - Name, email, phone
   - Age, gender, blood group
   - Member since date

2. **Addresses**
   - Saved address list
   - Default address indicator
   - Add/Edit/Delete addresses

3. **Health Profile**
   - Medical conditions
   - Allergies
   - Current medications

4. **Notification Preferences**
   - WhatsApp toggle
   - Booking updates toggle
   - Medical reminders toggle
   - Offers toggle
   - Security alerts toggle

5. **Account Settings**
   - Change password
   - Two-factor authentication
   - Linked accounts

6. **Danger Zone**
   - Delete account

---

## 5. Component Library

### 5.1 Layout Components

#### 5.1.1 Navbar

**File:** [`src/components/layout/Navbar.tsx`](src/components/layout/Navbar.tsx)

**Purpose:** Main site navigation header

**Visual Structure:**
```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]          Home  About  Find Tests  Nearby  Compare  [🔍]  │
│                                                        [Login]  │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Fixed position with glassmorphism on scroll
- Logo with hover scale animation
- Desktop navigation with active state indicators
- Search icon button
- Login/Register buttons
- Mobile hamburger menu
- Full-screen mobile drawer with navigation

**State Management:**
```typescript
const [isScrolled, setIsScrolled] = useState(false);      // Glass effect trigger
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);  // Mobile drawer
```

**Navigation Links:**
```typescript
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/search", label: "Find Tests" },
  { href: "/map", label: "Nearby Labs" },
  { href: "/compare", label: "Compare" },
];
```

**Scroll Behavior:**
- Background: `bg-white/90 backdrop-blur-sm` (default)
- After scroll > 20px: `glass shadow-lg` (scrolled)

**Mobile Menu:**
- Hamburger icon with animated transition to X
- Full-height drawer with all navigation
- Close on route change

---

#### 5.1.2 Footer

**File:** [`src/components/layout/Footer.tsx`](src/components/layout/Footer.tsx)

**Purpose:** Site footer with links and social media

**Visual Structure:**
```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]         Platform    Company     Support     [Socials]   │
│  Description    Find Tests  About       Help Center  Instagram   │
│  © 2026        Nearby Labs Careers      Privacy      Facebook    │
│                 Compare    Blog        Terms        LinkedIn    │
│                 Packages   Contact     FAQs         X           │
│                            Partners                  ───────    │
│                            [Partner CTA]             App Store   │
└─────────────────────────────────────────────────────────────────┘
```

**Sections:**
1. **Brand Column**
   - Logo
   - Tagline
   - Social media icons with gradients
   - App store badges

2. **Platform Links**
   - Find Tests → `/search`
   - Nearby Labs → `/map`
   - Compare Prices → `/compare`
   - Health Packages → `/search?category=packages`
   - Book Home Collection → `/search`

3. **Company Links**
   - About MeddyNet → `/about`
   - Partner With Us → Partnership page
   - Careers → `/careers`
   - Blog → `/blog`
   - Contact → `/contact`

4. **Support Links**
   - Help Center → `/help-center`
   - Privacy Policy → `/privacy`
   - Terms of Service → `/terms`
   - Refund Policy → `/refund`
   - FAQs → `/faq`

**Social Media Links:**
- Instagram: `https://www.instagram.com/themeddynet/`
- Facebook: `https://www.facebook.com/profile.php?id=61580733425881`
- LinkedIn: `https://www.linkedin.com/company/112998354`
- X (Twitter): `https://x.com/MeddyNet`

---

#### 5.1.3 LayoutWrapper

**File:** [`src/components/layout/LayoutWrapper.tsx`](src/components/layout/LayoutWrapper.tsx)

**Purpose:** Conditional layout wrapper that determines page structure

**Routing Logic:**
```typescript
const isDashboard = pathname?.startsWith("/dashboard") || 
                   pathname?.startsWith("/super-admin");
const isAuthPage = pathname === "/login" || 
                   pathname === "/register" || 
                   pathname === "/maintenance" || 
                   pathname === "/partnership";
```

**Layout Decisions:**
| Condition | Layout |
|-----------|--------|
| `isDashboard` | No header/footer (dashboard shell only) |
| `isAuthPage` | No header/footer (auth-specific layout) |
| All others | Navbar + Footer + Main content |

---

### 5.2 Dashboard Components

#### 5.2.1 DashboardSidebar

**File:** [`src/components/dashboard/DashboardSidebar.tsx`](src/components/dashboard/DashboardSidebar.tsx)

**Purpose:** Left sidebar navigation for dashboard

**Visual Structure:**
```
┌────────────────────────────────┐
│  [Logo]  MeddyNet              │
│          My Dashboard          │
├────────────────────────────────┤
│  Explore                       │
│    📊 Overview                 │
│    🔍 Find Tests               │
│    📍 Nearby Labs              │
├────────────────────────────────┤
│  Bookings                      │
│    📋 My Bookings              │
│    📅 Schedule Test            │
├────────────────────────────────┤
│  My Health                     │
│    📄 My Reports               │
│    ❤️ Health Records           │
│    💊 Prescriptions            │
│    📁 Health Vault             │
├────────────────────────────────┤
│  Account                       │
│    🔔 Notifications           │
│    💳 Payments                │
│    👤 My Profile               │
├────────────────────────────────┤
│  [Sign Out]                    │
└────────────────────────────────┘
```

**Navigation Groups:**
```typescript
const navGroups = [
  {
    label: "Explore",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/search", label: "Find Tests", icon: Search },
      { href: "/map", label: "Nearby Labs", icon: MapPin },
    ],
  },
  {
    label: "Bookings",
    items: [
      { href: "/dashboard/bookings", label: "My Bookings", icon: ClipboardList },
      { href: "/search", label: "Schedule Test", icon: CalendarCheck },
    ],
  },
  {
    label: "My Health",
    items: [
      { href: "/dashboard/reports", label: "My Reports", icon: FileText },
      { href: "/dashboard/health-records", label: "Health Records", icon: Heart },
      { href: "/dashboard/prescriptions", label: "Prescriptions", icon: FileImage },
      { href: "/dashboard/vault", label: "Health Vault", icon: FolderOpen },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
      { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
      { href: "/dashboard/profile", label: "My Profile", icon: User },
    ],
  },
];
```

**Features:**
- Active route highlighting with primary color
- Notification badge for unread count
- Hover effects with background color
- Sign out button with icon
- Logo with "My Dashboard" label
- Pulse indicator animation

---

#### 5.2.2 DashboardTopbar

**File:** [`src/components/dashboard/DashboardTopbar.tsx`](src/components/dashboard/DashboardTopbar.tsx)

**Purpose:** Top navigation bar within dashboard

**Visual Structure:**
```
┌─────────────────────────────────────────────────────────────────┐
│ [☰]  [Search records...                    ]  [🔔 3]  [Avatar] │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
1. **Mobile Menu Toggle**
   - Hamburger icon
   - Opens slide-out drawer on mobile

2. **Search Input**
   - Placeholder: "Search records..."
   - Search icon prefix
   - Expandable on focus

3. **Notification Bell**
   - Badge with unread count
   - Dropdown panel with:
     - Notification list (title, message, time)
     - Type icons (booking, report, reminder, offer)
     - "Mark all read" action
     - "Delete all" action

4. **User Profile**
   - Avatar with initials
   - Blood group indicator
   - Quick profile menu dropdown

5. **Mobile Drawer**
   - Full navigation list
   - Close button
   - User info header
   - Sign out option

---

#### 5.2.3 BookingActions

**File:** [`src/components/dashboard/BookingActions.tsx`](src/components/dashboard/BookingActions.tsx)

**Purpose:** Dropdown menu for booking management actions

**Props Interface:**
```typescript
interface BookingActionsProps {
  bookingId: string;
  variant?: "icon" | "button";  // Icon-only or full button
  patientName?: string;
  onStatusUpdate?: (id: string, newStatus: string) => void;
  onCancel?: (id: string) => void;
}
```

**Action Menu:**
1. **View Details** → Opens modal with full booking info
2. **Update Status** → Modal to change status
3. **Cancel Booking** → Confirmation dialog

**Modals:**

**View Details Modal:**
- Patient name and contact
- Test(s) booked
- Lab information
- Date and time
- Type (Home/Lab)
- Address
- Payment amount
- Booking ID

**Status Update Modal:**
- Status dropdown (Upcoming, In-Progress, Completed, Cancelled)
- Warning messages per status
- Confirm/Cancel buttons

**Cancel Confirmation Modal:**
- Warning message
- Cancellation policy note
- Confirm/Cancel buttons

---

#### 5.2.4 MapComponent

**File:** [`src/components/dashboard/MapComponent.tsx`](src/components/dashboard/MapComponent.tsx)

**Purpose:** Leaflet map wrapper for lab locations

**Props Interface:**
```typescript
interface MapComponentProps {
  labs: Lab[];
  selectedLab: string | null;
  onSelectLab: (id: string) => void;
}
```

**Implementation:**
```typescript
// Uses react-leaflet components
<MapContainer center={[28.6139, 77.2090]} zoom={12}>
  <TileLayer
    attribution='&copy; OpenStreetMap contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
  {labs.map(lab => (
    <Marker key={lab.id} position={[lab.lat, lab.lng]}>
      <Popup>
        {/* Lab preview card */}
      </Popup>
    </Marker>
  ))}
</MapContainer>
```

**Features:**
- OpenStreetMap tiles
- Custom marker icons
- Popup cards with lab info
- Auto-center on selected lab
- Zoom controls
- Mobile-responsive

---

### 5.3 UI Components

#### 5.3.1 Modal

**File:** [`src/components/ui/Modal.tsx`](src/components/ui/Modal.tsx)

**Purpose:** Reusable modal dialog component

**Props Interface:**
```typescript
interface ModalProps {
  isOpen: boolean;                    // Visibility state
  onClose: () => void;                // Close handler
  title: string;                      // Modal title
  children: React.ReactNode;          // Modal content
  maxWidth?: string;                  // Max width class (default: "max-w-2xl")
}
```

**Features:**
- Backdrop with blur effect
- Animated entrance/exit (Framer Motion)
- Scrollable content area
- Portal rendering to document body
- Body scroll lock when open
- Close button in header
- Spring animation transition

**Animation:**
```typescript
transition={{ type: "spring", damping: 25, stiffness: 300 }}
initial={{ opacity: 0, scale: 0.9, y: 30 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.9, y: 30 }}
```

**Usage Example:**
```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Booking Details">
  <BookingDetails bookingId={id} />
</Modal>
```

---

#### 5.3.2 Toast

**File:** [`src/components/ui/Toast.tsx`](src/components/ui/Toast.tsx)

**Purpose:** Temporary notification toast

**Props Interface:**
```typescript
interface ToastProps {
  message: string;                    // Toast message
  type?: "success" | "error" | "info"; // Toast type
  onClose: () => void;                // Close handler
  duration?: number;                  // Auto-dismiss time (ms)
}
```

**Variants:**
| Type | Color | Icon |
|------|-------|------|
| success | Emerald | CheckCircle |
| error | Red | XCircle |
| info | Blue | Info |

**Features:**
- Auto-dismiss after 3 seconds (configurable)
- Manual close button
- Animated entrance/exit
- Bottom-center positioning
- Stacked toasts support

---

#### 5.3.3 AnimatedPartnerLink

**File:** [`src/components/ui/AnimatedPartnerLink.tsx`](src/components/ui/AnimatedPartnerLink.tsx)

**Purpose:** CTA button for lab partner registration

**Props Interface:**
```typescript
interface PartnerLinkProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}
```

**Default Behavior:**
- Navigates to `/partnership`
- Renders as link with button styling
- Supports custom children and className

---

### 5.4 Card Components

#### 5.4.1 LabTestCard

**File:** [`src/components/cards/LabTestCard.tsx`](src/components/cards/LabTestCard.tsx)

**Purpose:** Display card for lab/test search results

**Props Interface:**
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
  certified: string;        // e.g., "NABL", "ISO"
  turnaround: string;        // e.g., "Same Day", "24 Hours"
  color: string;            // Gradient color class
}
```

**Visual Structure:**
```
┌─────────────────────────────────────────────────────┐
│  [H+]  HealthPlus Diagnostics          ⭐ 4.8 (243)  │
│         📍 1.2 km away                               │
│                                                     │
│  CBC - Complete Blood Count                         │
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ 💰 ₹399  <s>₹699</s>   -43% off                 ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  🏠 Home  ✅ NABL  ⏱️ Same Day                      │
│                                                     │
│  [Book Now]                                         │
└─────────────────────────────────────────────────────┘
```

**Calculated Values:**
```typescript
const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
```

**Features:**
- Discount percentage badge
- Strikethrough original price
- Rating with review count
- Distance indicator
- Feature tags (Home Collection, Certified, Turnaround)
- Gradient-colored lab initial badge
- Book Now CTA button

---

## 6. Data Architecture

### 6.1 Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  UI Layer   │ ←→  │   Context   │ ←→  │ localStorage │
│ Components  │     │   Providers │     │   (Client)   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Static     │
                    │  Data Files │
                    │  (labs.ts,  │
                    │   tests.ts) │
                    └─────────────┘
```

### 6.2 Data Files

#### 6.2.1 Labs Data (`src/data/labs.ts`)

**Primary Interfaces:**

```typescript
// Lab entity
interface Lab {
  id: string;
  name: string;
  slug: string;                    // URL-friendly identifier
  initials: string;                // Logo placeholder letters
  rating: number;                  // 0-5 scale
  reviewCount: number;
  distance: number;                // km from user
  address: string;
  city: string;
  verified: boolean;
  nabl: boolean;                   // NABL accredited
  iso: boolean;                    // ISO certified
  homeCollection: boolean;
  operatingHours: string;
  phone: string;
  email?: string;
  website?: string;
  about: string;
  image: string;                   // Image path
  color: string;                   // Gradient class
  established?: number;            // Year
  totalPatients?: number;
  specialties?: string[];
  ratingBreakdown?: { stars: number; count: number }[];
  tests: LabTest[];
  reviews: Review[];
  facilities?: Facility[];
}

// Test offered by lab
interface LabTest {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  turnaround: string;
  homeCollectionAvailable: boolean;
  popular: boolean;
  description?: string;
  parameters?: number;             // Number of test parameters
}

// Customer review
interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
  helpful?: number;
  verified?: boolean;
  testName?: string;
}

// Lab facility
interface Facility {
  id: string;
  name: string;
  icon: string;
  description: string;
  available: boolean;
}
```

**Sample Labs (6 Total):**

| ID | Name | Rating | NABL | ISO | Home Collection |
|----|------|--------|------|-----|-----------------|
| 1 | HealthPlus Diagnostics | 4.8 | ✅ | ✅ | ✅ |
| 2 | MedLife Pathology | 4.6 | ❌ | ✅ | ✅ |
| 3 | DiagCare Labs | 4.9 | ✅ | ✅ | ✅ |
| 4 | CityPath Diagnostics | 4.5 | ✅ | ❌ | ❌ |
| 5 | Apollo Path Labs | 4.7 | ✅ | ✅ | ✅ |
| 6 | LifeCare Diagnostics | 4.4 | ❌ | ✅ | ✅ |

**Helper Functions:**
```typescript
export function getLabById(id: string): Lab | undefined;
export function getLabBySlug(slug: string): Lab | undefined;
export function getAllLabs(): Lab[];
export function getLabTests(labId: string): LabTest[];
```

---

#### 6.2.2 Tests Data (`src/data/tests.ts`)

**Primary Interface:**

```typescript
interface TestInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;                    // Lucide icon name
  popular: boolean;
  minPrice: number;
  maxPrice: number;
  labCount: number;
}
```

**Test Categories:**
```typescript
const testCategories = [
  "All",
  "Hematology",
  "Thyroid",
  "Cardiology",
  "Vitamins",
  "Diabetes",
  "Liver",
  "Kidney",
  "Packages",
  "Infectious Disease",
  "Urology",
  "Immunology",
];
```

**Popular Tests:**

| ID | Name | Category | Price Range | Lab Count |
|----|------|----------|-------------|-----------|
| pt1 | Complete Blood Count (CBC) | Hematology | ₹279 - ₹499 | 6 |
| pt2 | Thyroid Profile (T3, T4, TSH) | Thyroid | ₹449 - ₹699 | 6 |
| pt3 | Lipid Profile | Cardiology | ₹349 - ₹599 | 6 |
| pt4 | Vitamin D (25-OH) | Vitamins | ₹549 - ₹799 | 5 |
| pt5 | HbA1c | Diabetes | ₹399 - ₹499 | 6 |
| pt6 | Liver Function Test (LFT) | Liver | ₹449 - ₹649 | 5 |
| pt7 | Kidney Function Test (KFT) | Kidney | ₹449 - ₹649 | 5 |
| pt8 | Vitamin B12 | Vitamins | ₹499 - ₹699 | 5 |
| pt9 | Full Body Health Checkup | Packages | ₹1999 - ₹2499 | 4 |
| pt10 | Covid RT-PCR | Infectious Disease | ₹299 - ₹599 | 3 |

**Search Suggestions:**
```typescript
const searchSuggestions = [
  "Blood Test",
  "Thyroid Test",
  "Vitamin D",
  "CBC",
  "Lipid Profile",
  "Sugar Test",
  "Full Body Checkup",
  "COVID Test",
  "Liver Function",
  "Kidney Function",
];
```

---

#### 6.2.3 User Data (`src/data/user.ts`)

**Primary Interfaces:**

```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;                  // Initials
  age: number;
  gender: "Male" | "Female" | "Other";
  bloodGroup: string;
  memberSince: string;
}

interface Address {
  id: string;
  label: string;                   // "Home", "Office", etc.
  fullAddress: string;
  isDefault: boolean;
}
```

**Sample User:**
```typescript
const currentUser: UserProfile = {
  id: "USR-089",
  name: "Arpit Sharma",
  email: "arpit@example.com",
  phone: "+91 9876543210",
  avatar: "AS",
  age: 28,
  gender: "Male",
  bloodGroup: "O+",
  memberSince: "Jan 2024",
};
```

---

#### 6.2.4 Dashboard Data (`src/data/dashboard.ts`)

**Primary Interfaces:**

```typescript
// Booking record
interface Booking {
  id: string;
  labName: string;
  labInitials: string;
  labColor: string;
  labSlug: string;
  tests: string[];
  date: string;
  time: string;
  status: "Upcoming" | "Completed" | "Cancelled" | "In-Progress";
  type: "Home Collection" | "Lab Visit";
  totalAmount: number;
  technician?: string;
  address?: string;
  commission?: number;
}

// Booking tracking step
interface TrackingStep {
  id: string;
  label: string;
  description: string;
  timestamp?: string;
  status: "completed" | "active" | "pending";
}

// Lab report
interface Report {
  id: string;
  testName: string;
  labName: string;
  date: string;
  status: "Ready" | "Processing";
  fileUrl?: string;
  abnormal: boolean;
  parameters?: ReportParameter[];
  doctorNote?: string;
}

// Individual test parameter
interface ReportParameter {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: "normal" | "high" | "low";
}

// Vault document
interface VaultFile {
  id: string;
  name: string;
  category: "Prescription" | "Lab Report" | "Scan" | "Invoice";
  uploadDate: string;
  size: string;
  doctorName?: string;
}

// Payment transaction
interface PaymentTransaction {
  id: string;
  bookingId: string;
  date: string;
  amount: number;
  method: "UPI" | "Card" | "NetBanking" | "Wallet";
  status: "Successful" | "Pending" | "Failed";
}

// Notification item
interface Notification {
  id: string;
  type: "booking" | "report" | "reminder" | "offer";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  actionHref?: string;
  icon?: string;
}

// Health record
interface HealthRecord {
  id: string;
  type: "test" | "prescription" | "report" | "scan";
  title: string;
  date: string;
  details: string;
  doctor?: string;
  fileAvailable?: boolean;
  labName?: string;
  status?: string;
  tags?: string[];
}

// Prescription
interface Prescription {
  id: string;
  fileName: string;
  uploadDate: string;
  doctor: string;
  hospital: string;
  suggestedTests: SuggestedTest[];
  fileType: "image" | "pdf";
  size: string;
}

// Suggested test from prescription
interface SuggestedTest {
  name: string;
  reason: string;
  category: string;
  estimatedPrice: number;
}

// Time slot for booking
interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  period: "morning" | "afternoon" | "evening";
}
```

**Data Collections:**

| Collection | Count | Description |
|------------|-------|-------------|
| `recentBookings` | 5 | Sample bookings with various statuses |
| `bookingTrackingSteps` | 3 | Tracking timeline templates |
| `userReports` | 4 | Lab test reports |
| `vaultFiles` | 3 | Uploaded documents |
| `paymentHistory` | 4 | Transaction history |
| `notifications` | 7 | Notification items |
| `healthRecords` | 6 | Health history |
| `prescriptions` | 2 | Uploaded prescriptions |
| `availableTimeSlots` | 1 day | Time slots for booking |

---

### 6.3 Data Relationships

```
User (1) ──┬── (*) Address
           │
           └── (*) Booking ── (*) Tests
           │
           ├── (*) Report
           │
           ├── (*) Payment
           │
           ├── (*) Notification
           │
           ├── (*) HealthRecord
           │
           └── (*) Prescription

Lab (1) ──┬── (*) LabTest
          │
          └── (*) Review
```

---

## 7. State Management

### 7.1 UserContext

**File:** [`src/context/UserContext.tsx`](src/context/UserContext.tsx)

**Purpose:** Global state management for user data and preferences

**Context Interface:**
```typescript
interface UserContextType {
  // User profile
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  
  // Addresses
  addresses: Address[];
  setAddresses: (addresses: Address[]) => void;
  
  // Notification settings
  notifications: {
    whatsapp: boolean;
    bookingUpdates: boolean;
    medicalReminders: boolean;
    offers: boolean;
    securityAlerts: boolean;
  };
  setNotifications: (notifications: any) => void;
  
  // Notification items
  notificationItems: NotificationItem[];
  setNotificationItems: (items: NotificationItem[]) => void;
  
  // Actions
  updateUser: (newData: Partial<UserProfile>) => void;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
}
```

**NotificationItem Interface:**
```typescript
interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "booking" | "report" | "reminder" | "offer";
  read: boolean;
  actionLabel?: string;
  actionHref?: string;
}
```

**Initial Notification Items:**
```typescript
const initialNotificationItems: NotificationItem[] = [
  {
    id: "1",
    title: "Booking Confirmed!",
    message: "Your CBC + Vitamin D test at HealthPlus Diagnostics is confirmed...",
    timestamp: new Date().toISOString(),
    type: "booking",
    read: false,
    actionLabel: "Track Booking",
    actionHref: "/dashboard/bookings/1"
  },
  {
    id: "2",
    title: "Report Ready 📄",
    message: "Your Thyroid Profile report from DiagCare Labs is now available...",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: "report",
    read: false,
    actionLabel: "View Report",
    actionHref: "/dashboard/reports/1"
  },
  // ... more items
];
```

### 7.2 localStorage Persistence

**Storage Keys:**
| Key | Data Type | Description |
|-----|-----------|-------------|
| `meddynet_user` | UserProfile | User profile data |
| `meddynet_addresses` | Address[] | Saved addresses |
| `meddynet_notifications` | Settings object | Notification preferences |
| `meddynet_notification_items` | NotificationItem[] | Notification list |

**Persistence Strategy:**
```typescript
// Load from localStorage on mount
useEffect(() => {
  const storedUser = localStorage.getItem("meddynet_user");
  const storedAddresses = localStorage.getItem("meddynet_addresses");
  const storedNotifications = localStorage.getItem("meddynet_notifications");
  const storedItems = localStorage.getItem("meddynet_notification_items");

  if (storedUser) setUser(JSON.parse(storedUser));
  if (storedAddresses) setAddresses(JSON.parse(storedAddresses));
  if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
  if (storedItems) setNotificationItems(JSON.parse(storedItems));
}, []);

// Save to localStorage when things change
useEffect(() => {
  localStorage.setItem("meddynet_user", JSON.stringify(user));
}, [user]);
```

### 7.3 Hook Usage

```typescript
import { useUser } from "@/context/UserContext";

function MyComponent() {
  const { 
    user, 
    updateUser, 
    addresses,
    notificationItems,
    markNotificationRead 
  } = useUser();
  
  // Use the context values...
}
```

---

## 8. User Journeys & Flows

### 8.1 Primary User Flows

#### 8.1.1 Test Discovery & Booking Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  HOME   │ →  │ SEARCH  │ →  │   LAB   │ →  │  BOOK   │ →  │CONFIRM │
│  PAGE   │    │  PAGE   │    │ DETAIL  │    │  PAGE   │    │  ATION │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
     │              │              │              │              │
     ▼              ▼              ▼              ▼              ▼
  [Hero CTA]   [Filters]    [Select Test]   [4-Step Form]   [Booking ID]
  [Quick Nav]  [Sort]       [View Reviews]  [Time Select]   [Summary]
                                   │         [Service Type]  [Actions]
                                   │         [Patient Info]
                              [Facilities]   [Payment]
                              [Compare]      [Confirm]
```

**Step-by-Step:**

1. **User lands on Home**
   - Views hero with value proposition
   - Clicks "Find Tests" or uses search

2. **Search Page**
   - Types test name or selects category
   - Applies filters (price, rating, home collection)
   - Sorts results

3. **Lab Detail Page**
   - Views lab information and reviews
   - Selects test(s)
   - Clicks "Book Now"

4. **Booking Flow**
   - Step 1: Select date and time slot
   - Step 2: Choose home collection or lab visit
   - Step 3: Enter patient details
   - Step 4: Complete payment

5. **Confirmation**
   - Receives booking ID
   - Views summary
   - Gets SMS/email confirmation

---

#### 8.1.2 Dashboard Navigation Flow

```
┌──────────┐    ┌──────────────────────────────────────────┐
│  LOGIN   │ →  │            DASHBOARD HOME               │
└──────────┘    │  ┌────────┐ ┌────────┐ ┌────────┐       │
     │          │  │Stats   │ │Upcoming│ │Recent  │       │
     │          │  │Cards   │ │Bookings│ │Activity│       │
     │          │  └────────┘ └────────┘ └────────┘       │
     │          └─────────────────┬──────────────────────┘
     │                            │
     │          ┌─────────────────┴──────────────────────┐
     │          ▼                                      ▼
     │   ┌──────────────┐                    ┌──────────────┐
     │   │   SIDEBAR     │                    │   TOPBAR     │
     │   │  Navigation   │                    │   Quick      │
     │   │               │                    │   Actions    │
     │   │  • Overview   │                    │              │
     │   │  • Bookings   │                    │  [Search]    │
     │   │  • Reports    │                    │  [Bell]      │
     │   │  • Health     │                    │  [Avatar]    │
     │   │  • Vault      │                    │              │
     │   │  • Account    │                    └──────────────┘
     │   └──────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD PAGES                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Bookings │ │ Reports  │ │ Payments │ │ Profile  │  ...   │
│  │ List    │ │ List     │ │ History  │ │ Settings │       │
│  │ Detail  │ │ Detail   │ │ Invoices │ │ Addresses│       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

#### 8.1.3 Lab Partner Onboarding Flow

```
┌───────────┐    ┌────────────┐    ┌────────────┐    ┌──────────┐
│ PARTNER   │ →  │  SUBMIT    │ →  │ VERIFY     │ →  │  LIVE    │
│   PAGE    │    │  DETAILS   │    │  BY MEDDY  │    │  ON      │
│           │    │            │    │   NET      │    │  NETWORK │
└───────────┘    └────────────┘    └────────────┘    └──────────┘
     │                │                  │                 │
     ▼                ▼                  ▼                 ▼
[Benefits]     [Form Fields]      [Doc Review]      [Dashboard]
[Requirements] [Lab Info]        [Onsite Visit]    [Bookings]
[CTA Form]      [Certifications]  [Approval]        [Reports]
```

---

### 8.2 User Flow Diagrams

#### 8.2.1 Search & Filter Flow

```
START
  │
  ▼
[Enter Search Query]
  │
  ├─→ [Empty Query] → [Show Popular Tests]
  │                        │
  │                        ▼
  │                  [Display Results Grid]
  │
  ▼
[Apply Filters?]
  │
  ├─→ [No] ────────────────────────────────────────→ [Display Results]
  │
  ▼
[Select Filters]
  ├─→ Category ──→ [Hematology/Thyroid/Cardiology/...]
  ├─→ Price ──────→ [Min-Max Slider]
  ├─→ Rating ─────→ [4+ Stars / 3+ Stars / Any]
  ├─→ Home ───────→ [Toggle]
  └─→ Certified ─→ [NABL Only / All]
  │
  ▼
[Sort Results]
  ├─→ Relevance
  ├─→ Price: Low → High
  ├─→ Price: High → Low
  ├─→ Highest Rated
  └─→ Nearest First
  │
  ▼
[Display Results Grid]
  │
  ▼
[Select Lab/Test Card]
  │
  ▼
[Navigate to Lab Detail] ──────────────────────→ END
```

---

#### 8.2.2 Booking Status Flow

```
┌─────────────┐
│  BOOKING    │
│  CREATED    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐    ┌─────────────────┐
│    PENDING      │ →  │  CONFIRMED     │
│  (Payment Due)  │    │ (Payment Done)  │
└─────────────────┘    └────────┬────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
     │HOME COLLECT │  │  LAB VISIT  │  │  CANCELLED  │
     │  SCHEDULED  │  │  SCHEDULED  │  │             │
     └──────┬──────┘  └──────┬──────┘  └─────────────┘
            │               │
            ▼               ▼
     ┌─────────────┐  ┌─────────────┐
     │TECHNICIAN   │  │  PATIENT    │
     │ASSIGNED     │  │  ARRIVES    │
     └──────┬──────┘  └──────┬──────┘
            │               │
            ▼               │
     ┌─────────────┐         │
     │  SAMPLE     │ ←───────┘
     │ COLLECTED   │
     └──────┬──────┘
            │
            ▼
     ┌─────────────┐
     │  IN-LAB     │
     │ PROCESSING  │
     └──────┬──────┘
            │
            ▼
     ┌─────────────┐
     │  REPORT     │
     │  GENERATED  │
     └──────┬──────┘
            │
            ▼
     ┌─────────────┐
     │   REPORT    │ ←── Patient notification sent
     │   READY     │
     └──────┬──────┘
            │
            ▼
     ┌─────────────┐
     │  COMPLETED  │
     │ (Archived)  │
     └─────────────┘
```

---

## 9. Design System

### 9.1 Brand Identity

#### Logo
- **Primary:** `/public/MeddyNetlogo.png` (color version)
- **Icon:** `/public/icon.png` (standalone app icon)
- **Usage:** Header, Footer, Splash screens

#### Brand Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Primary | `#00A86B` | 0, 168, 107 | CTAs, Links, Brand |
| Primary Light | `#00c97a` | 0, 201, 122 | Gradients, Hover |
| Primary Dark | `#008f5a` | 0, 143, 90 | Active, Pressed |
| Accent | `#1E88E5` | 30, 136, 229 | Secondary actions |
| Accent Light | `#42a5f5` | 66, 165, 245 | Hover states |

#### Semantic Colors
| Name | Hex | Usage |
|------|-----|-------|
| Success | `#10b981` | Success messages |
| Warning | `#f59e0b` | Warnings |
| Error | `#ef4444` | Errors, Destructive actions |
| Info | `#3b82f6` | Information |

#### Neutral Colors
| Name | Hex | Usage |
|------|-----|-------|
| Dark | `#0F172A` | Headings, Dark backgrounds |
| Text | `#2C3E50` | Body text |
| Text Secondary | `#546e7a` | Secondary text |
| Text Muted | `#78909c` | Hints, Placeholders |
| Border | `#eef2f7` | Light borders |
| Surface | `#F7FBFF` | Page backgrounds |

---

### 9.2 Typography

#### Font Stack
```css
font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

#### Type Scale
| Name | Size | Weight | Usage |
|------|------|--------|-------|
| Display | 3rem (48px) | 800-900 | Hero headlines |
| H1 | 2.25rem (36px) | 700-800 | Page titles |
| H2 | 1.875rem (30px) | 700 | Section headers |
| H3 | 1.5rem (24px) | 600-700 | Card titles |
| H4 | 1.25rem (20px) | 600 | Subsections |
| Body | 1rem (16px) | 400-500 | Paragraphs |
| Small | 0.875rem (14px) | 400-500 | Captions |
| Tiny | 0.75rem (12px) | 400-500 | Labels, Badges |

#### Google Fonts Import
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
```

---

### 9.3 Spacing System

Based on 4px grid:

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight spacing |
| `space-2` | 8px | Icon gaps |
| `space-3` | 12px | Component padding |
| `space-4` | 16px | Card padding |
| `space-5` | 20px | Section spacing |
| `space-6` | 24px | Card gaps |
| `space-8` | 32px | Section dividers |
| `space-10` | 40px | Large spacing |
| `space-12` | 48px | Major sections |

---

### 9.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 8px | Buttons, Inputs |
| `radius-md` | 12px | Cards |
| `radius-lg` | 16px | Modals |
| `radius-xl` | 24px | Large cards |
| `radius-2xl` | 32px | Hero elements |
| `radius-full` | 9999px | Pills, Avatars |

---

### 9.5 Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) | Subtle elevation |
| `shadow-md` | 0 4px 6px rgba(0,0,0,0.1) | Cards |
| `shadow-lg` | 0 10px 15px rgba(0,0,0,0.1) | Modals |
| `shadow-xl` | 0 20px 25px rgba(0,0,0,0.15) | Dropdowns |
| `shadow-glow` | 0 0 20px rgba(0,168,107,0.3) | Primary glow |

---

### 9.6 Animation Specifications

#### Timing
| Token | Value | Usage |
|-------|-------|-------|
| `duration-fast` | 150ms | Micro-interactions |
| `duration-normal` | 300ms | Standard transitions |
| `duration-slow` | 500ms | Page transitions |

#### Easing
| Name | Value | Usage |
|------|-------|-------|
| Default | `cubic-bezier(0.4, 0, 0.2, 1)` | General use |
| Enter | `cubic-bezier(0, 0, 0.2, 1)` | Elements appearing |
| Exit | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving |
| Spring | `cubic-bezier(0.33, 1, 0.68, 1)` | Bouncy feel |

#### Framer Motion Variants

```typescript
// Fade In Up
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

// Stagger Container
const stagger = {
  visible: { transition: { staggerChildren: 0.07 } }
};

// Scale In
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  }
};
```

---

### 9.7 Component Patterns

#### Buttons

**Primary Button:**
```tsx
<button className="px-6 py-3 bg-primary text-white rounded-xl font-semibold 
                   hover:bg-primary-dark active:scale-95 transition-all">
  Book Now
</button>
```

**Secondary Button:**
```tsx
<button className="px-6 py-3 bg-white border-2 border-primary text-primary 
                   rounded-xl font-semibold hover:bg-primary/5 transition-all">
  Learn More
</button>
```

**Ghost Button:**
```tsx
<button className="px-4 py-2 text-text-secondary hover:text-primary 
                   hover:bg-primary/5 rounded-lg transition-all">
  View All
</button>
```

---

#### Cards

**Standard Card:**
```tsx
<div className="bg-white rounded-2xl p-6 shadow-md border border-border 
                hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
  {/* Card content */}
</div>
```

**Glass Card:**
```tsx
<div className="glass rounded-2xl p-6">
  {/* Glass content */}
</div>
```

---

#### Forms

**Input Field:**
```tsx
<input 
  type="text"
  placeholder="Enter your name"
  className="w-full px-4 py-3 rounded-xl border-2 border-border 
             focus:border-primary focus:ring-4 focus:ring-primary/10 
             outline-none transition-all"
/>
```

---

### 9.8 Responsive Breakpoints

| Breakpoint | Width | Target Devices |
|------------|-------|----------------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

---

## 10. API Integration Points

### 10.1 Current Architecture

The current implementation uses **static mock data**. The following API integrations are planned:

### 10.2 Planned API Endpoints

#### Authentication
```
POST /api/auth/register     - User registration
POST /api/auth/login        - User login
POST /api/auth/otp/send     - Send OTP
POST /api/auth/otp/verify   - Verify OTP
POST /api/auth/refresh      - Refresh token
POST /api/auth/logout       - Logout
```

#### Labs
```
GET  /api/labs              - List all labs (with filters)
GET  /api/labs/:id          - Get lab details
GET  /api/labs/:id/tests    - Get lab tests
GET  /api/labs/:id/reviews  - Get lab reviews
POST /api/labs/search       - Search labs
```

#### Tests
```
GET  /api/tests             - List all tests
GET  /api/tests/:id         - Get test details
GET  /api/tests/categories  - Get categories
GET  /api/tests/compare     - Compare test prices
```

#### Bookings
```
POST /api/bookings          - Create booking
GET  /api/bookings          - List user bookings
GET  /api/bookings/:id      - Get booking details
PUT  /api/bookings/:id       - Update booking
PUT  /api/bookings/:id/cancel - Cancel booking
GET  /api/bookings/:id/tracking - Get tracking info
```

#### Reports
```
GET  /api/reports           - List user reports
GET  /api/reports/:id       - Get report details
GET  /api/reports/:id/download - Download PDF
```

#### Payments
```
POST /api/payments/initiate - Initiate payment
POST /api/payments/webhook  - Payment webhook
GET  /api/payments/history  - Payment history
```

#### User
```
GET  /api/user/profile      - Get profile
PUT  /api/user/profile      - Update profile
GET  /api/user/addresses    - Get addresses
POST /api/user/addresses    - Add address
PUT  /api/user/addresses/:id - Update address
DELETE /api/user/addresses/:id - Delete address
GET  /api/user/health-records - Get health records
POST /api/user/health-records - Add health record
```

#### Notifications
```
GET  /api/notifications     - Get notifications
PUT  /api/notifications/read - Mark as read
DELETE /api/notifications/:id - Delete notification
```

---

## 11. Security & Compliance

### 11.1 Data Protection

#### Client-Side Storage
- **localStorage** is used for:
  - User preferences
  - Notification settings
  - Cached user data (non-sensitive)
  
- **NOT stored in localStorage:**
  - Passwords
  - Payment tokens
  - Aadhaar/ID numbers
  - Medical diagnoses

### 11.2 Input Validation

All form inputs should be validated:

```typescript
// Phone validation (India)
const phoneRegex = /^[6-9]\d{9}$/;

// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// OTP validation
const otpRegex = /^\d{6}$/;
```

### 11.3 HIPAA Compliance Considerations

For healthcare data handling:
- All health records must be encrypted at rest
- Access logs maintained for audit
- Data minimization principles applied
- User consent required before data sharing

---

## 12. Deployment & Operations

### 12.1 Project Scripts

```json
{
  "scripts": {
    "dev": "next dev",           // Start development server
    "build": "next build",       // Build for production
    "start": "next start",       // Start production server
    "lint": "eslint"             // Run ESLint
  }
}
```

### 12.2 Environment Configuration

**Development:**
```bash
npm run dev
# Opens http://localhost:3000
```

**Production Build:**
```bash
npm run build
npm run start
```

### 12.3 Key Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.js` | Tailwind CSS (if separate) |
| `postcss.config.mjs` | PostCSS configuration |
| `eslint.config.mjs` | ESLint rules |

### 12.4 Image Optimization

Next.js Image component configured for:
```typescript
// next.config.ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'api.dicebear.com',
      port: '',
      pathname: '/**',
    },
  ],
},
```

---

## 13. Development Guidelines

### 13.1 Code Organization

#### File Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `DashboardSidebar.tsx` |
| Pages | kebab-case | `health-records/page.tsx` |
| Hooks | camelCase with use prefix | `useUser.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Constants | SCREAMING_SNAKE | `MAX_FILE_SIZE` |

#### Component Structure
```typescript
// 1. Imports
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Icon } from "lucide-react";

// 2. Types
interface Props {
  title: string;
  onAction: () => void;
}

// 3. Component
export default function Component({ title, onAction }: Props) {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. Handlers
  const handleClick = () => {};
  
  // 6. Render
  return (
    <div>
      {title}
    </div>
  );
}
```

### 13.2 Tailwind CSS Usage

**Use Tailwind v4 utilities:**
```tsx
// ✓ Good
<div className="flex items-center justify-between p-4">
  <span className="text-primary font-semibold">Title</span>
</div>

// ✗ Avoid inline styles
<div style={{ display: 'flex', padding: '16px' }}>
```

**Class organization:**
1. Layout (flex, grid, position)
2. Spacing (p-, m-, gap-)
3. Sizing (w-, h-, min-)
4. Colors (text-, bg-, border-)
5. Typography (font-, text-)
6. Effects (shadow, rounded)
7. Interactions (hover:, focus:, active:)

### 13.3 Accessibility Guidelines

- All images must have `alt` text
- Interactive elements must have `aria-label`
- Color contrast must meet WCAG AA standards
- Focus states visible for keyboard navigation
- Screen reader friendly

```tsx
// ✓ Good
<button 
  aria-label="Close modal"
  className="focus:ring-2 focus:ring-primary"
>
  <X className="w-5 h-5" />
</button>

// ✗ Avoid
<div onClick={handleClose}>X</div>
```

---

## 14. Appendix

### 14.1 Glossary

| Term | Definition |
|------|------------|
| **NABL** | National Accreditation Board for Testing and Calibration Laboratories |
| **ISO** | International Organization for Standardization |
| **CBC** | Complete Blood Count |
| **LFT** | Liver Function Test |
| **KFT** | Kidney Function Test |
| **HbA1c** | Hemoglobin A1c (Diabetes marker) |
| **TSH** | Thyroid Stimulating Hormone |
| **Home Collection** | Service where phlebotomist visits patient |
| **Turnaround Time** | Time from sample to report |

### 14.2 External Resources

| Resource | URL |
|----------|-----|
| Next.js Docs | https://nextjs.org/docs |
| React Docs | https://react.dev |
| Tailwind CSS | https://tailwindcss.com |
| Framer Motion | https://www.framer.com/motion/ |
| Lucide Icons | https://lucide.dev |
| Leaflet | https://leafletjs.com |

### 14.3 Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Initial | Basic documentation |
| 2.0 | March 2026 | Comprehensive rewrite with all pages and components |

### 14.4 Contact

For questions about this documentation:
- **Engineering Team:** engineering@meddynet.com
- **Product Team:** product@meddynet.com
- **Documentation:** docs-team@meddynet.com

---

*Document prepared by MeddyNet Product & Engineering Team*  
*Last updated: March 2026*
MeddyNet – Complete Technical Documentation
Version: 1.0.0
Framework: Next.js 16 (App Router) + React 19 + TypeScript
Styling: Tailwind CSS v4 + Framer Motion
Last Updated: April 2026

Table of Contents
Project Overview
Architecture & Tech Stack
Folder Structure
Routing & Pages
Component Library
Data Layer
State Management
Styling & Design System
Key Workflows
Utilities & Helpers
Third-Party Integrations
Setup & Development
Performance & Best Practices
Future Enhancements
1. Project Overview
MeddyNet is a diagnostic lab discovery and booking platform. It allows users to:

Search & Compare lab tests across multiple pathology labs
Book home sample collection or lab visits
Track booking status in real-time
View Reports with parameter-level detail (normal/high/low)
Manage Health Records, prescriptions, and a document vault
Chat with labs and support
Manage Profile, addresses, notifications, and security settings
The app is a client-side SPA built with Next.js App Router. All data is currently mock/static (TypeScript files), making it ideal for rapid prototyping or as a frontend ready to be wired to a backend API.

2. Architecture & Tech Stack
Layer	Technology	Purpose
Framework	Next.js 16.1.7 (App Router)	File-based routing, SSR/SSG support, React Server Components
UI Library	React 19.2.3	Component-based UI
Language	TypeScript 5.x	Type safety, interfaces, generics
Styling	Tailwind CSS v4	Utility-first CSS with custom theme tokens
Animations	Framer Motion 12.x	Page transitions, micro-interactions, layout animations
Icons	Lucide React 0.577	Consistent, tree-shakeable icon set
Maps	Leaflet + React-Leaflet 5	Interactive lab location maps
PDF Generation	html-to-image + jsPDF	Booking receipt PDF download
Class Merging	clsx + tailwind-merge	Conditional className deduplication
Linting	ESLint 9 + eslint-config-next	Code quality enforcement
Compiler	Babel React Compiler	Automatic memoization optimization
Key Architectural Decisions
All pages are "use client" – The entire app runs client-side. This simplifies state management but means no SSR benefits currently.
No external state library – React Context + useState + localStorage handles all state.
Static data layer – src/data/ files act as a mock database. Replace these with API calls to go production.
Conditional layouts – LayoutWrapper decides whether to show Navbar/Footer based on route.
3. Folder Structure
meddynet/
├── public/                         # Static assets (logo, images, icons)
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout (metadata + LayoutWrapper)
│   │   ├── page.tsx                # Home page (/)
│   │   ├── globals.css             # Global styles, theme tokens, animations
│   │   ├── not-found.tsx           # Custom 404 page
│   │   ├── template.tsx            # Page transition wrapper
│   │   │
│   │   ├── about/ page.tsx         # About Us
│   │   ├── blog/ page.tsx          # Blog listing
│   │   ├── book/
│   │   │   ├── page.tsx            # 4-step booking flow
│   │   │   └── confirmation/       # Booking success/failure
│   │   ├── careers/ page.tsx       # Job listings
│   │   ├── chat/ page.tsx          # Public support chat
│   │   ├── compare/ page.tsx       # Lab price comparison
│   │   ├── contact/ page.tsx       # Contact form
│   │   ├── dashboard/              # Protected user area
│   │   │   ├── layout.tsx          # Dashboard shell (Sidebar + Topbar)
│   │   │   ├── page.tsx            # Dashboard overview
│   │   │   ├── bookings/           # Booking list + [id] tracking
│   │   │   ├── chat/               # Chat hub + [id] lab-specific chat
│   │   │   ├── health-records/     # Medical history timeline
│   │   │   ├── notifications/      # Alert center
│   │   │   ├── payments/           # Transaction history + wallet
│   │   │   ├── prescriptions/      # Upload + AI test suggestions
│   │   │   ├── profile/            # Settings (personal, addresses, security, notifications)
│   │   │   ├── reports/            # Report list + [id] viewer
│   │   │   └── vault/              # Document storage
│   │   ├── faq/ page.tsx           # FAQ with categories
│   │   ├── help-center/ page.tsx   # Help & support hub
│   │   ├── labs/[id]/ page.tsx     # Lab detail (tests, reviews, facilities)
│   │   ├── login/ page.tsx         # Login form
│   │   ├── maintenance/ page.tsx   # Maintenance mode
│   │   ├── map/ page.tsx           # Leaflet map view
│   │   ├── partnership/ page.tsx   # Lab partner onboarding
│   │   ├── privacy/ page.tsx       # Privacy policy
│   │   ├── refund/ page.tsx        # Refund policy
│   │   ├── register/ page.tsx      # Registration form
│   │   ├── search/ page.tsx        # Test search with filters
│   │   ├── terms/ page.tsx         # Terms of service
│   │   └── verify-otp/ page.tsx    # OTP verification
│   │
│   ├── components/
│   │   ├── cards/
│   │   │   └── LabTestCard.tsx     # Reusable lab/test card
│   │   ├── dashboard/
│   │   │   ├── BookingActions.tsx  # Booking dropdown actions
│   │   │   ├── DashboardSidebar.tsx# Left nav for dashboard
│   │   │   ├── DashboardTopbar.tsx # Top bar with search + notifications
│   │   │   └── MapComponent.tsx    # Leaflet map wrapper
│   │   ├── layout/
│   │   │   ├── Footer.tsx          # Site footer
│   │   │   ├── LayoutWrapper.tsx   # Conditional layout router
│   │   │   └── Navbar.tsx          # Site header navigation
│   │   ├── modals/
│   │   │   └── MapModal.tsx        # Full-screen map modal
│   │   ├── pdf/
│   │   │   └── BookingReceiptPDF.tsx # PDF receipt template
│   │   └── ui/
│   │       ├── AnimatedPartnerLink.tsx
│   │       ├── LanguageSelector.tsx
│   │       ├── Modal.tsx
│   │       └── Toast.tsx
│   │
│   ├── context/
│   │   └── UserContext.tsx         # User state + localStorage persistence
│   │
│   ├── data/
│   │   ├── dashboard.ts            # Mock bookings, reports, payments, etc.
│   │   ├── labs.ts                 # Lab entities with tests & reviews
│   │   ├── tests.ts                # Test categories & popular tests
│   │   └── user.ts                 # User profile & addresses
│   │
│   └── lib/
│       └── utils.ts                # cn() class merging utility
│
├── next.config.ts                  # Next.js config (images, turbopack, reactCompiler)
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript config (paths: @/* → src/*)
├── postcss.config.mjs              # PostCSS + Tailwind
└── eslint.config.mjs               # ESLint rules
4. Routing & Pages
4.1 Public Routes
Route	File	Description
/	app/page.tsx	Landing page with hero, features, testimonials
/search	app/search/page.tsx	Search labs/tests with filters, sort, and map modal
/compare	app/compare/page.tsx	Side-by-side price comparison for a selected test
/map	app/map/page.tsx	Interactive Leaflet map with lab markers
/labs/[id]	app/labs/[id]/page.tsx	Lab detail: tests, reviews, facilities, booking CTAs
/book	app/book/page.tsx	4-step booking wizard (type → date/time → details → review)
/book/confirmation	app/book/confirmation/page.tsx	Success/failure screen with receipt download
/login	app/login/page.tsx	Email + password login form
/register	app/register/page.tsx	Registration with name, phone, DOB, email, password
/verify-otp	app/verify-otp/page.tsx	6-digit OTP input with auto-focus and resend timer
/chat	app/chat/page.tsx	Public support chat with quick replies
/faq	app/faq/page.tsx	Categorized FAQ accordion with feedback
/contact	app/contact/page.tsx	Contact form with subject categories
/about	app/about/page.tsx	Company story, team, mission
/blog	app/blog/page.tsx	Article listing with search and categories
/careers	app/careers/page.tsx	Job openings with department filters
/partnership	app/partnership/page.tsx	Lab partner onboarding
/privacy, /terms, /refund	respective pages	Legal policy pages
/help-center	app/help-center/page.tsx	Support hub with categories
/maintenance	app/maintenance/page.tsx	Maintenance mode splash
* (404)	app/not-found.tsx	Custom 404 with ECG animation
4.2 Dashboard Routes (Protected Shell)
All routes under /dashboard share app/dashboard/layout.tsx which provides:

DashboardSidebar – Left navigation (desktop)
DashboardTopbar – Top bar with search, notifications, profile
AnimatePresence – Page transition animations
Route	Description
/dashboard	Overview: stats, upcoming bookings, quick actions
/dashboard/bookings	Booking list with status filters
/dashboard/bookings/[id]	Real-time tracking timeline + map (lab visit)
/dashboard/reports	Report list with status tabs
/dashboard/reports/[id]	Report viewer with parameter table
/dashboard/health-records	Medical history timeline
/dashboard/prescriptions	Upload prescriptions with AI test suggestions
/dashboard/vault	Document storage (prescriptions, reports, scans)
/dashboard/payments	Transaction history + wallet card
/dashboard/notifications	Alert center with type tabs
/dashboard/profile	Settings: personal, addresses, security, notifications
/dashboard/chat	Chat hub with lab channels
/dashboard/chat/[id]	Lab-specific chat thread
5. Component Library
5.1 Layout Components
LayoutWrapper (src/components/layout/LayoutWrapper.tsx)
Conditional layout router. Uses usePathname() to determine:

Dashboard/Auth pages → No Navbar/Footer (dashboard has its own shell)
Booking pages → Navbar but no Footer
All other pages → Full Navbar + Footer
Navbar (src/components/layout/Navbar.tsx)
Fixed header with glassmorphism on scroll (scrollY > 20)
Desktop nav links with active state indicator
Mobile hamburger → animated X → full-screen drawer
Closes on route change via useEffect([pathname])
Footer (src/components/layout/Footer.tsx)
4-column grid: Brand, Platform, Company, Support
Social media icons with gradient backgrounds and squircle clip-path
Copyright with dynamic year
5.2 Dashboard Components
DashboardSidebar (src/components/dashboard/DashboardSidebar.tsx)
4 navigation groups: Explore, Bookings, My Health, Account
Active route highlighting with dark background
Notification badge count
Sign out button with confirmation
DashboardTopbar (src/components/dashboard/DashboardTopbar.tsx)
Search input for records
Notification bell with dropdown panel (mark all read, delete all)
User avatar with blood group indicator
Mobile slide-out drawer with full navigation
BookingActions (src/components/dashboard/BookingActions.tsx)
Dropdown menu: View Details, Chat with Lab, Update Status, Cancel Booking
Three modals: booking info, status change, cancel confirmation
Accepts callbacks: onStatusUpdate, onCancel
MapComponent (src/components/dashboard/MapComponent.tsx)
Leaflet map with OpenStreetMap tiles (CartoDB Voyager)
Custom markers for each lab
ChangeView helper to recenter on selection
ResizeHandler for modal rendering fixes
Mock coordinates for Delhi NCR labs
5.3 UI Components
Modal (src/components/ui/Modal.tsx)
Portal-based rendering (createPortal to document.body)
Backdrop blur + spring animation
Scroll lock on open
Configurable maxWidth
Toast (src/components/ui/Toast.tsx)
Auto-dismiss after duration (default 3000ms)
Three types: success (emerald), error (red), info (blue)
Bottom-center fixed positioning
MapModal (src/components/modals/MapModal.tsx)
Full-screen modal with lab header
Dynamically loads MapComponent with ssr: false
Google Maps directions button
AnimatedPartnerLink (src/components/ui/AnimatedPartnerLink.tsx)
Simple Link wrapper always pointing to /partnership
Accepts custom children and className
BookingReceiptPDF (src/components/pdf/BookingReceiptPDF.tsx)
A4-sized receipt template (794×1123px)
Header with logo, success banner, booking info, customer details
Itemized test table with pricing
GST calculation (18%)
QR code placeholder + instructions footer
6. Data Layer
All data is currently static TypeScript exports. This is the layer to replace with API calls.

6.1 src/data/labs.ts
Interfaces:

interface Lab {
  id, name, slug, initials, rating, reviewCount, distance,
  address, city, verified, nabl, iso, homeCollection,
  operatingHours, about, image, color, established?,
  totalPatients?, specialties?, ratingBreakdown?,
  tests: LabTest[], reviews: Review[], facilities?: Facility[]
}

interface LabTest {
  id, name, category, price, originalPrice, turnaround,
  homeCollectionAvailable, popular, description?, parameters?
}

interface Review {
  id, name, rating, date, comment, helpful?, verified?, testName?
}

interface Facility {
  id, name, icon, description, available
}
6 sample labs with 4-8 tests each, reviews, and facilities.

Helper functions:

getLabById(id) → Lab | undefined
getLabBySlug(slug) → Lab | undefined
6.2 src/data/tests.ts
popularTests: TestInfo[] – 15 tests with price ranges and lab counts
testCategories: string[] – 12 categories (Hematology, Thyroid, etc.)
searchSuggestions: string[] – 10 common search terms
6.3 src/data/user.ts
interface UserProfile {
  id, name, email, phone, avatar, age,
  gender: "Male" | "Female" | "Other",
  bloodGroup, memberSince
}

interface Address {
  id, label, fullAddress, isDefault
}
6.4 src/data/dashboard.ts
The largest data file containing:

recentBookings: Booking[] – 5 bookings with statuses
bookingTrackingSteps: Record<string, TrackingStep[]> – Timeline data per booking
userReports: Report[] – 4 reports with parameters
vaultFiles: VaultFile[] – 3 documents
paymentHistory: PaymentTransaction[] – 4 transactions
notifications: Notification[] – 7 notifications
healthRecords: HealthRecord[] – 6 records
prescriptions: Prescription[] – 2 prescriptions with suggested tests
availableTimeSlots: Record<string, TimeSlot[]> – Time slot availability
7. State Management
7.1 UserContext (src/context/UserContext.tsx)
The only React Context in the app. Provides:

State	Type	Persisted
user	UserProfile	✅ localStorage (meddynet_user)
addresses	Address[]	✅ localStorage (meddynet_addresses)
notifications	Notification preferences	✅ localStorage
notificationItems	NotificationItem[]	✅ localStorage
Methods:

updateUser(partial) – Merges new data into user profile
markAllNotificationsRead() – Sets all read: true
markNotificationRead(id) – Marks single notification
deleteNotification(id) – Removes from list
Persistence pattern:

// Load on mount (deferred to avoid cascading renders)
useEffect(() => {
  const stored = localStorage.getItem("meddynet_user");
  Promise.resolve().then(() => { if (stored) setUser(JSON.parse(stored)); });
}, []);

// Save on change
useEffect(() => { localStorage.setItem("meddynet_user", JSON.stringify(user)); }, [user]);
7.2 Local State
All other state is component-local via useState. Common patterns:

Search/filter state → useState("") + useMemo for derived data
Modal open/close → useState(false)
Form data → useState({ ... }) with controlled inputs
Loading states → useState(false) with setTimeout simulation
8. Styling & Design System
8.1 Theme Tokens (globals.css)
@theme inline {
  --color-primary: #00A86B;       /* Main brand green */
  --color-primary-light: #00c97a;
  --color-primary-dark: #008f5a;
  --color-accent: #1E88E5;        /* Secondary blue */
  --color-dark: #0F172A;          /* Near-black */
  --color-surface: #F7FBFF;       /* Light background */
  --color-text: #2C3E50;          /* Body text */
  --color-border: #eef2f7;        /* Subtle borders */
  --color-star: #f9a825;          /* Rating stars */
  --font-sans: 'Plus Jakarta Sans', 'Inter', 'Noto Sans Devanagari', sans-serif;
}
8.2 Custom Animations
Class	Keyframe	Description
.animate-float	float	Gentle up/down bobbing
.animate-pulse-ring	pulse-ring	Expanding ring effect
.animate-shimmer	shimmer	Loading skeleton shimmer
.animate-gradient	gradient-shift	Background gradient animation
.animate-spin-slow	spin-slow	20s rotation
.animate-ticker	ticker	Horizontal scrolling
.animate-slideDown	slideDown	Drawer entrance
8.3 Utility Classes
.glass / .glass-dark – Backdrop blur overlays
.gradient-primary / .gradient-accent / .gradient-dark – Gradient backgrounds
.card-hover – Lift + shadow on hover
.scrollbar-hide – Cross-browser scrollbar hiding
.skeleton – Loading placeholder animation
.blob – Blurred organic shapes for backgrounds
8.4 Design Principles
Border radius: Heavy use of rounded-2xl to rounded-[56px] for soft, modern feel
Shadows: Layered shadows with color tints (shadow-primary/20)
Typography: font-black (900) for headings, font-bold (700) for body
Spacing: Generous padding (p-8 to p-14) for breathing room
Micro-interactions: Hover scale, translate, color transitions on almost all interactive elements
9. Key Workflows
9.1 Search Flow
User types in search bar
  → search/page.tsx captures query via URL (?q=...)
  → useMemo filters labs by test name/category
  → Filters applied: homeOnly, priceRange, minRating, category
  → Results sorted by: relevance, price, rating, distance
  → Each result shows: lab info, top tests, price, CTAs
  → "Go to Lab" → /labs/[id]
  → "Book Now" → /book?lab=X&q=Y
9.2 Booking Flow (4 Steps)
Step 1: Type & Tests
  → Choose Home Collection or Lab Visit
  → Select one or more tests (checkboxes)
  → Cart summary shows total + savings

Step 2: Date & Time
  → 7-day date picker (horizontal scroll)
  → Time slots (7AM-6PM, 30-min intervals)
  → Real-time availability check (past slots disabled)

Step 3: Patient Details
  → Name, phone, age, gender (required)
  → Symptoms (optional)
  → Address (required for home collection)
  → Input validation: letters only for name, digits for phone/age

Step 4: Review & Pay
  → Summary: lab, patient, schedule, tests
  → Promo code input (WELCOME50 = ₹50 off, HEALTH20 = 20% off)
  → Price breakdown: subtotal, discount, net amount
  → "Pay & Confirm" → redirects to /book/confirmation with URL params
9.3 Booking Confirmation Flow
/book/confirmation receives URL params
  → 3.5s processing animation (spinner rings)
  → Generates booking ID, receipt number, transaction ID
  → Success state: booking summary, lab info, tests, date/time
  → Actions: Go to Dashboard, Download PDF, Share
  → PDF generation: html-to-image captures hidden BookingReceiptPDF → jsPDF saves
  → Failure state: error message, retry button
9.4 Booking Tracking Flow
/dashboard/bookings/[id]
  → Finds booking in mock data
  → Calculates progress % from completed steps
  → If Lab Visit: shows Leaflet map + navigate button
  → If Home Collection: shows progress bar + technician info
  → Timeline: 6-7 steps with icons, timestamps, status badges
  → Actions: Live GPS, Chat Lab, Call Now, Reschedule, Cancel
  → Cancellation disabled if technician dispatched or sample collected
9.5 Report Viewer Flow
/dashboard/reports/[id]
  → Finds report in mock data
  → Shows: test name, lab, date, status, doctor's note
  → Parameter table: name, value, unit, reference range, status
  → Status icons: TrendingUp (high), TrendingDown (low), Minus (normal)
  → Color coding: red for high, blue for low, green for normal
  → Abnormal warning banner if any parameter is out of range
  → Actions: Share (Web Share API or clipboard), Download PDF
9.6 Profile Management Flow
/dashboard/profile?tab=personal|addresses|security|notifications

Personal Tab:
  → Avatar with camera upload button
  → Editable: name, phone, age, blood group (dropdown), PAN card
  → Email is read-only (locked)
  → PAN validation: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  → Save shows loading spinner → success toast

Addresses Tab:
  → Grid of address cards
  → Add/Edit/Delete with modal form
  → Default address badge

Security Tab:
  → Password change form (old/new/confirm)
  → 2FA enable card
  → Safety check status

Notifications Tab:
  → Toggle switches for booking updates, reminders, offers, security
  → WhatsApp reports toggle (prominent card)
9.7 Prescription Upload Flow
/dashboard/prescriptions
  → Drag-and-drop or file input zone
  → Accepts PDF and images
  → Simulated 2.5s processing
  → AI extracts suggested tests with reasons and prices
  → New prescription added to list
  → Active prescription shows test suggestions with book buttons
10. Utilities & Helpers
10.1 cn() (src/lib/utils.ts)
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
Purpose: Merges conditional Tailwind classes without conflicts. Used everywhere for dynamic className construction.

Example:

className={cn(
  "fixed top-0 left-0 w-full z-50 transition-all duration-300",
  isScrolled ? "glass shadow-lg" : "bg-white/90 backdrop-blur-sm"
)}
10.2 Input Validation Patterns
Throughout the app, inline onChange handlers sanitize input:

Field	Pattern	Purpose
Name	replace(/[^a-zA-Z\s.-]/g, '')	Letters, spaces, dots, hyphens only
Phone	replace(/\D/g, '')	Digits only
Age	replace(/\D/g, '') + clamp to 150	Digits only, max 150
Email	replace(/\s/g, '').toLowerCase()	No spaces, lowercase
Password	replace(/\s/g, '')	No spaces
PAN	toUpperCase().replace(/[^A-Z0-9]/g, '')	Uppercase alphanumeric
Address	replace(/\s{2,}/g, ' ').trimStart()	Single spaces, no leading space
11. Third-Party Integrations
11.1 Leaflet Maps
Package: leaflet + react-leaflet + @types/leaflet
Tile Provider: CartoDB Voyager (https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png)
SSR Handling: Dynamically imported with ssr: false to avoid window is not defined errors
Markers: Default Leaflet icons (loaded from unpkg CDN)
Coordinates: Mock lat/lng for Delhi NCR areas
11.2 PDF Generation
Packages: html-to-image + jspdf
Flow: Renders hidden BookingReceiptPDF component → converts to JPEG → embeds in PDF → triggers download
Orientation: Auto-detects landscape vs portrait based on element dimensions
Quality: 0.95 JPEG quality, 2x pixel ratio for crisp output
11.3 Web Share API
Used in report viewer and booking confirmation:

if (navigator.share && navigator.canShare(shareData)) {
  await navigator.share({ title, text, url });
} else {
  await navigator.clipboard.writeText(url); // Fallback
}
11.4 Google Maps Integration
Lab detail pages and booking tracking open Google Maps for directions:

const query = encodeURIComponent(`${lab.name}, ${lab.address}, ${lab.city}`);
window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
12. Setup & Development
12.1 Prerequisites
Node.js 18+ (LTS recommended)
npm or pnpm or yarn
12.2 Installation
# Clone and install
cd meddynet
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
12.3 Development Server
Runs on http://localhost:3000
Hot Module Replacement (HMR) enabled
Turbopack enabled via next.config.ts for faster builds
12.4 Environment Variables
Currently no environment variables are required. All data is static. For production, you would add:

NEXT_PUBLIC_API_URL=https://api.meddynet.com
NEXT_PUBLIC_MAPBOX_TOKEN=...
NEXT_PUBLIC_PAYMENT_GATEWAY_KEY=...
12.5 Type Safety
Strict mode enabled in tsconfig.json
Path aliases: @/* maps to ./src/*
React types: @types/react and @types/react-dom v19
No implicit any enforced
13. Performance & Best Practices
13.1 Current Optimizations
Technique	Where	Benefit
useMemo for filtered data	search, compare, dashboard	Prevents recalculation on every render
Dynamic imports with ssr: false	MapComponent, MapModal	Avoids SSR errors, reduces initial bundle
Suspense boundaries	search, book, confirmation, profile	Loading states during data fetch
AnimatePresence mode="popLayout"	dashboard, bookings	Smooth page transitions without layout shift
Promise.resolve().then() for deferred updates	UserContext, LanguageContext	Prevents cascading renders in effects
suppressHydrationWarning	Inputs with dynamic values	Avoids hydration mismatches
CSS content-visibility and will-change	Animations	GPU-accelerated transforms
13.2 Bundle Considerations
Framer Motion is the largest dependency (~30KB gzipped)
Leaflet adds ~140KB (CSS + JS)
jsPDF adds ~200KB (only loaded on confirmation page via dynamic import)
Lucide React is tree-shakeable – only used icons are bundled
13.3 Accessibility
All buttons have min-h-[44px] (WCAG touch target size)
aria-label on icon-only buttons
aria-expanded on dropdowns
Keyboard navigation support (Enter to submit, Escape to close modals)
Color contrast meets WCAG AA standards
14. Future Enhancements
14.1 Backend Integration
Replace static data with API calls:

// Current (static)
import { labs } from "@/data/labs";
const results = labs.filter(...);

// Future (API)
const { data: labs } = await fetch("/api/labs?search=" + query);
Recommended API structure:

GET  /api/labs                  → List all labs
GET  /api/labs/:id              → Lab detail
GET  /api/labs/:id/tests        → Lab's test catalog
POST /api/bookings              → Create booking
GET  /api/bookings/:id          → Booking status
GET  /api/reports/:id           → Report data
POST /api/prescriptions/upload  → Upload prescription
14.2 Authentication
Current login/register pages are UI-only. Add:

JWT or session-based auth
Protected route middleware
Password hashing (bcrypt)
OTP via SMS (Twilio/MSG91)
Social login (Google, Apple)
14.3 Database Schema (PostgreSQL/Prisma)
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  phone     String
  bookings  Booking[]
  reports   Report[]
}

model Lab {
  id              String   @id @default(uuid())
  name            String
  nabl            Boolean
  iso             Boolean
  homeCollection  Boolean
  tests           LabTest[]
  reviews         Review[]
}

model Booking {
  id        String   @id @default(uuid())
  userId    String
  labId     String
  status    String   // upcoming, in-progress, completed, cancelled
  type      String   // home, visit
  total     Float
}
14.4 Payment Integration
Replace mock payment with:

Razorpay or Stripe for Indian payments
UPI, cards, net banking, wallets
Webhook handling for payment confirmation
Refund processing
14.5 Real-Time Features
WebSocket/Socket.io for live booking tracking
Push notifications for report readiness
Live chat with actual lab representatives
14.6 SEO & SSR
Convert key pages to Server Components:

/search – SSR with meta tags per query
/labs/[id] – SSR with structured data (Schema.org)
/blog/[slug] – SSG for blog posts
14.7 Testing
Add test coverage:

Unit: Jest + React Testing Library for components
E2E: Playwright for booking flow, search, dashboard
Visual: Storybook for component documentation
Appendix: Quick Reference
Key File Locations
Need	File
Add a new page	src/app/<route>/page.tsx
Add a new component	src/components/<category>/<Name>.tsx
Change theme colors	src/app/globals.css → @theme inline
Add mock data	src/data/<entity>.ts
Add global state	src/context/<Name>Context.tsx
Change navigation	src/components/layout/Navbar.tsx + DashboardSidebar.tsx
Add animation	Import from framer-motion
Common Patterns
// Animated page wrapper
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
  {children}
</motion.div>

// Conditional class with cn()
className={cn("base-class", isActive && "active-class")}

// Debounced search (manual)
const [query, setQuery] = useState("");
const debounced = useMemo(() => {
  const t = setTimeout(() => setDebounced(query), 300);
  return () => clearTimeout(t);
}, [query]);

// Modal with portal
<Modal isOpen={open} onClose={() => setOpen(false)} title="Title">
  {content}
</Modal>
This documentation covers the complete MeddyNet codebase as of April 2026. The application is a production-ready frontend that can be connected to a backend API to become a fully functional healthcare platform.