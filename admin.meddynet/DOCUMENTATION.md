MeddyNet Admin Dashboard — Complete Documentation
Table of Contents
Project Overview
Architecture & Tech Stack
Directory Structure
Authentication & Authorization
Layout System
Shared UI Components
Shell & Navigation Components
Page Reference (All 25 Pages)
CRUD Operations Matrix
Data Models & Mock Data
State Management
Styling & Theming
Routing & Navigation
Key Libraries
1. Project Overview
MeddyNet Admin is a comprehensive healthcare diagnostics platform management dashboard. It provides administrators with full control over users, labs, bookings, financials, content, and system configuration. The application is built as a Next.js 15 App Router SPA with client-side rendering for all interactive pages.

Key Capabilities
User Management — View, create, suspend, and delete patient accounts
Lab Partner Management — Onboard, verify, edit, and remove diagnostic lab partners
Booking Operations — Monitor, edit, reschedule, and refund bookings
Financial Management — Process payouts, track revenue, manage transactions
Refund Processing — Review, approve, reject, and partially refund
Coupon/Promotion Engine — Create, edit, duplicate, and delete campaigns
Subscription Tiers — Configure plan pricing and commission rates
Content Management (Blog) — Create, edit, publish, and archive blog posts
Review Moderation — Flag, publish, and remove patient reviews
Feedback/NPS Analytics — Track sentiment, NPS scores, and keyword trends
Support Ticket System — Multi-channel ticket management with templates
Notification Broadcasting — Send In-App, Email, and SMS notifications
City/Zone Management — Geographic presence control
API Key Orchestration — Generate, rotate, and revoke API keys
Audit Logging — Immutable record of all admin actions
Data Export — Export any dataset in CSV, Excel, or JSON
Platform Health Monitoring — Real-time service status with live diagnostics
Analytics Dashboard — Advanced charts, funnels, heatmaps, and cohort retention
System Settings — Feature flags, session management, IP allowlisting
Admin Profile — Identity management and password reset
2. Architecture & Tech Stack
Layer	Technology
Framework	Next.js 15 (App Router)
Language	TypeScript (strict mode)
Rendering	Client Components for all pages
Styling	Tailwind CSS with CSS variables for theming
Animations	Framer Motion
Charts	Recharts
Icons	Lucide React
Drag & Drop	@dnd-kit/core + @dnd-kit/sortable
State	React useState/useContext (no external state library)
Auth	localStorage-based session + RBAC
Font	Plus Jakarta Sans (Google Fonts)
3. Directory Structure
src/
├── app/
│   ├── layout.tsx                  # Root layout (font, metadata, body)
│   ├── page.tsx                    # Root redirect to /admin/login
│   ├── globals.css                 # Tailwind + CSS variables
│   └── admin/
│       ├── layout.tsx              # Admin layout (AdminProvider + AdminShell)
│       ├── login/page.tsx          # Login + 2FA OTP page
│       ├── overview/page.tsx       # Dashboard with live feed
│       ├── analytics/page.tsx      # Advanced analytics charts
│       ├── users/page.tsx          # User management
│       ├── labs/page.tsx           # Lab partner management
│       ├── bookings/page.tsx       # Booking management
│       ├── tests/page.tsx          # Test catalog management
│       ├── technicians/page.tsx    # Technician fleet management
│       ├── financials/page.tsx     # Revenue & payout management
│       ├── refunds/page.tsx        # Refund processing
│       ├── subscriptions/page.tsx  # Subscription tier management
│       ├── coupons/page.tsx        # Coupon/promotion management
│       ├── support/page.tsx        # Support ticket system
│       ├── reviews/page.tsx        # Review moderation
│       ├── feedback/page.tsx       # NPS & feedback analytics
│       ├── notifications/page.tsx  # Notification broadcasting
│       ├── blog/page.tsx           # Blog content management
│       ├── cities/page.tsx         # City/zone management
│       ├── onboarding/page.tsx     # Lab onboarding Kanban
│       ├── api-keys/page.tsx       # API key management
│       ├── reports/page.tsx        # Diagnostic report auditing
│       ├── audit-log/page.tsx      # Admin action audit log
│       ├── data-export/page.tsx    # Dataset export center
│       ├── platform-health/page.tsx # System health monitoring
│       ├── settings/page.tsx       # System configuration
│       └── profile/page.tsx        # Admin profile management
│
├── components/
│   └── admin/
│       ├── AdminShell.tsx          # Auth guard + layout wrapper
│       ├── AdminSidebar.tsx        # Collapsible navigation sidebar
│       ├── AdminTopbar.tsx         # Top bar with search, notifications, profile
│       ├── CommandPalette.tsx      # Global command search (Ctrl+K)
│       └── ui/
│           ├── DataTable.tsx       # Generic paginated table with search
│           ├── Modal.tsx           # Animated modal dialog
│           ├── ConfirmDialog.tsx   # Confirmation dialog wrapper
│           ├── StatusBadge.tsx     # Color-coded status indicator
│           ├── StatCard.tsx        # KPI stat card with delta
│           ├── SlideOverDrawer.tsx # Right-side slide-over panel
│           ├── Toast.tsx           # Toast notification system
│           ├── Breadcrumbs.tsx     # Dynamic breadcrumb navigation
│           ├── PermissionGate.tsx  # RBAC conditional rendering
│           ├── PageHeader.tsx      # Page header with breadcrumbs
│           ├── PageSkeleton.tsx    # Loading skeleton placeholder
│           └── CommandPalette.tsx  # Secondary command palette
│
├── contexts/
│   └── AdminContext.tsx            # Global admin state (role, theme, permissions)
│
├── lib/
│   └── permissions.ts              # RBAC role definitions & permission checks
│
└── data/
    ├── coupons.ts                  # Coupon mock data + types
    ├── financials.ts               # Transaction & refund mock data
    ├── reviews.ts                  # Review mock data
    ├── support.ts                  # Support ticket mock data
    ├── technicians.ts              # Technician mock data
    ├── users.ts                    # User mock data
    ├── labs.ts                     # Lab mock data
    ├── bookings.ts                 # Booking mock data
    └── notifications.ts            # Notification mock data
4. Authentication & Authorization
4.1 Authentication Flow
Login Page (/admin/login):

User enters email + password, clicks "Sign in"
Mock verification (1.2s delay) sets localStorage.adminSession = "true", redirects to /admin/overview
After login, 2FA step appears with 6-digit OTP input
OTP auto-advances to next field on input, backspace goes to previous
OTP verification (1.5s delay) sets session and redirects to overview
Session Guard (AdminShell.tsx):

On every admin page load, checks localStorage.getItem("adminSession")
If no session and not on /admin/login, redirects to login
Login page is excluded from the guard
Uses isInitializing state to prevent flash of unauthenticated content
Logout:

Removes adminSession from localStorage
Redirects to /admin/login
Available in sidebar footer and topbar profile dropdown
4.2 RBAC (Role-Based Access Control)
File: src/lib/permissions.ts

Role	Description	Route Access	Key Permissions
superadmin	Full access	* (all routes)	All actions
operations	Day-to-day ops	overview, users, labs, bookings, technicians, support, notifications, analytics, cities, onboarding, reviews	ban_user, verify_lab, delete_booking, issue_refund, close_ticket, assign_ticket, publish_review, flag_review
finance	Financial operations	overview, financials, subscriptions, refunds, coupons, data-export	approve_payout, hold_payout, reject_payout, process_batch_payout, approve_refund, reject_refund, create_coupon, delete_coupon, export_data
support	Customer support	overview, support, users, bookings, refunds, reviews	close_ticket, assign_ticket, issue_refund, flag_review
content	Content management	overview, blog, notifications, feedback	publish_blog, delete_blog, send_notification, delete_notification
PermissionGate Component: Wraps UI elements and conditionally renders based on can(permission) check. Shows a disabled/tooltip version when permission is denied.

5. Layout System
5.1 Root Layout (src/app/layout.tsx)
Sets up Plus_Jakarta_Sans font
Applies font-sans to body
Sets metadata (title, description)
Body is min-h-full flex flex-col
5.2 Admin Layout (src/app/admin/layout.tsx)
Wraps children in <AdminProvider> (context)
Wraps in <AdminShell> (auth guard + chrome)
5.3 AdminShell (src/components/admin/AdminShell.tsx)
Auth Check: Validates session, redirects if unauthorized
Theme Sync: Applies dark class to <html> element based on context theme
Layout Composition: Sidebar + Topbar + Main Content + Breadcrumbs + CommandPalette
Mobile Sidebar: Overlay backdrop on mobile when sidebar is open
Login Bypass: Renders children directly on /admin/login
6. Shared UI Components
6.1 DataTable (ui/DataTable.tsx)
Purpose: Generic, reusable data table used across all list pages.

Props:

data: T[] — Array of records (must have id field)
columns: Column<T>[] — Column definitions with header and accessor (key or render function)
onRowClick?: (row: T) => void — Click handler for rows
searchable?: boolean — Shows search input
selectedIds?: (string|number)[] — Controlled selection state
onSelectionChange?: (ids) => void — Selection change callback
Features:

URL-synced state: Search term and page number stored in URL query params (?search=...&page=2)
Debounced search: 300ms debounce before URL update
Pagination: 25 items per page with Prev/Next controls
Multi-select: Checkbox column with select-all header checkbox
Responsive: Horizontal scroll on overflow, min-width 800px
Empty state: "No records found" message
6.2 Modal (ui/Modal.tsx)
Purpose: Animated modal dialog with backdrop.

Props: isOpen, onClose, title, children, footer?

Features:

Framer Motion enter/exit animations (scale + fade)
Body scroll lock when open
Backdrop click to close
Optional footer slot
Max-height with internal scroll
6.3 ConfirmDialog (ui/ConfirmDialog.tsx)
Purpose: Pre-styled confirmation dialog (wraps Modal).

Props: isOpen, onClose, onConfirm, title, description, confirmText?, cancelText?, isDestructive?

Features:

Alert triangle icon
Destructive mode (red button) vs normal mode (primary button)
Calls onConfirm() then onClose() on confirm
6.4 StatusBadge (ui/StatusBadge.tsx)
Purpose: Color-coded status indicator pill.

Props: status (success|warning|error|info|neutral), label, pulse?

Features:

5 status types with distinct color schemes
Dark mode support
Optional animated pulse dot
6.5 StatCard (ui/StatCard.tsx)
Purpose: KPI metric card.

Props: title, value, icon, delta?, subtext?

Features:

Icon in top-right corner
Optional delta indicator (up/down with color)
Optional subtext
6.6 SlideOverDrawer (ui/SlideOverDrawer.tsx)
Purpose: Right-side slide-over panel for detail views.

Props: isOpen, onClose, title?, children

Features:

Spring animation (damping: 25, stiffness: 200)
Full-height, max-width 480px
Body scroll lock
Backdrop with blur
6.7 Toast (ui/Toast.tsx)
Purpose: Toast notification system.

Exports: Toast (single), ToastContainer (manager), ToastType, ToastMessage

Features:

4 types: success, error, warning, info
Auto-dismiss after 4 seconds
Framer Motion animations
Stackable (bottom-right corner)
6.8 PermissionGate (ui/PermissionGate.tsx)
Purpose: RBAC conditional rendering wrapper.

Props: permission, children, fallback?

Features:

Checks permission via useAdmin().can(permission)
If denied: renders children at 40% opacity with hover tooltip "Insufficient permissions"
Custom fallback can be provided
6.9 Breadcrumbs (ui/Breadcrumbs.tsx)
Purpose: Dynamic breadcrumb navigation from URL path.

Features:

Auto-generates from usePathname()
Skips rendering on /admin/overview
Last segment highlighted with primary color
Uses <a> tags for navigation
6.10 CommandPalette (ui/CommandPalette.tsx)
Purpose: Quick navigation via keyboard shortcut (Ctrl/Cmd+K).

Features:

7 quick actions with keyboard shortcuts (G B, G U, etc.)
Search filtering by title and description
Framer Motion animations
Custom event listener (open-command-palette)
6.11 PageHeader (ui/PageHeader.tsx)
Purpose: Standardized page header with breadcrumbs, description, and action slots.

Props: breadcrumbs: BreadcrumbItem[], description?, actions?: ReactNode

6.12 PageSkeleton (ui/PageSkeleton.tsx)
Purpose: Loading placeholder with animated skeleton.

Features:

Header skeleton
4 stat card skeletons
Table skeleton with 6 rows
Pulse animation
7. Shell & Navigation Components
7.1 AdminSidebar (AdminSidebar.tsx)
Structure:

Logo: MeddyNet "M" icon + "Admin" badge
Navigation: 6 collapsible groups with 25 total nav items
Footer: User avatar, name, email, role badge, logout button
Nav Groups:

Group	Items
Core	Overview, Analytics, Platform Health
Entities	Users, Labs (badge:3), Bookings, Test Catalog, Technicians
Operations	Financials, Refunds (badge:4), Subscriptions, Coupons
Platform	Notifications, Support (badge:7), Reviews, Feedback
Content & Config	Blog, Cities, Onboarding, API Keys
System	Reports, Audit Log, Data Export, Settings
Features:

Collapsible groups (persisted to localStorage)
Active route highlighting (left border + primary color)
Badge counts for pending items
Mobile: slides in from left with backdrop overlay
Desktop: fixed position, always visible
7.2 AdminTopbar (AdminTopbar.tsx)
Left Side:

Mobile hamburger menu button
Page title (derived from URL path)
Right Side:

Theme Toggle: Switch between light/dark mode
Notification Bell: Dropdown with 4 tabs (all/ops/sec), unread indicator, notification list
Profile Dropdown: Avatar with initials, name, role badge, links to Profile/Settings, Sign Out button
Search Button: Opens command palette (Ctrl+K)
7.3 CommandPalette (CommandPalette.tsx)
Purpose: Global command search accessible from anywhere.

Features:

25 navigation commands + 5 action commands
Fuzzy matching algorithm
Keyboard navigation (up/down arrows, Enter to execute, Escape to close)
Category badges (Navigation/Action)
Keyboard shortcut hints
Category-colored icons
8. Page Reference (All 25 Pages)
8.1 Login (/admin/login)
File: src/app/admin/login/page.tsx

Features:

Two-step login: Credentials then 2FA OTP
Split layout: Left branding panel (desktop) + Right form
Animated step transitions (Framer Motion)
6-digit OTP with auto-focus navigation
Mock authentication (any credentials accepted)
"Forgot password" link (placeholder)
"Resend code" link (placeholder)
State:

step: "login" | "2fa"
email, password: form inputs
otp: 6-element string array
isLoading: loading spinner state
8.2 Overview/Dashboard (/admin/overview)
File: src/app/admin/overview/page.tsx

Features:

Platform Status Banner: Green "All systems operational" link to Platform Health
6 Stat Cards: Total Users (12,450), Partner Labs (342), Bookings Today (89), Revenue MTD (12.4L), Pending Payouts (3.2L), Open Support (28)
Line Chart: Bookings and Revenue dual-axis chart (30 days)
Pie Chart: Booking Types (Home Collection 65%, Lab Visit 30%, Cancelled 5%)
Live Activity Feed: Auto-updating every 8 seconds, 8 event types, pause/resume toggle, max 20 events
Quick Actions Panel: Links to Approve Labs (3), Flagged Reports (4), Process Payouts (45), Review Refunds (8), Platform Health
Event Types: new_booking, new_user, report_uploaded, lab_verified, support_ticket, refund_requested, coupon_used, notification_sent

8.3 Analytics (/admin/analytics)
File: src/app/admin/analytics/page.tsx

Features:

Date Range Selector: 7d, 30d, 90d, 1y
4 Stat Cards: New Users (4,850), Avg Bookings/User (3.8), Revenue MTD (24.8L), Platform NPS (72)
Area Chart: New User Signups over 8 months
Bar Chart: City-Wise New Users (horizontal)
Conversion Funnel: 6-stage funnel (Visited to Searched to Viewed Lab to Initiated Booking to Completed to Reviewed) with drop-off percentages
Revenue Heatmap: Day x Hour grid (7 days x 8 hours) with color intensity
Cohort Retention Table: 6 months x 6 months retention percentages with color coding
Geographic Distribution Table: Sortable by users, labs, bookings, revenue, rating
8.4 Users (/admin/users)
File: src/app/admin/users/page.tsx

CRUD Operations:

Operation	How
Create	"Add User" button opens Modal with name, phone, email, city, blood group, adds to table
Read	DataTable with 30 mock users, row click opens SlideOverDrawer
Update	"Edit Profile" from row dropdown opens Modal pre-filled with user data
Delete	"Delete" from row dropdown opens ConfirmDialog, removes from state
Suspend/Reactivate	"Suspend" from row dropdown opens ConfirmDialog, toggles status
SlideOverDrawer Tabs:

Bookings: Last 10 bookings list
Reports: Placeholder (no data)
Health Records: Placeholder (no data)
Account: Reset Password, Suspend Account, Delete Account buttons
Filters: City, Blood Group, Status filter buttons

8.5 Labs (/admin/labs)
File: src/app/admin/labs/page.tsx

CRUD Operations:

Operation	How
Create	"Add Lab" button opens Modal with name, city, plan, NABL/ISO checkboxes, status
Read	DataTable with 25 mock labs, row click opens SlideOverDrawer
Update	"Edit" button opens Modal pre-filled with lab data
Delete	"Delete" button opens ConfirmDialog, removes from state
Verify	"Verify Now" button for Pending labs opens 3-step wizard modal
Verification Wizard (3 Steps):

Document Review: NABL Certificate, ISO 9001:2015 download links
Facilities: Checkboxes for Dedicated Collection, Cold Chain, Waste Disposal, Qualified Pathologist
Final Approval: Summary with service fee tier and payment terms
SlideOverDrawer Stats: Total Tests (145), Technicians (8), Bookings, Revenue

Alert Banner: "2 Labs Pending Verification" at top

8.6 Bookings (/admin/bookings)
File: src/app/admin/bookings/page.tsx

CRUD Operations:

Operation	How
Create	"Add Booking" button opens Modal with patient, lab, amount, status
Read	DataTable with 40 mock bookings, row click opens detail Modal
Update	"Edit" button opens Modal pre-filled with booking data
Delete	"Delete" button opens ConfirmDialog, removes from state
Refund	"Initiate Refund" from detail modal opens Refund modal with amount and reason
Reschedule	"Reschedule" button from detail modal (placeholder)
Tabs: All, Today, Home Visits, Lab Visits, Escalated

Detail Modal: Patient info, status, payment breakdown, refund/reschedule actions

8.7 Tests (/admin/tests)
File: src/app/admin/tests/page.tsx

CRUD Operations:

Operation	How
Create	"Add New Test" button opens Modal with name, category, price
Read	DataTable with 20 mock tests
Update	"Edit" button opens Modal pre-filled with test data
Delete	"Delete" button opens ConfirmDialog, removes from state
Toggle Active	Status icon (check/cross) in table
Categories: Hematology, Biochemistry, Hormones, Vitamins, Diabetes

8.8 Technicians (/admin/technicians)
File: src/app/admin/technicians/page.tsx

CRUD Operations:

Operation	How
Create	"Add Technician" button opens Modal with name, lab, city, status
Read	DataTable with 15 mock technicians
Update	"Edit" button opens Modal pre-filled
Delete	"Delete" button opens ConfirmDialog, removes from state
View Modes: List view (DataTable) | Live Map view (placeholder with Leaflet message)

Stats: Total Techs (450), On Duty Now (312), Avg Rating (4.8), Collections Today (8,940)

8.9 Financials (/admin/financials)
File: src/app/admin/financials/page.tsx

CRUD Operations:

Operation	How
Create	"Process Payout" button opens Modal with lab, amount, type, status
Read	DataTable with 15 mock transactions
Update	"Edit" button opens Modal pre-filled
Delete	"Delete" button opens ConfirmDialog, removes from state
Batch Process	Select multiple rows, click "Process Selected", ConfirmDialog marks as Completed
Charts: Revenue Breakout bar chart (6 months, 3 series: Gross Revenue, Commission, Net Payouts)

Stats: Gross Bookings Value (28.5L), Platform Commission (4.2L), Net Payouts (24.3L), Pending Settlements (3.1L)

8.10 Refunds (/admin/refunds)
File: src/app/admin/refunds/page.tsx

CRUD Operations:

Operation	How
Read	DataTable with 20 mock refunds from src/data/financials.ts
Approve	"Approve" button (PermissionGate: can_approve_refund) opens ConfirmDialog
Reject	"Reject" button (PermissionGate: can_reject_refund) opens ConfirmDialog
Partial Refund	Review modal: enter partial amount, then Approve
Tabs: Pending, Approved, Rejected, All

Review Modal:

Patient, Lab, Booking ID, Amount, Payment Method, Requested date
Patient reason (highlighted)
Admin notes textarea
Partial amount input
Approve/Reject buttons (permission-gated)
Stats: Pending count, Approved MTD, Rejected MTD, Amount Refunded

8.11 Subscriptions (/admin/subscriptions)
File: src/app/admin/subscriptions/page.tsx

CRUD Operations:

Operation	How
Read	DataTable with 15 mock subscriptions
Change Plan	"Change Plan" button opens Modal with plan selector dropdown
Edit Tier Config	"Edit Tier Config" on plan cards opens Modal with price and commission
Plan Tiers (4 cards):

Tier	Price	Commission
Starter	Free	15%
Basic	999/mo	12%
Advanced	2499/mo	10%
Premium	4999/mo	8%
8.12 Coupons (/admin/coupons)
File: src/app/admin/coupons/page.tsx

CRUD Operations:

Operation	How
Create	"Create Campaign" button opens Modal with code, type, value, min order, max uses, dates, applicableTo
Read	DataTable with 10 mock coupons from src/data/coupons.ts
Update	"Edit" button opens Modal pre-filled
Delete	"Delete" button opens ConfirmDialog, removes from state
Duplicate	"Duplicate" button opens Modal pre-filled with new generated code, Paused status
Tabs: Active Codes (DataTable) | Redemption Audit (12 mock redemptions)

Analytics Modal (per coupon):

Total Uses, Revenue Impact (24.5k), Conversion Rate (14.2%)
Bar chart: Redemption Velocity (7 days)
Performance insight text
Coupon Types: Flat (fixed off) | Percentage (% off) Applicable To: All, New Users, Specific Lab, Specific Test Status: Active, Expired, Paused

8.13 Support (/admin/support)
File: src/app/admin/support/page.tsx

CRUD Operations:

Operation	How
Create	"New Ticket Protocol" button (placeholder)
Read	Split layout: Ticket list (left) + Conversation (right)
Reply	Reply composer with channel selector, internal note toggle, templates
Close	"Close" button marks as Resolved
Assign	Assignee dropdown (Unassigned, Support Agent 1-3)
Features:

5 Quick Reply Templates: Pre-written responses
Channel Selector: In-App, Email, SMS
Internal Note Toggle: Amber-themed internal protocol mode
Keyboard Shortcut: Ctrl+Enter to send reply
Filter Tabs: All, Open, In Progress, Resolved
Auto-scroll: Messages auto-scroll to bottom
Stats: Open Circuits, In Treatment, Resolved Units, Latency (Avg 2.4h)

8.14 Reviews (/admin/reviews)
File: src/app/admin/reviews/page.tsx

CRUD Operations:

Operation	How
Read	DataTable with 20 mock reviews from src/data/reviews.ts
Flag	"Flag" button (PermissionGate: can_flag_review) sets status to Flagged
Publish	"Publish" from preview modal (PermissionGate: can_publish_review)
Remove	"Remove" button opens ConfirmDialog, removes from state
Bulk Actions	Checkbox selection: Publish Batch / Decommission
Filters:

Rating filter buttons: ALL, 1-star, 2-star, 3-star, 4-star, 5-star
Status dropdown: All Lifecycles, Published, Flagged, Decommissioned
Sentiment dropdown: All Dimensions, Positive, Neutral, Negative
Preview Modal: Patient avatar, name, lab, test, rating stars, review text, action buttons

Stats: Total Reviews, Avg Rating, Flagged count, Today count

8.15 Feedback (/admin/feedback)
File: src/app/admin/feedback/page.tsx

Features:

NPS Gauge: SVG arc gauge with needle, color-coded (red/amber/green)
Promoter/Passive/Detractor Breakdown: Stacked progress bars with percentages
NPS Trend Chart: 12-month line chart (Recharts)
Keyword Cloud: Extracted keywords with frequency, clickable to filter reviews
Feedback Table: Top 10 reviews with sentiment icons, NPS scores
NPS Calculation: ((promoters - detractors) / total) x 100

Keywords: 20 predefined keywords extracted from review text (fast, accurate, professional, clean, late, wrong, etc.)

8.16 Notifications (/admin/notifications)
File: src/app/admin/notifications/page.tsx

CRUD Operations:

Operation	How
Create	Compose form, click "Send Now", adds to history
Read	Notification History panel (right side)
Delete	X button on each history item
Compose Form:

Target Audience: All Users, All Labs, Specific City, Specific Lab (radio buttons)
Channels: In-App, Email, SMS (checkboxes)
Title: Text input
Body: Textarea (6 rows)
Actions: "Schedule for Later" (placeholder), "Send Now"
History Panel: Cards with title, date, body, target, channel badges, "DELIVERED" status

8.17 Blog (/admin/blog)
File: src/app/admin/blog/page.tsx

CRUD Operations:

Operation	How
Create	"Initialize Broadcast" opens Full-screen editor
Read	DataTable with 15 mock posts
Update	"Edit" button opens Full-screen editor pre-filled
Delete	"Delete" button opens ConfirmDialog, removes from state
Publish	"Execute Broadcast" button in editor sets status to Published
Save Draft	"Save Draft Protocol" button sets status to Draft
Editor Mode (replaces entire page when open):

Title input (large, 5xl font)
Markdown textarea (20 rows)
Sidebar: Category selector, Cover URL input, broadcast info
Actions: Discard, Save Draft, Publish
Stats: Total Posts (124), Published (98), Drafts (12), Total Views (45.2k)

8.18 Cities (/admin/cities)
File: src/app/admin/cities/page.tsx

CRUD Operations:

Operation	How
Create	"Initialize New Zone" button opens Modal with name, state, pincode range, launch date, status
Read	DataTable with 15 mock cities
Update	"Edit" button opens Modal pre-filled
Delete	"Delete" button opens ConfirmDialog, removes from state
Toggle Status	"Suspend"/"Initialize" button toggles Active to Inactive
Stats: Active Cities, Total Labs, Bookings MTD, Coming Soon count

8.19 Onboarding (/admin/onboarding)
File: src/app/admin/onboarding/page.tsx

Features:

Kanban View (default): Drag-and-drop cards across 6 stages
List View: Compact audit list with all cards
Stages: Applied, Documents Submitted, Under Review, Approved, Live, Rejected

Drag & Drop:

Uses @dnd-kit/core + @dnd-kit/sortable
Pointer sensor with 8px activation distance
Drag overlay with rotation effect
Cards reorder within/across columns
Stage Stats: Count and average latency (days) per stage

Card Info: Lab name, city, plan badge, assigned reviewer, days since submission

8.20 API Keys (/admin/api-keys)
File: src/app/admin/api-keys/page.tsx

CRUD Operations:

Operation	How
Create	"Initialize Access Key" (PermissionGate: can_create_api_key) opens Modal
Read	DataTable with 5 mock keys
Revoke	"Ban" button (PermissionGate: can_revoke_api_key) opens ConfirmDialog
Rotate	"Rotate" button (placeholder)
Inspect	"Eye" button (placeholder)
Create Modal:

Credential designation (name)
Lab selector (6 eligible labs)
Permission checkboxes (read:bookings, write:bookings, read:reports, write:reports, read:tests)
Expiry: Never, 30 days, 90 days, 1 year
Key Reveal Modal:

One-time display of full key
Copy to clipboard button
Warning about cryptographic transience
Stats: Active Keys, API Calls Today, Failed Calls Today, Rate Limited

8.21 Reports (/admin/reports)
File: src/app/admin/reports/page.tsx

CRUD Operations:

Operation	How
Read	DataTable with 15 mock reports
Audit	"Audit Source" button opens Preview modal with PDF placeholder
Flag	"Flag Non-Compliance" button in preview modal
Verify	"Verify Document Integrity" button in preview modal
Delete	"Delete" button opens ConfirmDialog, removes from state
Preview Modal: PDF stream placeholder with document ID and size badges

Stats: Total Reports (1.2M), Reports Today (4,500), Flagged Reports (12), Storage Used (4.5 TB)

8.22 Audit Log (/admin/audit-log)
File: src/app/admin/audit-log/page.tsx

Features:

Read-only DataTable with 40 mock log entries
Purge Records: "Purge Records" button opens ConfirmDialog, clears all logs
Export: "Export Binary (CSV)" button (placeholder)
Filter: "Protocol Filters" button (placeholder)
Columns: Timestamp, Admin Actor (name + email), Action, Object Reference (type + ID), IP Address, Severity Tier

Severity Levels: Normal (text only), Warning (badge), Critical (red badge)

8.23 Data Export (/admin/data-export)
File: src/app/admin/data-export/page.tsx

Features:

8 Dataset Cards: Users, Labs, Bookings, Reports, Financials, Technicians, Reviews, Audit Log
Each card shows: icon, description, estimated records, last exported info
Export Modal (per dataset):
Format selector: CSV, Excel, JSON
Date range: From/To date inputs
Column selector: Checkboxes for each column with "Select All"
Export button with loading state then success confirmation
Export History: List of past exports with download buttons
8.24 Platform Health (/admin/platform-health)
File: src/app/admin/platform-health/page.tsx

Features:

Live Diagnostics: Auto-refreshes every 5 seconds (pausable)
7 Service Monitors: API Server, Database, File Storage (S3), Email Service, SMS Gateway, Payment Gateway, Map Service
Service Cards: Status indicator, uptime %, response time, sparkline chart
Performance Arc Gauges: API Response, DB Query Avg, File Upload Avg
Incident Logs: Error codes, service, message, count, timestamp
Job Scheduler: Scheduled jobs with status (Success/Running/Failed)
Service Detail Modal: Click any service for detailed view with event timeline
Status States: Operational (green), Degraded (amber), Down (red)

System Status Banner: All operational or critical alert based on service states

8.25 Settings (/admin/settings)
File: src/app/admin/settings/page.tsx

Features:

Metadata Section: Platform name, support email inputs
Logic Flags: Toggle switches for Home Collection, New User Registration, Maintenance Mode
Security & Access Control:
Active Sessions list with device, location, IP, time
Revoke individual sessions
"Terminate All Sessions" button
IP Allowlist toggle + textarea for IP ranges
Authentication Audit Log table (timestamp, location/IP, status)
Save Button: "Commit Infrastructure Changes" with loading state
8.26 Profile (/admin/profile)
File: src/app/admin/profile/page.tsx

Features:

Identity Card: Large avatar (initial), name, role badge, camera hover overlay
Profile Form: Name, email, phone inputs
Save Button: "Commit Entity Update" with loading state then success toast
Password Reset Section: Current password, new password, confirm password inputs
Update Button: "Update Authorization Logic" (placeholder)
9. CRUD Operations Matrix
Page	Create	Read	Update	Delete	Special Actions
Users	Modal	DataTable + Drawer	Modal	ConfirmDialog	Suspend/Reactivate
Labs	Modal	DataTable + Drawer	Modal	ConfirmDialog	3-Step Verification
Bookings	Modal	DataTable + Modal	Modal	ConfirmDialog	Refund, Reschedule
Tests	Modal	DataTable	Modal	ConfirmDialog	Toggle Active
Technicians	Modal	DataTable	Modal	ConfirmDialog	Map View (placeholder)
Financials	Modal	DataTable	Modal	ConfirmDialog	Batch Process
Refunds	Read-only	DataTable	Approve/Reject	Read-only	Partial Refund
Subscriptions	Read-only	DataTable + Cards	Plan Change	Read-only	Edit Tier Config
Coupons	Modal	DataTable	Modal	ConfirmDialog	Duplicate, Analytics
Support	Placeholder	Split View	Reply	Delete Ticket	Templates, Assign
Reviews	Read-only	DataTable + Modal	Flag/Publish	ConfirmDialog	Bulk Actions
Feedback	Read-only	Table + Charts	Read-only	Read-only	Keyword Filter
Notifications	Form	History Panel	Read-only	Delete	Multi-channel
Blog	Editor	DataTable	Editor	ConfirmDialog	Draft/Publish
Cities	Modal	DataTable	Modal	ConfirmDialog	Toggle Active
Onboarding	Button	Kanban + List	Drag & Drop	Read-only	Stage Progression
API Keys	Modal	DataTable	Rotate	Revoke	Key Reveal
Reports	Read-only	DataTable	Flag/Verify	ConfirmDialog	PDF Preview
Audit Log	Read-only	DataTable	Read-only	Purge All	Export CSV
Data Export	Export	8 Datasets	Read-only	Read-only	Format Selection
Platform Health	Read-only	Live Dashboard	Read-only	Read-only	Pause/Resume
Settings	Read-only	Form	Toggles/Inputs	Read-only	Session Revoke
Profile	Read-only	Form	Inputs	Read-only	Password Reset
10. Data Models & Mock Data
10.1 Coupon (src/data/coupons.ts)
interface Coupon {
  id: string; code: string; type: "Flat" | "Percentage"; value: number;
  minOrder: number; maxDiscount: number | null; maxUses: number;
  usedCount: number; perUserLimit: number; validFrom: string;
  validUntil: string; applicableTo: "All" | "New Users" | "Specific Lab" | "Specific Test";
  labId: string | null; testName: string | null; status: "Active" | "Expired" | "Paused";
}
10 mock coupons with realistic codes (WELCOME100, SAVE20, THYROID15, etc.)

10.2 Financial (src/data/financials.ts)
interface Transaction {
  id: string; labId: string; labName: string;
  type: "Payout" | "Commission" | "Refund" | "Adjustment";
  amount: number; date: string; status: "Completed" | "Pending" | "Failed" | "On Hold";
  paymentMethod: string; notes: string;
}

interface Refund {
  id: string; bookingId: string; patientName: string; labName: string;
  amount: number; reason: string; paymentMethod: "UPI" | "Card" | "NetBanking" | "Wallet";
  status: "Pending" | "Approved" | "Rejected" | "Partial";
  requestedAt: string; resolvedAt: string | null; adminNotes: string; partialAmount: number | null;
}
40 mock transactions + 20 mock refunds

10.3 Review (src/data/reviews.ts)
interface Review {
  id: string; patientId: string; patientName: string;
  labId: string; labName: string; bookingId: string; testName: string;
  rating: number; npsScore: number; text: string; date: string;
  status: "Published" | "Flagged" | "Removed";
  sentiment: "Positive" | "Neutral" | "Negative";
}
20 mock reviews with realistic Indian names and detailed review text

10.4 Other Data Files
support.ts: SupportTicket interface with messages, channels, assignees
technicians.ts: Technician data with ratings, collections
users.ts: User data with avatars, blood groups
labs.ts: Lab data with plans, certifications
bookings.ts: Booking data with statuses, types
notifications.ts: Notification templates and history
11. State Management
11.1 AdminContext (src/contexts/AdminContext.tsx)
Global context providing:

role: Current admin role (default: "superadmin")
setRole: Role changer
name: Admin name ("Super Admin")
email: Admin email ("admin@meddynet.com")
theme: "light" | "dark" (persisted to localStorage)
setTheme: Theme changer (updates localStorage + DOM class)
can(action): Permission check via hasPermission()
canVisit(route): Route access check via canAccessRoute()
11.2 Component-Level State
All pages use React useState for local state management:

Form state (controlled inputs)
Modal open/close state
Data arrays (CRUD operations)
Filter/tab state
Loading/error state
11.3 URL State
DataTable syncs search and pagination to URL query params:

?search=term — current search filter
?page=N — current page number
12. Styling & Theming
12.1 CSS Variables
The application uses CSS custom properties for theming:

--primary-color / --primary-rgb: Primary brand color (#00A86B)
--card-bg: Card background
--surface: Surface/background color
--main-text: Primary text color
--muted-text: Secondary text color
--border-color: Border color
12.2 Dark Mode
Toggled via topbar button
Persists to localStorage as admin-theme
Applies dark class to <html> element
All components use dark: Tailwind variants
12.3 Tailwind Configuration
Custom color palette with semantic names (primary, accent, surface, card)
Custom border styles (border-dim, border-bright)
Custom shadows (shadow-glow)
Custom scrollbar utilities (scrollbar-custom)
Animation utilities (animate-in, fade-in, zoom-in)
13. Routing & Navigation
13.1 Route Structure
All routes follow /admin/[feature] pattern:

/admin/overview          Dashboard
/admin/analytics         Analytics
/admin/users             User management
/admin/labs              Lab management
/admin/bookings          Booking management
/admin/tests             Test catalog
/admin/technicians       Technician fleet
/admin/financials        Financial management
/admin/refunds           Refund processing
/admin/subscriptions     Subscription tiers
/admin/coupons           Coupon management
/admin/support           Support tickets
/admin/reviews           Review moderation
/admin/feedback          NPS and feedback
/admin/notifications     Notifications
/admin/blog              Blog management
/admin/cities            City/zone management
/admin/onboarding        Lab onboarding
/admin/api-keys          API key management
/admin/reports           Report auditing
/admin/audit-log         Audit log
/admin/data-export       Data export
/admin/platform-health   System health
/admin/settings          System settings
/admin/profile           Admin profile
/admin/login             Login (excluded from auth guard)
13.2 Navigation Features
Sidebar: Collapsible groups, active route highlighting, badge counts
Breadcrumbs: Auto-generated from URL path
Command Palette: Ctrl+K global search (25+ commands)
Quick Actions: Dashboard shortcuts to high-priority pages
14. Key Libraries
Library	Purpose
next	Framework, routing, rendering
react	UI library, hooks
typescript	Type safety
tailwindcss	Utility-first CSS
framer-motion	Animations (modals, drawers, transitions)
recharts	Charts (line, bar, area, pie)
lucide-react	Icon library (100+ icons used)
@dnd-kit/core	Drag and drop core
@dnd-kit/sortable	Sortable list primitives
clsx	Conditional class names
eslint	Code linting
Appendix: Permission Matrix
Permission	superadmin	operations	finance	support	content
can_delete_user	Yes				
can_ban_user	Yes	Yes			
can_verify_lab	Yes	Yes			
can_approve_payout	Yes		Yes		
can_approve_refund	Yes		Yes		
can_reject_refund	Yes		Yes		
can_create_coupon	Yes		Yes		
can_publish_review	Yes	Yes			
can_flag_review	Yes	Yes		Yes	
can_remove_review	Yes				
can_create_api_key	Yes				
can_revoke_api_key	Yes				
can_close_ticket	Yes	Yes		Yes	
can_assign_ticket	Yes	Yes		Yes	
can_publish_blog	Yes				Yes
can_send_notification	Yes				Yes
can_export_data	Yes		Yes		
can_manage_cities	Yes	Yes			
can_view_audit_log	Yes				
Documentation generated for MeddyNet Admin Dashboard v0.1.0 Total pages: 25 | Total components: 12 | Total data models: 8+