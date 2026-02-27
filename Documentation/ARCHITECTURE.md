# SaaS Architecture: Authentic User Testing Platform

## 1. Domain Modules

| Module | Responsibility |
|--------|----------------|
| **Auth** | User registration, login, roles (developer/tester), session management |
| **Task** | Task creation, assignment, status tracking, task templates |
| **Submission** | Video uploads, storage, approval workflow, resubmission logic |
| **Payment** | Escrow, payouts, Stripe Connect, dispute holds |
| **Rating** | Developer and tester reviews, score aggregation |
| **Notification** | Email alerts, in-app messages, status updates |

## 2. Feature Boundaries

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                  │
│  [Dev Dashboard]  [Tester Dashboard]  [Landing Page]    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      API Gateway (Next.js API Routes)     │
└─────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
    ┌───────────┐    ┌───────────┐    ┌───────────┐
    │   Auth   │    │   Task    │    │Payment   │
    │  Module  │    │  Module   │    │ Module   │
    └───────────┘    └───────────┘    └───────────┘
          │                 │                 │
          ▼                 ▼                 ▼
    ┌───────────┐    ┌───────────┐    ┌───────────┐
    │  Users   │    │  Tasks    │    │Transactions│
    │  Roles  │    │ Submissions│   │  Escrow   │
    └───────────┘    └───────────┘    └───────────┘
```

## 3. Data Ownership

| Entity | Owner Module | Description |
|--------|--------------|-------------|
| User | Auth | Profile, role, verification level |
| Task | Task | App URL, instructions, status, assigned tester |
| Submission | Submission | Video URL, status (pending/approved/rejected), timestamps |
| Transaction | Payment | Escrow amount, status, payout record |
| Review | Rating | Ratings, feedback, timestamps |

## 4. Technology Stack

| Layer | Technology | Rationale |
|-------|------------|------------|
| Frontend | Next.js 14 | React, SSR, Vercel deploy |
| Backend | Next.js API Routes | Same repo, simple deployment |
| Database | PostgreSQL (Supabase) | Relational data, easy auth |
| Auth | Clerk | Simple user management |
| Storage | AWS S3 | Video file storage |
| Video | Loom SDK / Mux | Recording + playback |
| Payments | Stripe Connect | Marketplace payments |
| Email | Resend | Transactional emails |

## 5. Data Flow

```
Developer                    Platform                    Tester
    │                           │                           │
    ├─── Create Task ─────────►│                           │
    │                           ├─── Assign Task ──────────►│
    │                           │                           │
    │                           │◄─── Submit Video ────────┤
    │                           │                           │
    ├──◄── View Video ─────────│                           │
    │                           │                           │
    ├─── Approve ─────────────►│                           │
    │                           ├─── Release Payment ──────►│
    │                           │                           │
```

## 6. Extensibility Path

| Phase | Extension | Description |
|-------|-----------|-------------|
| V2 | Public API | REST API for third-party integrations |
| V2 | Webhooks | Notify external systems on task events |
| V3 | Plugin System | Allow custom video analysis tools |
| V3 | Team Workspaces | Multi-user organizations |

## 7. Scaling Considerations

| Bottleneck | Solution |
|------------|----------|
| Video storage costs | Tiered storage: hot (S3 std) → cold (S3 IA) |
| Video bandwidth | CloudFront CDN for playback |
| Payment processing | Stripe handles scale |
| Database | Read replicas at 10K+ users |

## 8. Evolution Phases

| Phase | Focus | Scale |
|-------|-------|-------|
| **V1** | MVP | Single region, 100 users, manual operations |
| **V2** | Growth | Multi-region, 10K users, automated matching |
| **V3** | Scale | Global, 100K+ users, marketplace features |

## 9. Key Architectural Decisions

| Decision | Rationale |
|----------|------------|
| Next.js full-stack | Fast dev velocity, single repo |
| Supabase (PostgreSQL) | Built-in auth, easy schema |
| Stripe Connect | Handles marketplace复杂的付款拆分 |
| Loom SDK vs Direct Upload | Loom provides recording UI; direct upload gives more control |
| Manual task assignment | MVP: simpler than building matching algorithm |

## 10. Database Schema (High-Level)

```sql
-- Users (developers and testers)
users: id, email, role, created_at

-- Tasks posted by developers
tasks: id, developer_id, app_url, instructions, budget, status

-- Video submissions
submissions: id, task_id, tester_id, video_url, status, created_at

-- Payments held in escrow
transactions: id, task_id, amount, status, paid_at

-- Ratings
reviews: id, submission_id, reviewer_id, rating, feedback
```
