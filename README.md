# UserTest – Authentic User Testing Marketplace

## Live Demo

TODO: add Vercel URL

## Repository

TODO: add GitHub URL

---

## Overview

**UserTest** is a two-sided marketplace where **developers** pay **testers** to record screen + voice usability tests of their apps.

| | |
|---|---|
| **Target users** | Developers (product teams) and testers (usability testers) |
| **Problem** | Getting real user feedback is slow and expensive |
| **Solution** | On-demand marketplace: post a task → tester records → developer reviews → payment released |
| **Primary action** | Tester records a screen + voice usability test; developer approves or rejects |

---

## Tech Stack

| Technology | Role |
|-----------|------|
| **Next.js 14 App Router** | Full-stack React, RSC, file-based routing |
| **TypeScript** | Type safety across app and API |
| **Tailwind CSS** | Utility-first styling, glassmorphism design system |
| **Supabase** | Auth (Google OAuth), Postgres, planned Storage |
| **Stripe** | Wallet top-up (Checkout), Customer Portal (payment method), Connect (tester payouts) |
| **Server Actions** | Mutations (create task, submit, approve/reject) without REST boilerplate |

---

## Architecture Decisions

| Decision | Rationale |
|----------|------------|
| **App Router vs Pages** | RSC, layouts, streaming; aligns with Next.js direction |
| **Server Actions vs REST** | Simpler mutations, fewer API routes, colocated with UI |
| **Supabase vs Firebase** | Postgres, RLS, built-in auth; easier relational modeling |
| **Wallet-based payments** | Developer adds funds → task budget held → approval releases to tester wallet |
| **Role-based routing** | `/dev/*` for developers, `/tester/*` for testers; clear separation |

---

## Core User Flows

### Developer

```
Sign in (Google) → Create task → Review submission → Approve → Funds released to tester
```

### Tester

```
Sign in (Google) → Browse tasks → Record / submit → Earnings credited after approval
```

---

## Route Architecture

See **routes.txt** for full route tables and app directory tree.

---

## Project Structure

```
src/
├── app/                      # See routes.txt for full app/ tree
├── lib/                      # db, supabase, utils
├── types/                    # User, Task, Submission, Wallet
├── components/               # UI, layout, wallet, auth
└── hooks/                    # useWallet, useInView
```

---

## Local Setup

```bash
npm install
# Create .env.local with vars below
npm run dev
```

1. **Supabase** – Create project; run migrations in `supabase/migrations/`; enable Google OAuth in Auth → Providers; add redirect URL `http://localhost:3000/auth/callback`.
2. **Stripe** – Create checkout session; webhook URL `http://localhost:3000/api/stripe/webhook` (or use Stripe CLI for local: `stripe listen --forward-to localhost:3000/api/stripe/webhook`).

---

## Environment Variables

| Variable | Description |
|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role for admin ops (profile role updates) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-side Stripe key |

---

## Authentication

- **Supabase Auth** with **Google OAuth**
- Sign-in via `/dev/signin` or `/tester/signin`; callback at `/auth/callback` with `?next=` and `?role=` for redirect
- Profile created on first sign-in; role (`developer` / `tester`) set per flow

---

## Payments

- **Developer:** Add funds via Stripe Checkout → `/api/stripe/create-checkout`; update payment method via Customer Portal → `/api/stripe/create-portal-session`; return URL `/auth/stripe-return`
- **Webhook:** Stripe `checkout.session.completed` → credit developer wallet
- **Approval:** Developer approves submission → server action credits tester wallet (platform fee deducted)
- **Tester payouts:** Stripe Connect Express; create account → `/api/stripe/connect/create-account`; onboard → `/api/stripe/connect/account-link`; request payout → `/api/stripe/connect/request-payout`

---

## Data Model (Summary)

| Entity | Purpose |
|--------|---------|
| `profiles` | User, role, trust_level |
| `tasks` | App URL, instructions, budget, status |
| `submissions` | Video URL, status (pending/approved/rejected), developer rating |
| `wallets` | Balance per user |
| `wallet_transactions` | Deposits, test_reserve, test_release |

---

## Future Work

- AI transcription of video content
- Automatic insights from recordings
- Tester reputation and trust levels
