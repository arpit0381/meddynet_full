# MeddyNet Admin Dashboard

The central administrative portal and control center for the MeddyNet healthcare platform. This developer-first dashboard is designed for high-density information management and operational oversight.

## Tech Stack
* **Framework:** Next.js 15+ (App Router)
* **Library:** React 19
* **Language:** TypeScript
* **Styling:** Tailwind CSS v4
* **Icons:** Lucide React
* **Charts:** Recharts
* **Animations:** Framer Motion

## Features
- **Comprehensive Layout:** Sticky responsive sidebar, global search topbar, and robust data table structures.
- **Robust UI Primitives:** Accessible SlideOver Drawers, Modals, Confirm Dialogs, and Toast alerts.
- **Core Pages:**
  - Login Authentication Mock
  - High-density Overview & Financials Dashboards with integrated graphing
  - Users, Labs, and Technician fleet management tables
  - Advanced Bookings & Subscriptions tracking
  - Centralized Support & Notifications composer interfaces
  - Read-only encrypted System Audit Log

## Getting Started
First, install the dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application root automatically redirects to `/admin/login`.
