# Backend & Database Development Strategy

> **For Claude:** Use this doc as the canonical reference for schema and architecture. Invoke `supabase-postgres-best-practices` when implementing schema/migrations.

**Goal:** Create a document-aware backend structure where the database schema and architecture are fully documented and derived from the specification documents, with a clear execution plan.

**Sources:** `Documentation/ARCHITECTURE.md`, `Documentation/MARKETPLACE.md`, `Documentation/MVP.md`, `Documentation/UX_SPEC.md`, `Documentation/UX_TESTER_MARKETPLACE.md`, `Documentation/UI_SPEC.md`, `Documentation/STRATEGY.md`

---

## 1. Document-Aware Structure

### 1.1 Canonical Document Hierarchy

| Priority | Document | Purpose |
|----------|----------|---------|
| 1 | `Documentation/DATABASE_SPEC.md` | **NEW** – Single source of truth for tables, columns, types, constraints, indexes, RLS |
| 2 | `Documentation/ARCHITECTURE.md` | Domain modules, data flow, tech stack |
| 3 | `Documentation/UX_SPEC.md` | Core objects (Task, Submission, Payment types) |
| 4 | `Documentation/MVP.md` | Scope, feature cuts |
| 5 | `Documentation/MARKETPLACE.md` | Business rules, pricing, trust levels |

### 1.2 Workflow

```
Documentation/*.md  →  DATABASE_SPEC.md  →  Supabase migrations  →  src/types  →  src/lib/db
       (input)           (canonical)           (SQL)                  (derived)      (implemented)
```

- **DATABASE_SPEC.md** is written once from all docs, then maintained as schema evolves.
- Migrations are generated from DATABASE_SPEC (or manually aligned with it).
- `src/types/index.ts` should reflect the schema (can be auto-generated or manually kept in sync).
- `src/lib/db` implements the actual Supabase client calls.

---

## 2. Database Schema (Derived from Docs)

### 2.1 Entity Relationship Overview

```
┌─────────────┐       ┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   users     │──┬───▶│   tasks     │──┬───▶│ submissions  │──────▶│ transactions│
│             │  │    │             │  │    │              │       │             │
│ (auth +     │  │    │ developer   │  │    │ tester       │       │ payment     │
│  profile)   │  │    │ assigns    │  │    │ video        │       │ escrow      │
└─────────────┘  │    └─────────────┘  │    └──────────────┘       └─────────────┘
                 │           │         │            │
                 │           │         │            ▼
                 │           │         │    ┌──────────────┐
                 │           │         └───▶│   reviews    │
                 │           │              │ (ratings)   │
                 │           │              └──────────────┘
                 │           │
                 └───────────┴── claim_expires_at, assigned_tester_id
```

### 2.2 Tables (Full Specification)

#### `users` (extends auth.users or links to Clerk)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, FK → auth.users(id) | If Supabase Auth; else external_id |
| email | text | NOT NULL, UNIQUE | |
| role | text | NOT NULL, CHECK IN ('developer','tester') | |
| trust_level | text | DEFAULT 'new', CHECK IN ('new','regular','trusted') | Affects payout hold |
| completed_tasks_count | int | DEFAULT 0 | Denormalized for trust upgrade |
| avg_rating | numeric(3,2) | | For testers |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**Indexes:** `(role)`, `(trust_level)`, `(email)`

---

#### `tasks`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| developer_id | uuid | FK → users(id), NOT NULL | |
| app_url | text | NOT NULL | Valid URL |
| instructions | text | NOT NULL, LENGTH >= 50 | |
| budget | numeric(10,2) | NOT NULL, CHECK (15 <= budget <= 30) | MVP range |
| platform_fee_percent | int | DEFAULT 20 | 20–30% per MARKETPLACE.md |
| status | text | NOT NULL, CHECK IN ('draft','posted','claimed','submitted','completed') | |
| assigned_tester_id | uuid | FK → users(id), NULL | Set when claimed |
| claim_expires_at | timestamptz | NULL | 30 min from claim |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**Indexes:** `(developer_id)`, `(status)`, `(status, created_at)` for marketplace listing, `(assigned_tester_id)`

---

#### `submissions`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| task_id | uuid | FK → tasks(id), NOT NULL | |
| tester_id | uuid | FK → users(id), NOT NULL | |
| video_url | text | NOT NULL | S3 or storage URL |
| video_duration_seconds | int | NOT NULL, CHECK >= 180 | Min 3 min |
| thumbnail_url | text | | |
| notes | text | | Tester notes |
| status | text | NOT NULL, CHECK IN ('pending','approved','rejected') | |
| developer_rating | int | CHECK (1 <= x <= 5) | |
| developer_feedback | text | | Rejection reason |
| submitted_at | timestamptz | DEFAULT now() | |
| reviewed_at | timestamptz | | |

**Indexes:** `(task_id)`, `(tester_id)`, `(status)`, `(task_id, status)`

---

#### `transactions`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| task_id | uuid | FK → tasks(id), NOT NULL | |
| submission_id | uuid | FK → submissions(id), NOT NULL, UNIQUE | 1:1 with submission |
| developer_id | uuid | FK → users(id), NOT NULL | |
| tester_id | uuid | FK → users(id), NOT NULL | |
| amount | numeric(10,2) | NOT NULL | Developer pays |
| tester_earnings | numeric(10,2) | NOT NULL | After platform fee |
| platform_fee | numeric(10,2) | NOT NULL | |
| status | text | NOT NULL, CHECK IN ('held','released','disputed') | |
| held_at | timestamptz | DEFAULT now() | |
| released_at | timestamptz | | |

**Indexes:** `(task_id)`, `(tester_id)`, `(developer_id)`, `(status)`

---

#### `reviews`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| submission_id | uuid | FK → submissions(id), NOT NULL | |
| reviewer_id | uuid | FK → users(id), NOT NULL | Developer |
| reviewee_id | uuid | FK → users(id), NOT NULL | Tester |
| rating | int | NOT NULL, CHECK (1 <= x <= 5) | |
| feedback | text | | |
| created_at | timestamptz | DEFAULT now() | |

**Indexes:** `(submission_id)`, `(reviewee_id)` for avg_rating aggregation

---

### 2.3 Enums (Postgres)

```sql
CREATE TYPE user_role AS ENUM ('developer', 'tester');
CREATE TYPE trust_level AS ENUM ('new', 'regular', 'trusted');
CREATE TYPE task_status AS ENUM ('draft', 'posted', 'claimed', 'submitted', 'completed');
CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE payment_status AS ENUM ('held', 'released', 'disputed');
```

### 2.4 Row-Level Security (RLS)

- **users:** Users can read/update only their own row.
- **tasks:** Developers read/update their tasks; testers read posted/claimed (by them).
- **submissions:** Developer owns task → read/write submissions; tester owns submission → read.
- **transactions:** Read-only for involved parties.
- **reviews:** Insert by reviewer; read by reviewee.

---

## 3. Execution Strategy

### Phase 0: Your Prerequisites (Do First)

| Step | Action | Where |
|------|--------|-------|
| 1 | Create a Supabase project | [supabase.com](https://supabase.com) → New Project |
| 2 | Copy project URL and `anon`/`service_role` keys | Settings → API |
| 3 | Add env vars to `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Project root |
| 4 | Authenticate Supabase MCP in Cursor | Call `mcp_auth` for plugin-supabase-supabase (see STATUS.md) |

**Auth choice:** ✓ **Supabase Auth** selected. `profiles` table links to `auth.users`. See `Documentation/DATABASE_SPEC.md`.

---

### Phase 1: Document the Schema

| Task | Deliverable |
|------|-------------|
| 1.1 | Create `Documentation/DATABASE_SPEC.md` with full schema (this doc’s §2 as canonical) |
| 1.2 | Add ER diagram (Mermaid or ASCII) |
| 1.3 | Document RLS policies per table |
| 1.4 | Sync `src/types/index.ts` with DATABASE_SPEC |

---

### Phase 2: Supabase Setup

| Task | Deliverable |
|------|-------------|
| 2.1 | Add `@supabase/supabase-js` to package.json |
| 2.2 | Create `src/lib/supabase/client.ts` and `server.ts` |
| 2.3 | Run migrations: create enums, tables, indexes, RLS |
| 2.4 | Seed minimal dev data (1 dev, 2 testers, 2 tasks) |

---

### Phase 3: Implement Data Layer

| Task | Deliverable |
|------|-------------|
| 3.1 | Replace `src/lib/db/index.ts` with Supabase-backed functions |
| 3.2 | Implement: tasks.create, findByDeveloper, findById |
| 3.3 | Implement: submissions.create, findByTask, updateStatus |
| 3.4 | Implement: transactions.create, release |

---

### Phase 4: Wire to API / Pages

| Task | Deliverable |
|------|-------------|
| 4.1 | Create API routes or server actions for tasks, submissions, payments |
| 4.2 | Wire dev dashboard (`/dev`, `/dev/tasks`) to real data |
| 4.3 | Wire tester marketplace (`/tester/available`, `/tester/my-tests`) to real data |

---

## 4. Skills & Resources

| Resource | Use |
|----------|-----|
| **supabase-postgres-best-practices** | Index design, RLS, connection pooling, query optimization |
| **writing-plans** | Create a detailed implementation plan after design approval |
| **executing-plans** | Execute the backend plan task-by-task |

---

## 5. Alignment with Existing Docs

| Doc | Alignment |
|-----|-----------|
| ARCHITECTURE | Schema matches User, Task, Submission, Transaction, Review; modules map to tables |
| UX_SPEC | Task, Submission, Payment types expanded with DB types |
| UX_TESTER_MARKETPLACE | claim_expires_at, status transitions (claimed → in_progress → submitted) |
| MVP | Budget 15–30, platform fee 20%, manual assignment |
| MARKETPLACE | Trust levels, escrow flow, payout holds |

---

## 6. Next Steps

1. **Answer:** Supabase Auth vs Clerk (for `users` table).
2. **Approve** this strategy and schema.
3. **Create** `Documentation/DATABASE_SPEC.md` as the canonical schema doc.
4. **Invoke** `writing-plans` skill to produce the implementation plan.
5. **Execute** the plan (subagent-driven or parallel session).

---

*End of Strategy Document*
