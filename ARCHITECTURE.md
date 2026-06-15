# Architecture — ACME Salary Management System

## Overview

Three-layer architecture: Next.js frontend → FastAPI backend → SQLite database.

The system is intentionally simple. The goal is to replace Excel, not build an HRIS. Every architectural decision optimizes for correctness, speed of delivery, and a clean foundation for v2.

---

## Layers

```
┌─────────────────────────────────────────────────┐
│           Browser — Next.js (React)              │
│  ┌───────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ Employee  │ │  Salary  │ │   Analytics    │  │
│  │  Table    │ │   Form   │ │   Dashboard    │  │
│  └───────────┘ └──────────┘ └────────────────┘  │
└────────────────────┬────────────────────────────┘
                     │ REST / JSON
┌────────────────────▼────────────────────────────┐
│           Backend — Python + FastAPI             │
│  ┌────────────┐ ┌──────────────┐ ┌───────────┐  │
│  │ API Router │→│Business Logic│→│Data Access│  │
│  └────────────┘ └──────────────┘ └───────────┘  │
└────────────────────┬────────────────────────────┘
                     │ SQLAlchemy ORM
┌────────────────────▼────────────────────────────┐
│              Database — SQLite                   │
│  ┌───────────────────┐  ┌─────────────────────┐ │
│  │     employees     │→ │  salary_audit_log   │ │
│  └───────────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## Key Design Decisions

### Why FastAPI over Django/Flask?
FastAPI gives us automatic OpenAPI docs, async support, and Pydantic validation with minimal boilerplate. For a REST API serving structured data, it's the cleanest choice. Django is too heavy; Flask requires too much manual wiring.

### Why SQLite?
No infrastructure overhead. The schema is PostgreSQL-compatible — migrating is a one-line change to `DATABASE_URL`. For a single HR Manager use case, SQLite handles 10,000 rows with sub-100ms queries trivially.

### Why SQLAlchemy ORM?
Industry standard. Clean model definitions, easy migrations via Alembic if needed in v2, and it abstracts the DB engine so switching to Postgres is seamless.

### Why Next.js App Router over plain React?
Server-side rendering for fast initial load. App Router gives clean layout nesting (nav stays mounted, only page content re-renders). The analytics page especially benefits from SSR since data doesn't change per user.

### Why shadcn/ui?
Accessible, composable, unstyled at the base — we control the design entirely via Tailwind. Unlike MUI or Chakra, it doesn't impose a design system that fights with custom styles.

### Why no auth in v1?
Single user persona (HR Manager). Adding auth would mean JWT, refresh tokens, session management, and password resets — none of which add value for one user. v2 can add RBAC when Finance or department heads need access.

### Why soft deletes only?
Salary data is financial data. Hard deletes create compliance risk and break audit trails. Every employee is deactivated, never deleted, and the full history is preserved.

---

## Data Model

### `employees`
```sql
id              TEXT PRIMARY KEY        -- UUID
employee_id     TEXT UNIQUE NOT NULL    -- EMP-00001 format
first_name      TEXT NOT NULL
last_name       TEXT NOT NULL
email           TEXT UNIQUE NOT NULL
department      TEXT NOT NULL
job_title       TEXT NOT NULL
country         TEXT NOT NULL
currency        TEXT NOT NULL           -- ISO 4217 (auto-set from country)
base_salary     REAL NOT NULL           -- CHECK > 0
employment_type TEXT NOT NULL           -- full_time | part_time | contractor
status          TEXT DEFAULT 'active'   -- active | inactive
created_at      DATETIME
updated_at      DATETIME
```

### `salary_audit_log`
```sql
id              INTEGER PRIMARY KEY AUTOINCREMENT
employee_id     TEXT REFERENCES employees(id)
field_changed   TEXT NOT NULL
old_value       TEXT
new_value       TEXT
changed_by      TEXT DEFAULT 'HR Manager'
changed_at      DATETIME
```

---

## API Design

REST over GraphQL — simpler, better tooling, easier to cache. All responses are JSON. Pagination uses page/page_size query params (not cursor-based) because the HR Manager browses, not infinite-scrolls.

Export is a streaming CSV response — no temp files, no S3, just a direct download.

---

## Performance Considerations

- 10,000 rows with pagination (50/page) — typical query time < 50ms on SQLite
- Search uses `ILIKE` on indexed-adjacent columns — acceptable for this scale
- Frontend debounces search input by 300ms to avoid hammering the API on every keystroke
- Analytics queries use SQL aggregations (AVG, MIN, MAX, COUNT) — never pull all rows to Python
- Median is computed in Python (SQLite has no native MEDIAN) — acceptable for 10k rows

### What changes at 100k+ employees
- Move to PostgreSQL with proper indexes on `department`, `country`, `status`
- Add Redis caching for analytics endpoints (data changes infrequently)
- Switch search to PostgreSQL full-text search or Elasticsearch

---

## Folder Structure Rationale

```
backend/app/
  routers/    ← HTTP layer only. No business logic here.
  services/   ← All business logic. Routers call services.
  models.py   ← DB schema
  schemas.py  ← API contracts (request/response shapes)
```

This separation means:
- Tests call services directly without needing HTTP
- Routers are thin and easy to read
- Business logic is testable in isolation