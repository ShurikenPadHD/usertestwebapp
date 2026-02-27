# Marketplace Design: Authentic User Testing Platform

## 1. The Two Sides

| Side | Who | What they provide |
|------|-----|-------------------|
| **Demand** | Indie developers, early-stage founders | App URL, task brief, payment |
| **Supply** | Real users, side-income seekers | Time, screen recording, voice narration |

## 2. Cold-Start Strategy: Supply-First

**Why supply-first?** Quality control is critical. If testers deliver low-effort videos, developers won't come back. Better to have testers ready and recruit developers into a guaranteed pool.

### Launch Sequence

| Phase | Focus | Target |
|-------|-------|--------|
| Phase 1 | Recruit 20-30 testers | QA communities, university students, Reddit r/WeWantToLearn |
| Phase 2 | Recruit 5 paying developers | Twitter followers, Indie Hackers, Product Hunt |
| Phase 3 | Open beta | General launch, refine based on feedback |

### Recruitment Tactics

**Testers (Supply):**
- Post in r/WorkOnline, r/beermoney, college subreddits
- Offer guaranteed minimum tasks + bonuses for quality
- "Get paid to test apps" messaging
- $5-10 per test, paid via Stripe/PayPal

**Developers (Demand):**
- Cold DM indie founders on Twitter
- Post in Indie Hackers, Maker communities
- Offer first test free or 50% off
- Target: Builders with live apps, pre-launch products

## 3. Liquidity Strategy

- **Geographic Focus:** US/English-speaking first (no translation overhead)
- **Category Focus:** Mobile apps → expand to web later
- **Time Focus:** No restriction — async nature, testers complete when available

**Liquidity Thresholds:**
- Minimum 10 active testers per 1 developer request
- Target: 3 submissions per task within 24 hours

## 4. Pricing Model

| Role | Price | Platform Take |
|------|-------|---------------|
| Developer pays | $15-30 per video | - |
| Tester earns | $10-20 per video | 20-30% |

**Pricing Mechanics:**
- Developer funds escrow upfront
- Payment released after developer approves submission
- Dispute holds: If developer rejects, platform mediates

## 5. Transaction Flow

```
1. Developer Posts Task
   └── App URL + task instructions + budget

2. Platform Assigns / Tester Claims
   └── Manual assignment (MVP) → automated later

3. Tester Records & Uploads
   └── Screen recording (Loom embed or direct upload)

4. Developer Reviews
   └── Watch video → Approve or Request Resubmit

5. Payment Released
   └── Escrow → Tester wallet → Payout
```

## 6. Matching Mechanics

**MVP: Direct Assignment (not marketplace-style)**
- Developer posts task → Platform assigns available, rated tester
- Reduces quality risk, simpler UX

**V2+ (Hybrid):**
- Developers can request specific tester attributes (iOS/Android, niche demographic)
- Testers with matching tags get priority

## 7. Reputation Loop

### Tester Ratings
| Dimension | Weight | Description |
|-----------|--------|-------------|
| Video quality | 40% | Clear audio, good framing |
| Task completion | 30% | Did they follow instructions? |
| Narration quality | 20% | Explained their thought process |
| Timeliness | 10% | Submitted on time |

### Developer Ratings
| Dimension | Weight | Description |
|-----------|--------|-------------|
| Payment speed | 50% | Approved and paid promptly |
| Task clarity | 30% | Clear instructions |
| Responsiveness | 20% | Replied to tester questions |

## 8. Single-Player Mode

**Can users get value before the other side arrives?**

- **Testers:** Partially. They can see available tasks, but need developer tasks to earn.
- **Developers:** Partially. They can see the platform, but need testers to get feedback.

**Implication:** Cold start is hard. Must bootstrap both sides simultaneously via founder recruitment.

## 9. Incentive Design

| User Type | Incentive | Details |
|-----------|-----------|---------|
| New Tester | Welcome bonus | $5 after first approved task |
| High-rated Tester | Priority access | First pick of tasks |
| New Developer | First test free | One free test (worth $20) |
| Referring Developer | Credit | $10 per referred developer who pays |
| Referring Tester | Bonus | $2 per referred tester who completes 5 tasks |

## 10. Failure Modes to Avoid

| Risk | Mitigation |
|------|------------|
| **Ghost marketplace** | Ensure 10+ testers per task before launching publicly |
| **Low-quality submissions** | Manual QA on first 100 submissions, rating system kicks in |
| **Developer churn** | Fast turnaround (<24 hours), guaranteed submission quality |
| **Escrow risk** | Keep funds in Stripe, clear dispute policy |
| **One-sided growth** | Balance supply/demand: pause developer signups if tester queue empty |
