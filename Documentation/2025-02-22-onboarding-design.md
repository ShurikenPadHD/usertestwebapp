# Onboarding Design: Testers & Companies

> **Date:** 2025-02-22  
> **Status:** Approved  
> **Scope:** Landing CTAs → Signup → First action for both personas

---

## 1. Overview

Two distinct onboarding flows triggered from the marketing landing page:

1. **Testers** – "Become a Tester" → signup → marketplace
2. **Companies/Developers** – "Start Testing Now" → signup → dashboard → create task

---

## 2. CTA Routing

| Marketing CTA | Target Route | Rationale |
|---------------|--------------|-----------|
| Start Testing Now | `/dev/signup` | Companies want to test their app; must sign up first |
| Become a Tester | `/tester/signup` | Testers want to earn; must sign up before browsing marketplace |

**Current Fix:** Marketing page "Become a Tester" incorrectly links to `/tester/available`. Change to `/tester/signup`. "Start Testing Now" links to `/dev`; change to `/dev/signup`.

---

## 3. Tester Onboarding

### Flow
```
Landing "Become a Tester" → /tester/signup → (submit) → /tester/available
```

### Existing Implementation
- `/tester/signup` exists with: email, password, name, experience level
- Benefits list, social login (Google/GitHub), redirect to `/tester/available` on success
- **No changes needed** to tester signup page

### Optional Enhancement (v2)
- Welcome modal or first-time tour on `/tester/available`
- "Claim your first test" empty state CTA

---

## 4. Company/Developer Onboarding

### Flow
```
Landing "Start Testing Now" → /dev/signup → (submit) → /dev or /dev/tasks/new
```

### Implementation Needed
- `/dev/signup` currently redirects to `/dev` (no actual form)
- **Build `/dev/signup`** with:
  - Email, password, first name, last name
  - Optional: company name (can defer to v2)
  - Value props: "Get real user feedback", "Screen recordings with voice", "Ship with confidence"
  - Social login (Google, GitHub)
  - On success: redirect to `/dev` or `/dev/tasks/new` (first task creation)

### Design
- Mirror tester signup layout: Card, benefits, social + email split
- Accent: blue (companies) vs green (testers) for benefits box
- Same layout structure as `src/app/tester/(auth)/signup/page.tsx`

---

## 5. Auth Gates (Future)

When auth is implemented:
- `/tester/available`, `/tester/my-tests`, etc. → redirect to `/tester/signin` if unauthenticated
- `/dev`, `/dev/tasks/*` → redirect to `/dev/signin` if unauthenticated

---

## 6. Summary of Changes

| Change | File | Action |
|--------|------|--------|
| Fix "Become a Tester" CTA | `src/app/(marketing)/page.tsx` | `href="/tester/available"` → `href="/tester/signup"` |
| Fix "Start Testing Now" CTA | `src/app/(marketing)/page.tsx` | `href="/dev"` → `href="/dev/signup"` |
| Build dev signup page | `src/app/dev/signup/page.tsx` | Replace redirect with full signup form |
| Create dev auth layout | `src/app/dev/(auth)/` | Optional: route group for unauthenticated dev pages |

---

*End of Design*
