# MVP: Authentic User Testing Platform

## 1. Core User Outcome
**"Devin the Indie Developer" hires this product to:** Get a 5-10 minute screen recording of a real stranger attempting to use his app, with live voice narration explaining their thought process and confusion points — so he can fix UX issues before shipping.

If we can't deliver a watchable, narrated video of a real human attempting to use his app, nothing else matters.

## 2. User Journey (MVP Scope)
1. Developer submits app URL + task instructions
2. Tester claims task, records screen+voice, uploads video
3. Developer watches video, approves submission
4. Platform releases payment to tester

## 3. Feature MoSCoW

| Must Have | Should Have | Could Have | Won't Have (v1) |
|-----------|-------------|------------|-----------------|
| Developer submits app URL + task brief | Task templates library | Tester matching by demographic | Public marketplace listing |
| Tester records screen (Loom/screen rec) | Video timestamps/chapters | Defender detects "fake" testers | Team workspaces |
| Simple video upload | Email notifications | Testers browse tasks | White-label |
| Developer watches video | Basic rating system | Tester profiles | API access |
| Payment to tester (manual or Stripe) | Task categories | Badge/levels for testers | Mobile app |
| Simple dashboard (list tasks + videos) | Search/filter tasks | Referral program | Automated QA scoring |

## 4. Scope Cuts & Rationale

| Cut | Rationale |
|-----|-----------|
| No automated tester matching | Manual assignment is fine for MVP. We'll assign testers ourselves until volume justifies algorithm. |
| No public task marketplace | Developers post → testers apply. Keeps quality higher. Public listing attracts low-quality submissions. |
| No mobile app | Mobile-responsive web is enough for v1. Testers can record on mobile; developers watch on desktop. |
| No API | Nobody needs API on day one. Build it when a customer asks. |
| Manual payment initially | Use Stripe Connect or manual payouts. Full marketplace payment rails are complex. |

## 5. V1 Roadmap (6 Weeks)

| Week | Focus | Deliverable |
|------|-------|-------------|
| 1-2 | Core Infrastructure | Next.js app, database schema, auth (Clerk), basic dashboard |
| 3 | Tester Submission Flow | Screen recording flow (link to Loom or embed), video upload to S3 |
| 4 | Developer Review | Video playback, approve/reject, simple rating |
| 5 | Payment Flow | Stripe Connect or manual payouts, escrow hold |
| 6 | Polish & Launch | Onboarding emails, first 5 developers, first 20 testers |

## 6. Assumptions to Validate Post-Launch
- [ ] Developers will pay $15-30 per video test
- [ ] Testers will record for $5-10 per test
- [ ] Video + voice narration is valuable (not just screen replay)
- [ ] Indie devs have enough apps to test (not one-time)
- [ ] We can recruit quality testers without huge spend
