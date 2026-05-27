# MEDDYNET
**Complete Backend Architecture & Developer Documentation**
Version 1.0.0  •  FastAPI + NeonDB + Supabase + Razorpay + Redis
April 2026
api.meddynet.com

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [Database Schema (NeonDB / PostgreSQL)](#5-database-schema-neondb--postgresql)
6. [API Reference — All Endpoints](#6-api-reference--all-endpoints)
7. [Payment & Wallet System](#7-payment--wallet-system)
8. [Real-Time Layer (WebSocket)](#8-real-time-layer-websocket)
9. [Background Jobs (Celery + Redis)](#9-background-jobs-celery--redis)
10. [File Storage (Supabase)](#10-file-storage-supabase)
11. [Analytics Layer (MongoDB)](#11-analytics-layer-mongodb)
12. [Environment Variables](#12-environment-variables)
13. [Setup & Installation](#13-setup--installation)
14. [Deployment Architecture](#14-deployment-architecture)
15. [Security Checklist](#15-security-checklist)
16. [Scalability Roadmap](#16-scalability-roadmap)

---

## 1. SYSTEM OVERVIEW
MeddyNet is a diagnostic lab discovery, booking, and logistics platform. The backend serves four distinct frontend applications — User App, Lab Partner Portal, Technician PWA, and Admin Dashboard — over a single FastAPI REST API, with a dedicated WebSocket server for real-time events.

### Architecture at a Glance
| Layer | Technology | Role |
|---|---|---|
| Client | 4x Next.js 16 apps | User, Lab, Technician, Admin frontends |
| CDN / Security | Cloudflare | DDoS, WAF, SSL termination, rate limiting |
| API Gateway | FastAPI (Python 3.12) | All REST endpoints — api.meddynet.com/v1 |
| Primary DB | NeonDB (PostgreSQL) | Core relational data — bookings, users, labs |
| Auth | Supabase Auth | OTP login, JWT sessions, refresh tokens |
| Payments | Razorpay | Orders, verification, refunds, payouts |
| File Storage | Supabase Storage | PDF reports, prescriptions, lab images |
| Cache / Queue | Redis (Upstash) | API caching, Celery job queue, pub/sub |
| Analytics / Logs | MongoDB Atlas | Audit logs, event analytics, notification history |
| Real-time | WebSocket (FastAPI) | Location updates, job dispatch, notifications |
| Background Jobs | Celery + Redis | Payouts, OTP retry, reminders, report delivery |

### The Four Frontend Consumers
| App | Primary Users | Key API Modules |
|---|---|---|
| User App (meddynet.com) | Patients | auth, labs, tests, bookings, reports, payments, notifications |
| Lab Partner Portal | Lab admins | auth, labs, bookings, technicians, reports, earnings, profile |
| Technician PWA | Phlebotomists | auth, jobs, technicians, checklist, location |
| Admin Dashboard | Internal team | admin/*, analytics, all modules (superadmin JWT) |

---

## 2. TECH STACK
| Package | Version | Purpose |
|---|---|---|
| fastapi | ^0.115 | ASGI framework for all REST and WebSocket routes |
| uvicorn | ^0.30 | ASGI server (Gunicorn in prod with multiple workers) |
| python | 3.12 | Core language |
| sqlalchemy | ^2.0 | ORM for PostgreSQL (async with asyncpg) |
| asyncpg | ^0.29 | Async PostgreSQL driver for NeonDB |
| alembic | ^1.13 | Database migrations |
| pydantic | v2 | Request/response validation, settings management |
| python-jose | ^3.3 | JWT encoding/decoding (HS256) |
| supabase-py | ^2.4 | Supabase Python SDK — OTP trigger, verify, and File Storage |
| razorpay | ^1.4 | Razorpay Python SDK — orders, refunds, payouts |
| redis | ^5.0 | Redis client for caching and Celery broker |
| celery | ^5.4 | Distributed task queue for background jobs |
| motor | ^3.4 | Async MongoDB driver for analytics/logs |
| httpx | ^0.27 | Async HTTP client for external API calls |
| python-multipart | ^0.0.9 | File upload handling |
| slowapi | ^0.1 | Rate limiting middleware for FastAPI |
| python-dotenv | ^1.0 | Environment variable management |

---

## 3. PROJECT STRUCTURE
```
meddynet-backend/
├── app/
│   ├── main.py              # FastAPI app factory, middleware, routers
│   ├── config.py            # Settings (pydantic BaseSettings, .env)
│   ├── database.py          # SQLAlchemy async engine + session factory
│   ├── websocket.py         # WebSocket server + Redis pub/sub
│   │
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── ...              # Models identical to below schemas
│   │   ├── payment.py       # Payment, LabWallet, Ledger, Payout
│   │   ├── report.py        # Report (using supabase storage urls)
│   │   └── review.py        # Review
│   │
... (Structure standard) ...
```

---

## 4. AUTHENTICATION & AUTHORIZATION
MeddyNet uses phone-number OTP login via Supabase Auth.

---

## 5. DATABASE SCHEMA (NEONDB / POSTGRESQL)
All monetary amounts are stored in paise (INR x 100) to avoid floating-point errors.

### reports
| Column | Type | Notes |
|---|---|---|
| id | UUID | PRIMARY KEY |
| booking_id | UUID | FK → bookings.id |
| lab_id | UUID | FK → labs.id |
| uploaded_by_tech_id | UUID | FK → technicians.id NULLABLE |
| supabase_url | TEXT | Secure Supabase File URL |
| supabase_file_path | VARCHAR(200) | For deletion/replacement internally |
| file_size_bytes | INT | File size |
| is_abnormal | BOOLEAN | TRUE if any parameter is out of range |
| uploaded_at | TIMESTAMPTZ | DEFAULT NOW() |
| notified_at | TIMESTAMPTZ | When patient was notified — NULLABLE |

---

## 10. FILE STORAGE (SUPABASE)
All diagnostic report PDFs, prescription images, and lab profile images are stored exclusively in **Supabase Storage**. Direct client uploads are not allowed — all files go through the FastAPI backend to ensure RBAC rules apply.

### Upload Flow
```python
# report_service.py
from supabase import create_client
import uuid

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async def upload_report_to_supabase(file: UploadFile, booking_id: str, lab_id: str):
    contents = await file.read()
    file_path = f"reports/{lab_id}/{booking_id}_{uuid.uuid4().hex[:8]}.pdf"
    
    response = supabase.storage.from_("meddynet-storage").upload(
        file=contents,
        path=file_path,
        file_options={"content-type": file.content_type}
    )
    
    # Store path for local mapping
    return {
        "file_path": file_path,
        "secure_url": f"{SUPABASE_URL}/storage/v1/object/public/meddynet-storage/{file_path}",
        "bytes": len(contents)
    }
```

### Folder Structure in Supabase Storage
• `reports/{lab_id}/{booking_id}.pdf` — diagnostic reports
• `prescriptions/{user_id}/{timestamp}.jpg` — patient prescriptions
• `labs/{lab_id}/profile.jpg` — lab profile images
• `labs/{lab_id}/certificates/{cert_name}.pdf` — NABL/ISO certificates

---

## 12. ENVIRONMENT VARIABLES
See `.env.example`. Requires variables for: **NeonDB**, **Supabase**, **Razorpay**, **Redis**, **MongoDB**, **MSG91**.

| Variable | Required | Description |
|---|---|---|
| DATABASE_URL | Yes | NeonDB connection |
| SUPABASE_URL | Yes | Supabase project URL |
| SUPABASE_SERVICE_KEY | Yes | Supabase service key for Supabase Storage |
| RAZORPAY_KEY... | Yes | Payment Secrets |

<Remainder matching the standard framework.>
