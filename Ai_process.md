# AI-Assisted Development Process

## Overview

This project was built using Claude (Anthropic) as the primary AI assistant throughout the development lifecycle. This document captures how AI was used, what prompts drove key decisions, and where human judgment overrode AI output.

---

## Philosophy

AI was used as a senior pair programmer — not an autocomplete tool. Every output was reviewed, questioned, and sometimes rejected. The goal was to move faster on implementation while keeping architectural and product decisions human-driven.

---

## Phase Breakdown

### Phase 1 — Requirements & Scoping

**Prompt used:**
> "This is a take-home engineering assessment. Before we write any code, help me think through what we're actually building, who it's for, and what we should deliberately leave out. The persona is an HR Manager managing salaries for 10,000 employees across multiple countries. Write a one-page requirements document with goal, scope, out-of-scope, and reasoning."

**What AI produced:** A structured requirements doc covering user persona, problem mapping, feature scope, deliberate exclusions, tech decisions, data model sketch, and success criteria.

**Human decisions made here:**
- Decided to exclude payroll processing, benefits, and employee self-service — AI suggested these as "potential inclusions" but I scoped them out as v2
- Chose SQLite over PostgreSQL for v1 to eliminate infrastructure overhead
- Chose FastAPI over Django — AI presented both options, I picked FastAPI for its lower boilerplate and automatic OpenAPI docs

---

### Phase 2 — Architecture

**Prompt used:**
> "Design the full system architecture for this. Give me: folder structure for a monorepo with FastAPI backend and Next.js frontend, all REST API endpoints with methods and descriptions, final DB schema with types and constraints, and a visual architecture diagram."

**What AI produced:** Complete folder structure, 12 API endpoints, SQL schema for two tables, and an SVG architecture diagram.

**Human decisions made here:**
- Reviewed the API surface and removed a `/audit` top-level router — kept audit as a sub-resource under `/employees/{id}/audit` (cleaner REST design)
- Decided on soft-delete only (no hard delete) — this wasn't in the AI's first schema draft, I added it explicitly
- Added `currency` as a derived field from `country` — AI had them as independent inputs which would allow inconsistent data

---

### Phase 3 — Backend Implementation

**Prompt used:**
> "Build the backend file by file in this order: requirements.txt, database.py, models.py, schemas.py, services/employee_service.py, services/analytics_service.py, routers/employees.py, routers/analytics.py, main.py, seed.py. After each file explain what it does and why it's structured this way."

**What AI produced:** All backend files with Pydantic validators, SQLAlchemy models, service layer separation, streaming CSV export, and a seed script using Faker with weighted distributions.

**Human decisions made here:**
- Caught that the seed script used `fake.unique.email()` which could fail on large batches — reviewed and confirmed Faker handles this correctly for 10k
- Reviewed salary bands per department and adjusted them to be more realistic for a global org
- Confirmed the audit log triggers on field-by-field diff rather than whole-record snapshots — more useful for the HR Manager

**Bug caught during review:**
- AI's initial `get_distribution` function used `low <= s < high` which missed the maximum salary value (fell exactly on the upper boundary of the last bucket). Caught this in tests — `test_distribution` failed with `assert 4 == 5`. Fixed by using `<=` on the last bucket.

---

### Phase 4 — Tests

**Prompt used:**
> "Write a meaningful set of unit tests covering: employee CRUD, validation edge cases, search and filtering, pagination, audit log creation on update, deactivation and visibility, CSV export, and all analytics endpoints. Tests should be fast, deterministic, and use a separate in-memory SQLite DB."

**What AI produced:** 30 tests across two files covering all core functionality.

**Issues found and fixed:**
- Both test files were overriding `get_db` independently, causing the analytics tests to hit a table-less DB. Fixed by extracting shared test config into `conftest.py` — standard pytest pattern that AI missed on the first pass.
- `test_distribution` failure (described above) — caught by tests, not by reading the code.

**Human judgment:** Kept tests focused on behavior, not implementation. Didn't test internal service functions directly — tested through the HTTP layer using `TestClient` so tests reflect real usage.

---

### Phase 5 — Frontend

**Prompt used:**
> "Build the frontend file by file: lib/api.ts (typed API client), app/layout.tsx (nav), components/FilterBar.tsx, components/AuditPanel.tsx, components/EmployeeForm.tsx, components/EmployeeTable.tsx, app/page.tsx (main view), app/analytics/page.tsx (dashboard with charts). Use Tailwind for styling and Recharts for charts."

**What AI produced:** All frontend files with TypeScript types, debounced search, paginated table, modal forms, audit panel, and analytics dashboard with bar charts.

**Bugs and improvements caught during review:**
- Search was matching on email field — confusing UX since emails contain names. Removed email from search, kept name + employee ID only.
- Salary input was `type="number"` which renders browser spinners. Changed to `type="text"` with `inputMode="numeric"` — cleaner UX.
- Deactivate used `window.confirm()` — browser alert is jarring and easy to mis-click. Replaced with a proper `ConfirmModal` component.
- Analytics page had no filters — added department and country dropdowns to filter charts client-side.
- Search fired on every keystroke — added 300ms debounce to avoid hammering the API on 10k rows.

---

## What AI Did Well

- Boilerplate and structure — folder layout, file scaffolding, import chains
- Pydantic schema design with validators
- SQLAlchemy query patterns
- Test structure and fixture setup
- Recharts integration

## Where Human Judgment Was Essential

- Scope decisions (what to cut from v1)
- REST API design (resource naming, sub-resources)
- Data integrity decisions (soft delete, currency derived from country)
- UX decisions (deactivate modal, search scope, salary input type)
- Bug identification during code review
- Test strategy (behavior-focused, HTTP-layer testing)

---

## Tools Used

- **Claude (Anthropic)** — primary AI assistant for all phases
- **VS Code** — editor
- **Git** — version control with incremental commits per phase