# Trust and Safety Examples

Here are realistic examples of how to use this skill:

---

## Example 1: Paid App Testing Platform

**User Query:**
> "Users submit bug reports for cash. How do I verify the reports are real and prevent gaming the system?"

**Verification Rules:**
| User Tier | Required Proof | Payout Hold |
|-----------|----------------|-------------|
| New (<5 tasks) | Email + phone | 7 days |
| Regular (5-20 tasks) | + device ID | 3 days |
| Trusted (20+ tasks, 4.5+ rating) | + ID doc | 24 hours |

**Acceptance Criteria:**
- **Auto-pass:** Screenshot + steps + device info
- **Auto-fail:** Blurry image, no reproduction steps, duplicate
- **Review:** Screenshot without steps → auto-escalate

**Fraud Detection Signals:**
- Same device submits >3 reports/day
- Account age < 24 hours with submissions
- Copy-paste text across multiple reports
- Screenshots with identical metadata
- IP switching within session

**Payout Conditions:**
- Minimum 3 tasks completed
- Trust score > 50
- Average rating > 3.0
- 7-day hold for new users

**Dispute Policy:**
1. Tester submits dispute within 48 hours
2. Provide evidence (screenshots, logs)
3. Developer responds within 24 hours
4. Platform mediates final decision
5. Repeat offenders flagged for review

---

## Example 2: Design Contest Platform

**User Query:**
> "How do I prevent designers from copying each other or submitting stolen work?"

**Proof Requirements:**
- Designers submit source files (AI, PSD, Figma)
- Timestamp verification
- Portfolio verification for top tier

**Acceptance Criteria:**
- **Auto-pass:** Vector format, editable layers, matches brief
- **Auto-fail:** Raster only, stock elements detected, AI-generated
- **Review:** Stock elements → check with reverse image search

**Fraud Detection:**
- Similarity scoring between submissions
- Stock image detection (API)
- Same designer entering same contest twice
- Banned designer network detection

**Quality Thresholds:**
- Must have: 2-3 concepts, color variations
- Must meet: Brief requirements, file format
- Bonus: Case studies, mockups

**Moderation Flow:**
1. Auto-check on submission (30 seconds)
2. Flag for human review if >70% similarity
3. Human review within 4 hours
4. Notify designer of acceptance/rejection
5. Appeal process for disputes

---

## Example 3: User Research Panel

**User Query:**
> "Companies pay for user interviews. How do I verify participants show up and don't just repeat scripts?"

**Verification Levels:**
| Study Type | Verification | Trust Score Required |
|------------|--------------|----------------------|
| Survey | Email only | 10+ |
| Interview (screening) | Video verification | 30+ |
| In-person | ID + photo | 50+ |
| Expert interview | LinkedIn + portfolio | 70+ |

**Attendance Tracking:**
- Video interviews: Auto-record, flag no-shows
- Surveys: Time-on-page detection (minimum 2 min)
- In-person: Check-in app with GPS + photo

**Anti-Gaming:**
- Attention checks in surveys (hidden questions)
- Speed detection (<30 seconds for 2-min survey)
- Duplicate detection across responses
- Pattern detection in open-text answers

**Payout Gating:**
- No-show = strike + partial payment withheld
- Late (>15 min) = 50% payment
- Completed on time = full payment + bonus
- 3 strikes = 30-day suspension

**Reputation Model:**
- Show up rate (attendance)
- Response quality (company rating)
- Professionalism (communication)
- Expertise depth (screener completion)

---

## Example 4: Content Moderation for Paid Reviews

**User Query:**
> "Users get paid to write app reviews. How do I prevent fake reviews and abuse?"

**Proof Requirements:**
- Must actually install/use the app (device verification)
- Minimum session time (30+ seconds)
- Review length (50+ words)

**Detection Signals:**
- Same reviewer writes multiple app reviews in 1 hour
- Reviews use template language
- Review timing matches promotional campaigns
- Device/network correlation between reviewers

**Acceptance Criteria:**
- **Auto-pass:** Unique content, meets length, verified install
- **Auto-fail:** Template, too short, no install proof, copied
- **Review:** Suspicious patterns → human check

**Trust Score Calculation:**
- Account age: +5 per month
- Verified install: +20
- Review accepted: +10
- Review rejected: -15
- Report filed (valid): +5

**Abuse Prevention:**
- One review per app per account
- 24-hour delay between install and review eligibility
- Review rotation (random subset sent to manual review)
- Companies cannot directly pay reviewers (platform mediates)
