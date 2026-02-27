---
name: saas-onboarding-design
description: Design and implement onboarding flows for testers and companies in a user-testing SaaS. Use when building onboarding, signup flows, or when users click "Become a Tester" or "Start Testing Now". Covers dual-sided marketplace onboarding (testers vs companies/developers).
---

# SaaS Onboarding Design

## When to Use

- Designing or implementing signup/onboarding for **testers** (people who earn money testing apps)
- Designing or implementing signup/onboarding for **companies/developers** (people who post tests and get videos)
- User mentions "become a tester", "start testing now", onboarding flows, or CTA routing
- Planning conversion funnels from marketing landing to authenticated dashboard

---

## Onboarding Principles

### 1. Separate Personas, Separate Flows

| Persona | CTA | Destination | Purpose |
|---------|-----|-------------|---------|
| **Tester** | "Become a Tester" | `/tester/signup` | People who want to earn money testing apps |
| **Company/Developer** | "Start Testing Now" | `/dev/signup` | Product teams who want real user feedback |

Never send both to the same page. Testers and companies have different goals, forms, and post-signup journeys.

### 2. Sign Up Before Protected Content

- **Tester**: Landing → Sign Up → Available Tests (marketplace)
- **Company**: Landing → Sign Up → Dashboard → Create Task

Do not link "Become a Tester" directly to `/tester/available`. Unauthenticated users must sign up first.

### 3. Minimal Friction, Maximum Clarity

- Reduce form fields to essentials (email, password, name, role-specific field)
- Show value props before the form (benefits for testers, ROI for companies)
- Social login (Google, GitHub) when available
- One primary CTA per screen

### 4. Post-Signup First Action

Guide users to their first success:
- **Tester**: "Browse Available Tests" or "Claim your first test"
- **Company**: "Create your first test" or "Post a task"

---

## Checklist for New Onboarding Flows

When designing or implementing onboarding:

- [ ] **CTA routing**: Which button goes where? (Become a Tester → tester, Start Testing Now → company)
- [ ] **Signup page exists**: Dedicated `/tester/signup` and `/dev/signup`
- [ ] **Value props visible**: Benefits list (testers) or value (companies) above the form
- [ ] **Form fields**: Email, password, name + one role-specific field (e.g. experience level, company name)
- [ ] **Post-signup redirect**: Tester → `/tester/available`, Company → `/dev` or `/dev/tasks/new`
- [ ] **Auth gate**: Protected routes redirect unauthenticated users to signup

---

## Reference: UserTest Platform Routes

| Route | Persona | Purpose |
|-------|---------|---------|
| `/tester/signup` | Tester | Email/social signup, experience level |
| `/tester/signin` | Tester | Login |
| `/tester/available` | Tester | Marketplace (auth required) |
| `/dev/signup` | Company | Email/social signup, company info |
| `/dev/signin` | Company | Login |
| `/dev` | Company | Dashboard (auth required) |

---

## Design Decisions to Consider

1. **Single vs multi-step signup**: Single page (faster) vs wizard (clearer) — prefer single page for MVP
2. **Social login**: Include Google/GitHub — reduces friction
3. **Email verification**: Optional in v1, defer to v2
4. **Company fields**: Company name optional in v1; role (developer) implicit from `/dev/signup`

---

## Spec Alignment

- Follow `Documentation/UX_TESTER_MARKETPLACE.md` for tester journey
- Follow `Documentation/UX_SPEC.md` for developer journey
- Design tokens: `#0a0a0a` background, glass cards (`bg-white/5`), blue/purple accents
