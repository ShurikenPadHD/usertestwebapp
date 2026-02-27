# Marketplace Design Examples

Here are realistic examples of how to use this skill:

---

## Example 1: Paid App Testing Platform

**User Query:**
> "I'm building a platform where app developers pay users to test their apps and submit bug reports. How should I design the marketplace?"

**Analysis:**
- **Two sides:** Demand = app developers; Supply = testers
- **Atomic unit:** One developer + one tester for one test session
- **Single-player mode:** Partially — developers can see existing bug reports, but need testers for active testing

**Supply Strategy:**
- Recruit from: QA communities, student testers, app enthusiasts
- Incentives: Guaranteed payout ($5-20/test), leaderboards, badges
- Quality control: Require proof of device, track submission quality

**Demand Strategy:**
- Target: Indie app developers, small studios
- Channels: Dev communities (Reddit, Discord), Twitter, Product Hunt
- Pricing: Flat fee per test + bonus for critical bugs

**Pricing Model:**
- Developer pays: $15-50 per test
- Platform takes: 20%
- Tester earns: $12-40 per test (rest held for disputes)

**Matching Model:** Hybrid — developers post test requirements, qualified testers apply

**Reputation Loop:** Testers rated on: bug quality, report clarity, timeliness. Developers rated on: payout speed, clear requirements.

**Launch Sequence:**
1. Phase 1: Recruit 50 testers manually (invite-only)
2. Phase 2: Partner with 5 developers for beta
3. Phase 3: Open signup, refine based on feedback

---

## Example 2: Freelance Design Contest Platform

**User Query:**
> "I want to build a platform where companies run design contests (logo, UI, branding) and multiple designers submit entries. Winner gets paid. How do I make this work?"

**Analysis:**
- **Two sides:** Demand = businesses; Supply = designers
- **Atomic unit:** One business + 10-50 designers for one contest
- **Single-player mode:** Designers can browse past contests and briefs

**Liquidity Strategy:**
- Geographic focus: US/UK English-speaking first
- Category: Logo design → expand to UI, branding
- Price: $300-2000 contests (mid-market)

**Pricing Model:**
- Business pays: Contest fee upfront to platform
- Designer submits: Free to enter
- Winner paid: 70% of contest value
- Platform keeps: 30% (includes payment processing, disputes)

**Matching Model:**
- Business posts brief → Designers submit → Business picks winner
- Algorithm ranks by: portfolio match, contest history, ratings

**Reputation Loop:**
- Designer ratings (post-contest)
- Business ratings (payout speed, brief clarity)
- Portfolio verification

**Failure Prevention:**
- Refund policy for poor submissions
- IP transfer only after payment
- Automatic dispute mediation

---

## Example 3: Paid User Research Panel

**User Query:**
> "I'm building a marketplace where companies can pay to interview or survey target users. Users get paid for their time and insights."

**Analysis:**
- **Two sides:** Demand = companies (product managers, researchers); Supply = participants
- **Atomic unit:** One company + one participant for one session
- **Single-player mode:** Participants can browse available studies

**Supply Strategy:**
- Recruit: Parents, professionals, niche communities
- Incentives: $20-200/hour depending on expertise
- Verification: ID verification for high-paying studies

**Demand Strategy:**
- Target: UX researchers, product managers, startups
- Channels: LinkedIn, UX communities, cold outreach
- Pricing: Subscription (credits) or per-study

**Matching Model:** Platform matches based on: demographics, expertise, availability

**Trust & Safety:**
- Participants must verify identity for payout
- Companies must verify business for posting
- Both rate each other after session
- Escrow holds funds until session completes

**Cold Start:**
- Founder personally recruits participants from own network
- Offer free studies to build participant base
- Then recruit companies with "guaranteed respondents"
