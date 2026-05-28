# MeddyNet: Pending Architecture & Features Deep Analysis
**Status Date:** May 17, 2026

While the Core Architecture (Auth, Bookings, Labs, Payments, Technicians, Users) is 100% built, secure, and production-ready, several peripheral marketing and expansion features exist only as UI designs in the Admin Portal or as conceptual requirements in the System Architecture (PRD) documents.

This document outlines the precise backend logic, database models, and API integrations pending to achieve 100% full-stack functionality across all 45 screens and PRD requirements.

---

## 1. Subscription & Health Plans Engine (Critical PRD Gap)
**UI Location:** `/admin/subscriptions`
* **Current State:** The Admin UI beautifully displays health plans, but relies entirely on static `mockSubs` data. The PRD explicitly demands "Lab Subscription Plans (Basic, Advanced, Premium)" and "Preventive health subscriptions for users."
* **Missing Backend:** No `Subscription` table exists in the SQLAlchemy models. No `routers/subscriptions.py` API exists.
* **Required Build:** 
  * A backend engine to handle recurring billing (via Razorpay Subscriptions API).
  * Tiered access controls (Basic/Advanced/Premium) granting labs priority search ranking and advanced analytics.
  * CRON jobs or Celery tasks to track plan expiries.
  * Linking active subscription tiers to the `User` model to automatically apply benefits (like free home collections).

## 2. Coupon & Promo Code System
**UI Location:** `/admin/coupons`
* **Current State:** The Admin UI has a Coupons page showing `mockRedemptions`.
* **Missing Backend:** No `Coupon` database model. No API endpoint to validate and apply promo codes.
* **Required Build:** 
  * Create `routers/coupons.py` allowing Superadmins to generate codes (e.g., "FLAT50").
  * Implement logic for usage limits, expiry dates, and percentage vs. flat discount logic.
  * Integrate the validation logic into the Patient App checkout flow (`bookings.py` & `payments.py`).

## 3. Global Master Test Catalog
**UI Location:** `/admin/tests`
* **Current State:** The Admin portal uses `mockTests` to show the master list of all medical tests.
* **Missing Backend:** Individual Labs can add tests, but there is no Global Admin API to standardize Master Tests across the platform.
* **Required Build:** 
  * A global `MasterTest` model.
  * CRUD APIs allowing admins to standardize medical nomenclature (e.g., forcing all labs to map to "Complete Blood Count (CBC)" rather than custom variations) and establish baseline platform pricing limits.

## 4. Geographical & Zone Operations
**UI Location:** `/admin/cities`
* **Current State:** The UI shows operational cities using `mockCities`. The backend simply accepts strings for locations.
* **Missing Backend:** There is no strict database schema for "Active Cities" or "Serviceable Pincodes."
* **Required Build:** 
  * A dynamic `City` and `Zone` API where admins can strictly "Turn On" or "Turn Off" MeddyNet operations in specific regions. This is critical to prevent users from booking tests in unserviceable remote locations.

## 5. Content Management System (Blog)
**UI Location:** `/admin/blog`
* **Current State:** A rich blog management page exists in the Admin UI with `mockPosts`.
* **Missing Backend:** MeddyNet lacks a backend CMS. There is no `Blog` model and no `blog.py` router.
* **Required Build:** 
  * Basic CRUD endpoints for publishing health articles.
  * Integration with Cloudinary for article thumbnails.
  * Public endpoints for the Patient App to fetch and read articles.

## 6. Background Data Export Engine
**UI Location:** `/admin/data-export`
* **Current State:** Admin UI has a data export panel with `mockHistory`.
* **Missing Backend:** Attempting to download 10,000+ booking records synchronously will crash the API or cause timeouts.
* **Required Build:** 
  * An asynchronous Celery task (`export_tasks.py`).
  * Logic to generate large CSV/Excel files in the background and stream the download link securely to the admin via email or notification.

## 7. Reports Auditing Hook Connection
**UI Location:** `/admin/reports`
* **Current State:** The backend *does* have a fully functioning `reports.py` system (connected to the PDF engine), but the Admin Portal is still visually using `mockReports` arrays.
* **Required Build:** 
  * No backend work needed. We just need to write the `useAdminReports()` TanStack hook in `admin.meddynet/src/lib/hooks.ts` to connect the existing backend API to the Admin UI.

## 8. Mobile Push Notifications (Firebase FCM)
* **Current State:** The backend currently sends SMS notifications (via MSG91/Authkey) and WhatsApp updates.
* **PRD Requirement:** The PRD explicitly mentions Push Notifications across the 4 apps.
* **Required Build:** 
  * Integration with Firebase Cloud Messaging (FCM).
  * Endpoints to register device tokens from the Next.js PWA frontends.
  * Updating `notification_service.py` to dispatch push events alongside SMS.

## 9. MongoDB Analytics Pipeline
* **Current State:** MongoDB is configured and handling audit logs. However, the PRD mandates deep analytics such as tracking every user search query, lab impressions, and funnel drop-offs.
* **Required Build:** 
  * Expand the MongoDB logging middleware to asynchronously write `search_logs` and `lab_daily_stats` events without blocking the main FastAPI thread.
  * Build the aggregation pipelines required to feed the Admin Analytics Dashboard.

---
### 💡 Strategic Recommendation for Next Steps
To align the platform with the core monetization strategy outlined in the PRD, it is highly recommended to build the **Subscription & Health Plans Engine** and the **Coupon System** first. These features bridge the gap between the functional booking system and the platform's revenue generation model.
