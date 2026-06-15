# ACME Salary Management System

A web-based salary management tool built for HR teams managing 10,000+ employees across multiple countries. Replaces Excel-based workflows with a fast, auditable, and filterable interface.

## Demo
[Watch demo video](https://www.loom.com/share/3c0f16a4bcab454183c36ac5f089ec07)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.9 + FastAPI |
| Database | SQLite via SQLAlchemy ORM |
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Testing | pytest — 30 tests passing |

---

## Running Locally

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm

---

### 1. Clone the repo

```bash
git clone https://github.com/pavithranaiengineer-spec/acme-salary.git
cd acme-salary
```

---

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python seed.py                   # Seeds 10,000 employees (~30 seconds)
uvicorn app.main:app --reload
```

Backend runs at: `http://localhost:8000`  
API docs (Swagger UI): `http://localhost:8000/docs`

---

### 3. Frontend (open a new terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

### 4. Run Tests

```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```

Expected output: **30 passed**

---

## Features

### Employee Management
- Paginated table of all 10,000 employees (50 per page)
- Search by name or employee ID
- Filter by department, country, employment type, status
- Add new employees with full validation
- Edit existing employee details — every change is audit logged
- Soft-deactivate employees with confirmation modal (never hard deleted)
- Export filtered results to CSV

### Analytics Dashboard
- Global summary: headcount, avg / median / min / max salary
- Average salary by department (bar chart)
- Headcount by country (bar chart)
- Salary distribution histogram
- Filter charts by department and country
- Country breakdown table with currency

### Audit Trail
- Every field change logged with old value, new value, timestamp
- Viewable per employee via History button

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/employees` | List with pagination, search, filters |
| POST | `/employees` | Create employee |
| GET | `/employees/{id}` | Get single employee |
| PUT | `/employees/{id}` | Update employee |
| PATCH | `/employees/{id}/deactivate` | Soft deactivate |
| GET | `/employees/{id}/audit` | Audit history |
| GET | `/employees/export` | CSV export |
| GET | `/analytics/summary` | Global stats |
| GET | `/analytics/by-department` | Stats by department |
| GET | `/analytics/by-country` | Stats by country |
| GET | `/analytics/distribution` | Salary histogram data |

---

## Project Structure

```
acme-salary/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI entry point + CORS
│   │   ├── database.py                # DB session and engine
│   │   ├── models.py                  # SQLAlchemy ORM models
│   │   ├── schemas.py                 # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── employees.py           # CRUD + export endpoints
│   │   │   └── analytics.py           # Summary + chart data
│   │   └── services/
│   │       ├── employee_service.py    # Business logic
│   │       └── analytics_service.py   # Aggregation logic
│   ├── seed.py                        # Seeds 10,000 employees
│   ├── tests/
│   │   ├── conftest.py                # Shared test DB setup
│   │   ├── test_employees.py          # 23 employee tests
│   │   └── test_analytics.py          # 7 analytics tests
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout + nav
│   │   ├── page.tsx                   # Employee table view
│   │   └── analytics/page.tsx         # Analytics dashboard
│   ├── components/
│   │   ├── EmployeeTable.tsx
│   │   ├── EmployeeForm.tsx
│   │   ├── FilterBar.tsx
│   │   ├── AuditPanel.tsx
│   │   └── ConfirmModal.tsx
│   └── lib/api.ts                     # Typed API client
├── REQUIREMENTS.md                    # Scope and feature decisions
├── ARCHITECTURE.md                    # Design decisions and trade-offs
└── AI_PROCESS.md                      # How AI was used during development
```

---

## Seed Data

10,000 employees generated with realistic distributions:
- 10 departments with role-appropriate salary bands
- 8 countries with correct ISO 4217 currencies (INR, USD, GBP, EUR, CAD, AUD, SGD, AED)
- Weighted country distribution (35% India, 25% USA, etc.)
- 75% full-time, 15% contractor, 10% part-time
- ~5% inactive employees