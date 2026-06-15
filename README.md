# ACME Salary Management System

A web-based salary management tool for HR teams managing 10,000+ employees across multiple countries. Built to replace Excel-based workflows with a fast, auditable, and filterable interface.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.9 + FastAPI |
| Database | SQLite via SQLAlchemy ORM |
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Testing | pytest (backend), 30 tests |

---

## Project Structure

```
acme-salary/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI entry point
│   │   ├── database.py           # DB session + engine
│   │   ├── models.py             # SQLAlchemy ORM models
│   │   ├── schemas.py            # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── employees.py      # CRUD + export endpoints
│   │   │   └── analytics.py      # Summary + chart data endpoints
│   │   └── services/
│   │       ├── employee_service.py
│   │       └── analytics_service.py
│   ├── seed.py                   # Seeds 10,000 employees
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_employees.py
│   │   └── test_analytics.py
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Employee table view
│   │   └── analytics/page.tsx   # Analytics dashboard
│   ├── components/
│   │   ├── EmployeeTable.tsx
│   │   ├── EmployeeForm.tsx
│   │   ├── FilterBar.tsx
│   │   ├── AuditPanel.tsx
│   │   └── ConfirmModal.tsx
│   └── lib/api.ts                # Typed API client
├── REQUIREMENTS.md
├── ARCHITECTURE.md
└── AI_PROCESS.md
```

---

## Local Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm

---

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python seed.py                   # Seeds 10,000 employees
uvicorn app.main:app --reload
```

Backend runs at: `http://localhost:8000`  
API docs (Swagger): `http://localhost:8000/docs`

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

### Running Tests

```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```

Expected: **30 tests passing**

---

## Features

### Employee Management
- Paginated, searchable table of all 10,000 employees
- Search by name or employee ID
- Filter by department, country, employment type, status
- Add new employees with full validation
- Edit existing employee details (triggers audit log)
- Soft-deactivate employees (never hard deleted)
- Export filtered results to CSV

### Analytics Dashboard
- Global summary: headcount, avg/median/min/max salary
- Average salary by department (bar chart)
- Headcount by country (bar chart)
- Salary distribution histogram
- Filterable by department and country
- Country salary table with currency breakdown

### Audit Trail
- Every field change is logged with old value, new value, and timestamp
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
| GET | `/analytics/distribution` | Salary histogram |

---

## Seed Data Details

10,000 employees seeded with:
- 10 departments with realistic salary bands
- 8 countries with correct ISO 4217 currencies
- Weighted distribution (35% India, 25% USA, etc.)
- 75% full-time, 15% contractor, 10% part-time
- ~5% inactive employees
- Realistic job titles per department