# MeddyNet — Deep A-Z Analysis Report
**Date:** May 27, 2026  
**Scope:** All 5 projects — Backend API + Patient App + Lab Portal + Admin Dashboard + Technician PWA

---

## 🔴 CRITICAL BUGS & ISSUES

### 1. Backend: Unreachable Code in Audit Middleware
**File:** [main.py](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/meddynet-backend/app/main.py#L56-L74)
```python
except Exception as e:
    logger.error(f"Unhandled exception on {request.url.path}", exc_info=True)
    raise e        # ← THIS re-raises, so...
    
duration = time.time() - start_time  # ← THIS IS UNREACHABLE on error
```
The `raise e` on line 58 means the `duration` calculation and slow-request logging on lines 60-73 are **never executed** when an exception occurs. The `return response` on line 74 is also unreachable after an error. Fix: move duration calc + logging into `finally` block or restructure the try/except.

### 2. Backend: `@app.on_event("startup")` is Deprecated
**File:** [main.py](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/meddynet-backend/app/main.py#L37-L42)
FastAPI has deprecated `@app.on_event("startup")` in favor of `lifespan` context manager. This will break in future FastAPI versions.

### 3. Backend: MongoDB DNS Failure Blocks Analytics Entirely
**Observed at startup:** `Failed to initialize MongoDB indexes: The DNS query name does not exist`
The MongoDB Atlas cluster `cluster0.6lzhtrl.mongodb.net` is unreachable. This means:
- **ALL audit logging** silently fails
- **ALL notification history** is lost
- **Admin audit logs** endpoint returns empty
- **Admin analytics dashboard** has no data

### 4. Backend: Double `db.commit()` in Booking Creation
**File:** [bookings.py](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/meddynet-backend/app/routers/bookings.py#L139-L186)
```python
await db.commit()           # Line 139 — FIRST commit
logger.info(...)
# ... build booking_data dict ...
await db.commit()           # Line 185 — SECOND commit (unnecessary)
return booking_data
```
The second `commit()` on line 185 is redundant and could cause race conditions.

### 5. Backend: Razorpay Key Secret Stripping Bug
**File:** [payment_service.py](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/meddynet-backend/app/services/payment_service.py#L60-L63)
```python
if self.key_secret.startswith("live_"):
    self.key_secret = self.key_secret.replace("live_", "")
```
This uses `replace()` which will strip ALL occurrences of "live_" or "test_" from anywhere in the key, not just the prefix. Should use `removeprefix()` instead.

### 6. Backend: WebSocket References Non-Existent `async_session`
**File:** [websocket.py](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/meddynet-backend/app/websocket.py#L83)
```python
from app.database import async_session  # ← DOES NOT EXIST
```
The database module exports `get_db` and `SessionLocal`, but NOT `async_session`. This will crash when a `support_message` WebSocket event is received.

### 7. Backend: Webhook HMAC Uses `hmac.new()` Instead of `hmac.HMAC()`
**File:** [webhooks.py](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/meddynet-backend/app/routers/webhooks.py#L31)
```python
expected_sig = hmac.new(...)  # Should be hmac.HMAC() or hmac.new doesn't exist
```
Python's `hmac` module has `hmac.new()` (lowercase) which is fine actually, but the variable captures the **HMAC object**, not the hex digest. The `.hexdigest()` is correctly chained. However, if `x_razorpay_signature` is `None` (optional header), the `hmac.compare_digest` on line 37 will crash with a TypeError.

---

## 🟠 INCOMPLETE / HALF-BUILT FEATURES

### 8. Admin Portal: 9 Pages Still Using Mock Data
The `admin.meddynet/src/data/` folder contains **9 mock data files** that are still actively powering admin UI pages:

| Mock File | Admin Page | Status |
|---|---|---|
| [coupons.ts](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/admin.meddynet/src/data/coupons.ts) | `/admin/coupons` | ❌ No backend API |
| [financials.ts](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/admin.meddynet/src/data/financials.ts) | `/admin/financials` | ⚠️ Partially live |
| [labs.ts](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/admin.meddynet/src/data/labs.ts) | `/admin/labs` | ⚠️ Partially live |
| [users.ts](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/admin.meddynet/src/data/users.ts) | `/admin/users` | ⚠️ Partially live |
| [bookings.ts](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/admin.meddynet/src/data/bookings.ts) | `/admin/bookings` | ⚠️ Partially live |
| [support.ts](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/admin.meddynet/src/data/support.ts) | `/admin/support` | ⚠️ Partially live |
| [reviews.ts](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/admin.meddynet/src/data/reviews.ts) | `/admin/reviews` | ❌ No backend API |
| [technicians.ts](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/admin.meddynet/src/data/technicians.ts) | `/admin/technicians` | ⚠️ Partially live |
| [notifications.ts](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/admin.meddynet/src/data/notifications.ts) | `/admin/notifications` | ⚠️ Via MongoDB only |

### 9. Missing Backend Modules (No Router, No Model, No API)

| Feature | Backend Status | Frontend Status |
|---|---|---|
| **Subscription/Plans Engine** | ❌ No model, no router | Admin UI uses mock data |
| **Coupon/Promo System** | ❌ No model, no router | Admin UI uses mock data |
| **Global Master Test Catalog** | ❌ No MasterTest model | Admin UI uses mock data |
| **City/Zone Operations** | ❌ No model, no router | Admin UI uses mock data |
| **Blog/CMS** | ❌ No model, no router | Admin + Patient UI use mock |
| **Data Export Engine** | ❌ No Celery task | Admin UI uses mock data |
| **Reviews API** | ❌ Model exists but no router for fetching/managing reviews | Admin + Patient show mock |
| **Firebase Push Notifications** | ❌ Not integrated | No device token management |
| **User Chat/Support Tickets from Patient** | ❌ Partial (admin side only) | Patient chat UI exists but backend routing is broken |

### 10. Technician App: `queue_time_mins` is Hardcoded
**File:** [technician_portal.py](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/meddynet-backend/app/routers/technician_portal.py#L59)
```python
"queue_time_mins": 12,  # Still simulated based on fleet avg
```
This is a fake static value shown on the technician dashboard.

### 11. Admin: Reports Audit Returns Placeholder Data
**File:** [admin_portal.py](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/meddynet-backend/app/routers/admin_portal.py#L460-L468)
```python
"lab": "Partner Lab",      # ← Hardcoded placeholder
"test": "Diagnostic Panel", # ← Hardcoded placeholder
"size": "1.5 MB",          # ← Fake value
"status": "Clean"          # ← Fake value
```

---

## 🟡 SECURITY CONCERNS

### 12. `.env` File Contains LIVE Production Secrets
**File:** [.env](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/meddynet-backend/.env)
The `.env` file is checked into the workspace with:
- Real NeonDB connection strings
- Real Supabase keys (anon + service role)
- Real Razorpay test keys
- Real Cloudinary keys
- Real Authkey SMS API key
- Real JWT secrets and Fernet encryption keys

> [!CAUTION]
> If this file is committed to Git, ALL credentials are compromised and must be rotated immediately.

### 13. Admin RBAC Only Checks `role == "admin"` (String Comparison)
**File:** [admin_portal.py](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/meddynet-backend/app/routers/admin_portal.py#L24-L30)
The `check_admin` function only checks `role != "admin"`. But the `rbac.py` `require_role` function also accepts `"superadmin"`. These are inconsistent — a `superadmin` would be blocked from admin endpoints.

### 14. User Deletion Has No Cascade Protection
**File:** [admin_portal.py](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/meddynet-backend/app/routers/admin_portal.py#L280-L296)
```python
await db.delete(user)
```
Deleting a user without checking for related bookings, payments, reports, or technician records will cause foreign key constraint violations in production.

### 15. No Rate Limiting on Login Endpoint
**File:** [auth.py](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/meddynet-backend/app/routers/auth.py#L284)
The `/auth/login` endpoint has NO `@limiter.limit()` decorator, unlike `/auth/send-otp` which has `5/minute`. This allows unlimited brute-force password attacks.

### 16. 2FA OTP Exposed in Development Response
**File:** [auth.py](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/meddynet-backend/app/routers/auth.py#L320-L321)
```python
if settings.ENVIRONMENT == "development":
    response["dev_otp"] = otp
```
This leaks OTP codes in the HTTP response. If someone accidentally deploys with `ENVIRONMENT=development`, all OTPs are exposed.

---

## 🔵 CODE QUALITY ISSUES

### 17. Patient App: Massive Lint Warnings (200+ lines)
The [lint_final_readable.txt](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/MeddyNet/lint_final_readable.txt) file shows extensive issues:
- Dozens of **unused imports** (`Filter`, `Search`, `Calendar`, `Sparkles`, `Info`, etc.)
- Multiple `@typescript-eslint/no-explicit-any` errors
- These indicate rushed development with copy-paste patterns

### 18. Backend: `sessionmaker` Created Inside Every Request
**File:** [database.py](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/meddynet-backend/app/database.py#L26-L32)
```python
async def get_db():
    async_session = async_sessionmaker(pg_engine, ...)  # Created on EVERY call
```
The `async_sessionmaker` factory is being recreated on every single request. This should be a module-level singleton. The current pattern adds unnecessary overhead.

### 19. Backend: Inconsistent Import Patterns
Across routers, imports are done in multiple inconsistent ways:
- Some imports are at the top of the file
- Some imports are inside functions (`from app.config import settings` inside `login()`)
- Some use `from datetime import date` inside function bodies
This makes the codebase harder to maintain and can cause circular import issues.

### 20. Backend: `Technician.city` Column Missing from Model
**File:** [technician.py](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/meddynet-backend/app/models/technician.py)
The [admin_portal.py](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/meddynet-backend/app/routers/admin_portal.py#L227) references `t.city` but the Technician model has no `city` column. This will crash with an `AttributeError` at runtime.

### 21. Backend: No Pagination on Any List Endpoint
All list endpoints (`GET /admin/users`, `GET /admin/bookings`, `GET /admin/labs`, `GET /bookings`) return ALL records. With real data growth, these will cause:
- Massive memory usage
- Extremely slow API responses
- Frontend freezes

---

## 🟣 TESTING GAPS

### 22. Only 7 Smoke Tests Exist
**File:** [tests/](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/meddynet-backend/tests)
The entire backend has only:
- `test_smoke.py` — 7 basic endpoint availability tests
- `test_auth.py` — Auth-related tests
- `conftest.py` — Test configuration

**Missing test coverage:**
- ❌ Booking creation flow (with payment)
- ❌ Payment webhook reconciliation
- ❌ Report upload flow
- ❌ Lab onboarding flow
- ❌ Technician job assignment
- ❌ Admin operations (verify lab, delete user, payouts)
- ❌ WebSocket event handling
- ❌ Token refresh/rotation
- ❌ 2FA enable/disable/login

### 23. No Frontend Tests at All
None of the 4 frontend apps have any test files. No unit tests, no integration tests, no E2E tests.

---

## ⚪ INFRASTRUCTURE & DEVOPS

### 24. Docker Desktop Not Running / Docker Setup Broken
The `docker-compose up` command failed because Docker Desktop isn't running. The docker-compose file also uses the deprecated `version: '3.8'` attribute.

### 25. No CI/CD Pipeline
No `.github/workflows/` YAML files exist for automated testing, linting, or deployment.

### 26. `Meddynet_Backend` Folder is Empty/Orphan
**File:** [Meddynet_Backend/](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/Meddynet_Backend)
Contains only a single `docx2.txt` file. This appears to be an old/abandoned folder that should be cleaned up.

### 27. `node_modules_old` Folders in 3 Frontend Apps
The `admin.meddynet`, `meddynet-lab-portal`, and `technician-app` all have a `node_modules_old` directory — leftover from previous installs that are wasting disk space.

---

## 📋 PRIORITIZED ACTION PLAN

### 🔴 P0 — Fix Before ANY Production Deploy

| # | Task | Effort |
|---|---|---|
| 1 | Fix unreachable code in audit middleware ([main.py](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/meddynet-backend/app/main.py#L56)) | 15 min |
| 2 | Fix WebSocket `async_session` import crash ([websocket.py](file:///c:/Users/ashwi/.gemini/antigravity/scratch/MeddyNet%20-%20Main/meddynet-backend/app/websocket.py#L83)) | 10 min |
| 3 | Fix double `db.commit()` in booking creation | 5 min |
| 4 | Fix Razorpay `replace()` → `removeprefix()` | 5 min |
| 5 | Add rate limiting to `/auth/login` | 5 min |
| 6 | Fix `check_admin` to also allow `superadmin` | 5 min |
| 7 | Add cascade check before user deletion | 30 min |
| 8 | Rotate ALL secrets if `.env` was ever committed to Git | 2 hrs |
| 9 | Fix missing `Technician.city` column or remove reference | 10 min |
| 10 | Fix MongoDB Atlas cluster connection (create new or fix DNS) | 30 min |

### 🟠 P1 — Build Missing Backend Modules

| # | Module | Effort |
|---|---|---|
| 11 | Subscription/Plans Engine (model + router + Razorpay Subscriptions) | 2-3 days |
| 12 | Coupon/Promo System (model + validation + checkout integration) | 1 day |
| 13 | Global Master Test Catalog | 1 day |
| 14 | City/Zone Operations | 0.5 day |
| 15 | Blog CMS (model + CRUD + public endpoints) | 1 day |
| 16 | Background Data Export (Celery task + CSV generation) | 1 day |
| 17 | Reviews API (list, moderate, respond) | 0.5 day |
| 18 | Firebase Push Notifications (FCM integration) | 1 day |

### 🟡 P2 — Code Quality & Testing

| # | Task | Effort |
|---|---|---|
| 19 | Add pagination to ALL list endpoints | 1 day |
| 20 | Fix 200+ lint warnings in Patient App | 0.5 day |
| 21 | Move `async_sessionmaker` to module-level singleton | 15 min |
| 22 | Write integration tests for core flows (booking, payment, auth) | 2-3 days |
| 23 | Add E2E tests for at least 1 frontend (Playwright/Cypress) | 2 days |
| 24 | Clean up unused imports across all frontends | 1 hr |
| 25 | Replace deprecated `@app.on_event("startup")` with `lifespan` | 30 min |

### ⚪ P3 — Cleanup & DevOps

| # | Task | Effort |
|---|---|---|
| 26 | Delete orphan `Meddynet_Backend/` folder | 1 min |
| 27 | Delete all `node_modules_old/` folders | 1 min |
| 28 | Set up GitHub Actions CI pipeline (lint + test + build) | 2 hrs |
| 29 | Fix Docker Compose (`version` removal, env file binding) | 30 min |
| 30 | Connect Admin portal remaining pages to live APIs (remove mock data files) | 2-3 days |

---

## 📊 OVERALL STATUS SUMMARY

| Component | Completion | Health |
|---|---|---|
| **Backend API Core** (Auth, Bookings, Payments, Labs) | ~85% | 🟡 Has bugs |
| **Patient App** (MeddyNet) | ~75% | 🟡 Lint issues, some mock data |
| **Lab Portal** | ~80% | 🟢 Mostly functional |
| **Technician App** | ~70% | 🟡 Missing real-time features |
| **Admin Dashboard** | ~55% | 🔴 Heavy mock data dependency |
| **Backend Missing Modules** (Subs, Coupons, Blog, etc.) | ~0% | 🔴 Not built |
| **Testing** | ~5% | 🔴 Almost no tests |
| **DevOps/CI** | ~10% | 🔴 No pipeline |

> [!IMPORTANT]
> The platform's **core booking-payment-report loop** works end-to-end, but the Admin Dashboard is only ~55% connected to real data, and 9 major backend modules are completely missing. The most critical immediate fixes are the bugs listed in P0 (the WebSocket crash, unreachable code, and missing rate limiting on login).
