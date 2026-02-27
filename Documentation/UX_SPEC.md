# UX Specification: Authentic User Testing Platform

## Reference Platform Analysis

### UX Patterns from Reference Sites

| Platform | Key Patterns Adopted |
|----------|---------------------|
| **UserTesting.com** | Structured task briefs, video player with timestamps, approval workflow |
| **Upwork** | Clear pricing display, milestone-based flow, messaging between parties |
| **Fiverr** | Order cards with status, quick-action buttons, visual progress indicators |
| **Framer (Xtract)** | Modern card-based layouts, clear CTAs, whitespace-heavy design, status badges |

---

## 1. Developer Journey

### Flow: Create Test → Receive Videos → Approve

```
Sign Up → Post Task → Wait → Review → Approve/Reject → Done
```

### Screen Sequence

| # | Screen | Key Actions |
|---|--------|-------------|
| D1 | **Landing** | Sign up CTA, value prop, pricing preview |
| D2 | **Sign Up** | Email/GitHub, role selection (developer) |
| D3 | **Dashboard** | View all tasks, status badges, \"New Task\" CTA |
| D4 | **Create Task** | App URL, task instructions, budget selection |
| D5 | **Task Detail** | View submissions, watch videos, approve/reject |
| D6 | **Video Player** | Play/pause, timestamps, approve button, reject + reason |
| D7 | **Payment** | Add funds, view transaction history |

### Key Interactions

- **Create Task**: Form with real-time validation, budget slider ($15-30), task type dropdown
- **Review**: Split view - video left, notes right. One-click approve, reject with feedback (voir § Developer Review Flow)
- **Status**: Visual badges (Posted: blue, In Review: yellow, Completed: green)

### Developer Review Flow (post-submission)

| Action | UI | Données persistées |
|--------|-----|-------------------|
| **Approve** | Clic sur Approve + rating étoiles (1–5) optionnel | `submissions.status='approved'`, `developer_rating`, `reviewed_at` ; création `transactions` |
| **Reject** | Clic Reject → formulaire feedback (texte libre ou raisons prédéfinies) → Confirm Reject | `submissions.status='rejected'`, `developer_feedback`, `reviewed_at` |

**Reject feedback :** Texte libre recommandé (plus flexible). Alternative : dropdown de raisons prédéfinies (ex. "Video quality too low", "Instructions not followed", "Other") avec champ libre pour précision.

**Resubmit après rejet :** Le testeur peut enregistrer et soumettre à nouveau une nouvelle vidéo pour la même tâche. La soumission rejetée reste en historique ; une nouvelle soumission est créée (status pending).

---

## 2. Tester Journey (Marketplace Model)

### Flow: Marketplace Browse → Claim → Record → Submit

```
Sign Up → Available Tests (Marketplace) → Browse & Claim → Record → Submit → Approved → Earnings
```

### Screen Sequence

| # | Screen | Key Actions |
|---|--------|-------------|
| T1 | **Landing** | Sign up CTA, "Get Paid to Test Apps" |
| T2 | **Sign Up** | Email, profile setup, experience level |
| T3 | **Dashboard** | Quick stats, My Tests, link to Marketplace |
| T4 | **Available Tests** | Browse grid, filter by budget/difficulty, claim tasks |
| T5 | **Task Brief** | Read instructions, open app link, "Start Recording" |
| T6 | **Recording** | Screen recorder UI, record/stop, preview |
| T7 | **Submit** | Upload video, add notes, submit |
| T8 | **Payouts** | View balance, request payout, history |

### Marketplace Interactions

- **Browse**: True marketplace catalogue experience.
  - Multi-select dropdown filters (Category, Platform, Duration, Payout, Difficulty)
  - Quick-filter chips for common searches (e.g., "Under 5 mins", "High Paying")
  - Keyword search bar
  - Sort options (Recommended, Highest Payout, Newest)
  - Responsive grid of cards (3-4 columns desktop, 1-2 mobile)
  - Pagination for large result sets
- **Claim**: One-click "Start" button claims the test, moving it to "My Tests" and locking it for 30 mins.
- **State Transitions**:
  - POSTED → CLAIMED (tester locks it)
  - CLAIMED → SUBMITTED (tester uploads video)
  - SUBMITTED → APPROVED/REJECTED (developer reviews)
- **Visibility**: Claimed tests appear in "My Tests" and are hidden from the main marketplace.

---

## 3. Core Objects

### Task
```typescript
{
  id: string
  developerId: string
  appUrl: string              // Required, validated
  instructions: string         // Min 50 chars
  budget: number              // 15-30
  platformFee: number         // 20%
  status: TaskStatus
  createdAt: Date
  assignedTesterId?: string
}
```

### Submission
```typescript
{
  id: string
  taskId: string
  testerId: string
  videoUrl: string
  videoDuration: number       // Seconds, min 180
  thumbnailUrl: string
  status: SubmissionStatus     // pending | approved | rejected
  submittedAt: Date
  reviewedAt?: Date
  developerRating?: number    // 1-5
  developerFeedback?: string
}
```

### Payment
```typescript
{
  id: string
  taskId: string
  submissionId: string
  developerId: string
  testerId: string
  amount: number               // What developer paid
  testerEarnings: number       // After platform cut
  platformFee: number
  status: PaymentStatus        // held | released | disputed
  releasedAt?: Date
}
```

---

## 4. State Transitions

### Task Lifecycle
```
DRAFT → POSTED → CLAIMED → SUBMITTED → (APPROVED | REJECTED)
                                              ↓
                                           COMPLETED
```

### Submission Lifecycle
```
PENDING → APPROVED → (PAYMENT RELEASED)
        ↘
         REJECTED → (TESTER NOTIFIED, feedback visible) → CAN RESUBMIT
                                                              │
                                                              └── Nouvelle soumission (PENDING) pour la même tâche
```

**Resubmit :** Après rejet, le testeur voit le feedback du développeur. Il peut enregistrer une nouvelle vidéo et soumettre ; une nouvelle ligne `submissions` est créée (status pending). L’ancienne soumission rejetée reste en historique.

### Payment Lifecycle
```
HELD (escrow) → RELEASED (after approval)
              ↘
               DISPUTED (if rejected)
```

### Tester Trust Levels (affects payout speed)
```
NEW (0 tasks) ──5+ tasks──→ REGULAR ──20+ tasks, 4.5★──→ TRUSTED
     7-day hold              3-day hold                    24-hour
```

---

## 5. Required Screens

### Developer Screens
| Screen | Route | Purpose |
|--------|-------|---------|
| Landing | `/` | Marketing, sign up |
| Sign Up | `/signup` | Developer registration |
| Dashboard | `/dev` | Task overview |
| Create Task | `/dev/tasks/new` | Task creation form |
| Task Detail | `/dev/tasks/[id]` | View submissions |
| Video Review | `/dev/tasks/[id]/[submissionId]` | Watch + approve/reject |
| Payments | `/dev/payments` | Add funds, history |
| Settings | `/dev/settings` | Profile, notifications |

### Tester Screens
| Screen | Route | Purpose |
|--------|-------|---------|
| Landing | `/` | Marketing, sign up |
| Sign Up | `/tester/signup` | Tester registration |
| Dashboard | `/tester` | Quick stats, My Tests |
| **Available Tests (Marketplace)** | `/tester/available` | Browse grid, filter, claim tasks |
| Task Brief | `/tester/tasks/[id]` | View instructions |
| Recording | `/tester/tasks/[id]/record` | Record screen |
| Submit | `/tester/tasks/[id]/submit` | Upload video |
| Payouts | `/tester/payouts` | Balance, cash out |
| Settings | `/tester/settings` | Profile, verification |</new_string>}}]

---

## 6. UX Risks & Friction Points

### High Risk
| Risk | Mitigation |
|------|------------|
| **Tester submits low-quality video** | Minimum duration (3 min), require voice narration, auto-flag template responses |
| **Developer doesn't review in time** | 24-hour reminder, auto-approve after 72h |
| **Video upload fails** | Resume capability, max 100MB, format validation |
| **Payment disputes** | Clear acceptance criteria, evidence保存, appeal process |

### Medium Risk
| Risk | Mitigation |
|------|------------|
| **Cold start: no testers** | Supply-first launch, guaranteed tasks for early testers |
| **Developer churn** | Fast first turnaround, quality testers, notifications |
| **Confusing task instructions** | Template suggestions, preview mode |
| **Tester can't record** | Browser compatibility check, Loom SDK fallback |

### Friction Points to Minimize
| Point | Solution |
|-------|----------|
| Sign up too long | GitHub OAuth, 3 fields max |
| Recording too complex | Loom embed, one-click start |
| Finding right task | Quick filters (budget, category) |
| Getting paid | Stripe Connect, instant withdrawals for trusted |

---

## 7. Design Principles (from Framer Xtract)

- **Card-based layouts** with subtle shadows
- **Clear visual hierarchy**: Title → Status → Action
- **Generous whitespace** for readability
- **Status badges**: Color-coded (blue=posted, yellow=review, green=done)
- **One primary action** per screen
- **Progress indicators** for multi-step flows
- **Inline validation** with helpful error messages
