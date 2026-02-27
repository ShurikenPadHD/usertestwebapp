# UX Specification: Authentic User Testing Platform

## 1. Developer Journey

### Screens & Actions

| Screen | Actions | Key Elements |
|--------|---------|--------------|
| **Landing** | Sign up, login | Hero: "See your app through fresh eyes", Pricing, CTA |
| **Dashboard** | View tasks, create new | Task list, status badges, "New Task" button |
| **Create Task** | Submit app + instructions | App URL input, task brief textarea, budget selector ($15-30), submit |
| **Task Detail** | View submissions | Task info, submission list, video player |
| **Video Player** | Watch + approve/reject | Video embed, approve button, reject button + reason, rating stars |
| **Settings** | Manage account | Profile, payment method, notifications |

### Developer Flow

```
Landing → Sign Up → Dashboard → Create Task → (Wait) → Task Detail → Watch Video → Approve → Done
```

---

## 2. Tester Journey

### Screens & Actions

| Screen | Actions | Key Elements |
|--------|---------|--------------|
| **Landing** | Sign up, login | Hero: "Get paid to test apps", How it works, CTA |
| **Dashboard** | View assigned tasks | Task list, status, "Start" button |
| **Task Brief** | Read instructions | App link, task steps, tips, "Start Recording" |
| **Recording** | Record screen + voice | Screen recorder UI, record/stop, preview |
| **Submit** | Upload video | Upload progress, preview, submit button |
| **Payouts** | View earnings | Balance, payout history, request payout |

### Tester Flow

```
Landing → Sign Up → Dashboard → View Task → Task Brief → Record → Submit → (Wait) → Approved → Payout
```

---

## 3. Key Objects

### Task
```typescript
{
  id: string
  developerId: string
  appUrl: string
  instructions: string        // "Test the signup flow"
  budget: number              // 15-30
  status: TaskStatus          // posted | claimed | submitted | completed
  createdAt: timestamp
  assignedTesterId: string?
}
```

### Submission
```typescript
{
  id: string
  taskId: string
  testerId: string
  videoUrl: string
  duration: number            // seconds
  status: SubmissionStatus    // pending | approved | rejected
  developerRating?: number    // 1-5
  developerFeedback?: string
  createdAt: timestamp
}
```

### Payment
```typescript
{
  id: string
  taskId: string
  submissionId: string
  amount: number              // 15-30 (developer paid)
  testerEarnings: number      // 10-20 (after platform cut)
  platformFee: number         // 20-30%
  status: PaymentStatus       // held | released | disputed
  releasedAt?: timestamp
}
```

---

## 4. State Transitions

### Task States
```
POSTED → CLAIMED → SUBMITTED → APPROVED → COMPLETED
              ↓
           REJECTED → (resubmit) → SUBMITTED
```

### Payment States
```
HELD → RELEASED (after approval)
     → DISPUTED (if rejected)
```

### Tester Trust Levels
```
NEW → REGULAR (5+ tasks) → TRUSTED (20+, 4.5★)
```

---

## 5. Screen Wireframes (Text)

### Developer Dashboard
```
┌─────────────────────────────────────┐
│ Logo    Dashboard    Settings    ● │
├─────────────────────────────────────┤
│                                     │
│  My Tasks                    [+ New]│
│  ─────────────────────────────────  │
│  ○ Task #1: My App Login Flow      │
│    Status: ● In Review              │
│    Submitted: 2h ago                │
│                                     │
│  ○ Task #2: Checkout Flow          │
│    Status: ○ Posted                 │
│    Budget: $25                      │
│                                     │
└─────────────────────────────────────┘
```

### Task Detail (Developer)
```
┌─────────────────────────────────────┐
│ ← Back                              │
├─────────────────────────────────────┤
│ Task: Test Login Flow               │
│ App: myapp.com                      │
│ Budget: $25                         │
│                                     │
│ Submissions (1)                     │
│ ─────────────────────────────────   │
│ ⏯ Tester: Alex                      │
│   Duration: 6:32                    │
│   Rating: ★★★★☆                     │
│   [▶ Watch] [✓ Approve] [✗ Reject] │
│                                     │
└─────────────────────────────────────┘
```

### Tester Dashboard
```
┌─────────────────────────────────────┐
│ Logo    Tasks    Payouts    ●      │
├─────────────────────────────────────┤
│                                     │
│  Available Tasks                    │
│  ─────────────────────────────────  │
│  ○ Test Login Flow                  │
│    Budget: $25                      │
│    [▶ Start]                        │
│                                     │
│  Current Tasks                      │
│  ─────────────────────────────────  │
│  ● Test Signup (In Progress)        │
│    Due: Today, 8pm                 │
│    [Continue]                       │
│                                     │
│  Balance: $42.50          [Cash Out]│
└─────────────────────────────────────┘
```
