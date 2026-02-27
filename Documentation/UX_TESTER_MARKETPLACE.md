# UX Specification: Tester Marketplace

> **Status:** Final Specification  
> **Model:** Marketplace (Browse → Claim → Perform → Submit → Earn)  
> **Version:** 1.0  
> **Aligned with:** MVP.md, MARKETPLACE.md, UX.md

---

## 1. Tester Journey (Marketplace Model)

### End-to-End Flow

```
Landing CTA → Sign Up → Available Tests (Marketplace) → Browse & Claim → My Tests → Task Brief → Record → Submit → (Wait) → Approved → Earnings → Payout
```

### Detailed Journey Steps

| # | Step | Description |
|---|------|-------------|
| 1 | **Landing CTA** | User clicks "Become a Tester" from marketing landing |
| 2 | **Sign Up** | Email registration, profile setup, experience level |
| 3 | **Available Tests** | Browse marketplace grid, filter, search, compare |
| 4 | **Claim Test** | One-click claim locks the test for 30 minutes |
| 5 | **My Tests** | View all claimed/in-progress tests |
| 6 | **Task Brief** | Read instructions, open app URL, understand requirements |
| 7 | **Record** | Screen recorder UI, record/stop, preview |
| 8 | **Submit** | Upload video, add notes, submit for review |
| 9 | **Wait for Review** | Developer reviews submission |
| 10 | **Approved** | Payment released to escrow |
| 11 | **Earnings** | View balance, transaction history |
| 12 | **Payout** | Request payout to bank/PayPal |

---

## 2. Screens & Actions

### Primary Screens

| Screen | Route | Actions | Key Elements |
|--------|-------|---------|--------------|
| **Landing CTA** | `/` | Click "Become a Tester" | Hero, value prop, CTA button |
| **Tester Sign Up** | `/tester/signup` | Register, select role | Email, profile, experience level |
| **Available Tests** | `/tester/available` | Browse, filter, search, claim | Marketplace grid, filters, search bar, pagination |
| **My Tests** | `/tester/my-tests` | View claimed, in-progress, submitted | Task list with status, continue/submit actions |
| **Task Brief** | `/tester/tasks/[id]` | Read instructions, start recording | App link, task steps, requirements, timer |
| **Recording** | `/tester/tasks/[id]/record` | Record screen + voice, stop, preview | Recorder UI, timer, preview modal |
| **Submit** | `/tester/tasks/[id]/submit` | Upload video, add notes, submit | Upload progress, preview, notes field |
| **Earnings** | `/tester/earnings` | View balance, history, payout | Balance card, transaction list, payout button |
| **Settings** | `/tester/settings` | Profile, verification, preferences | Profile form, payment method, notifications |

### Secondary Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| **Tester Dashboard** | `/tester` | Redirects to Available Tests |
| **Payouts** | `/tester/payouts` | Alias for Earnings (historical) |

---

## 3. Navigation Model

### Primary Tester Navigation

```
┌─────────────────────────────────────────────┐
│  UserTest          Available Tests  [Avatar] │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │ ✓ Available Tests (default)             ││
│  │   My Tests                             ││
│  │   Earnings                             ││
│  │   Settings                             ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

### Nav Items

| Label | Route | Icon | Notes |
|-------|-------|------|-------|
| **Available Tests** | `/tester/available` | Search | Primary, default view |
| **My Tests** | `/tester/my-tests` | ListChecks | Claimed + submitted |
| **Earnings** | `/tester/earnings` | Wallet | Balance + history |
| **Settings** | `/tester/settings` | Settings | Profile + prefs |

---

## 4. State Transitions

### Test Lifecycle (Tester Perspective)

```
┌────────────┐     ┌──────────┐     ┌────────────┐     ┌───────────┐     ┌──────────┐     ┌───────┐
│ AVAILABLE  │────▶│ CLAIMED  │────▶│ IN_PROGRESS│────▶│ SUBMITTED │────▶│ APPROVED │────▶│ PAID  │
│ (Marketplace)   │ (Locked)     │ (Recording)    │ (Pending)    │ (Released)   │         │
└────────────┘     └──────────┘     └────────────┘     └───────────┘     └──────────┘     └───────┘
       │                                    │                   │                │
       │                                    │                   ▼                │
       │                                    │            ┌───────────┐          │
       │                                    │            │ REJECTED  │◀─────────┘
       │                                    │            │ (Feedback)│          (resubmit)
       │                                    │            └───────────┘          │
       │                                    │                                    │
       └────────────────────────────────────┘                                    │
              (expired / abandoned)                                              │
                                                                         ┌───────────┐
                                                                         │  DISPUTED │
                                                                         └───────────┘
```

### State Details

| State | Description | Duration | Tester Action |
|-------|-------------|----------|---------------|
| **AVAILABLE** | Listed in marketplace, unclaimed | Until claimed | Browse, filter, claim |
| **CLAIMED** | Locked by tester, not started | 30 min timer | Start recording or release |
| **IN_PROGRESS** | Recording in progress | Max 60 min | Record, stop, preview |
| **SUBMITTED** | Awaiting developer review | 24-72h | Wait, cannot edit |
| **APPROVED** | Developer accepted | Immediate | View in My Tests, earnings updated |
| **REJECTED** | Developer rejected | N/A | View feedback, resubmit allowed |
| **PAID** | Funds in wallet | N/A | View in Earnings |

### Claim Expiration

- **Claim Duration:** 30 minutes to start recording
- **Extension:** Not available in v1
- **Expired Action:** Test returns to AVAILABLE pool

---

## 5. Empty States

### 5.1 No Available Tests

```
┌─────────────────────────────────────────────┐
│                                             │
│              🔍 No tests available          │
│                                             │
│    There are no tests matching your          │
│    criteria right now. Check back later!    │
│                                             │
│         [Refresh Available Tests]           │
│                                             │
└─────────────────────────────────────────────┘
```

### 5.2 No Claimed Tests

```
┌─────────────────────────────────────────────┐
│                                             │
│              📋 No claimed tests            │
│                                             │
│    You haven't claimed any tests yet.       │
│    Browse the marketplace to find work!    │
│                                             │
│        [Browse Available Tests]            │
│                                             │
└─────────────────────────────────────────────┘
```

### 5.3 No Earnings

```
┌─────────────────────────────────────────────┐
│                                             │
│              💰 No earnings yet             │
│                                             │
│    Complete your first test to start        │
│    earning money!                           │
│                                             │
│        [Browse Available Tests]            │
│                                             │
└─────────────────────────────────────────────┘
```

### 5.4 No Submissions

```
┌─────────────────────────────────────────────┐
│                                             │
│            📤 No submissions yet             │
│                                             │
│    You haven't submitted any videos.        │
│    Complete a test to see it here!         │
│                                             │
│        [Browse Available Tests]            │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 6. Edge Cases

### 6.1 Test Already Claimed

**Scenario:** Tester views a test that was just claimed by someone else.

**UI Behavior:**
- Card shows "Just Claimed" badge
- "Start Test" button disabled
- Toast notification: "This test was just claimed. Browse other tests!"

### 6.2 Claim Expired

**Scenario:** Tester claimed but didn't start within 30 minutes.

**UI Behavior:**
- Test removed from "My Tests"
- Test returns to "Available Tests" marketplace
- Toast notification: "Your claim expired. The test is back in the marketplace."

### 6.3 Submission Rejected & Resubmit Flow

**Scenario:** Developer rejects the submission with feedback.

**UI Behavior:**
- Task appears in "My Tests" with "Needs Resubmission" status
- Feedback message displayed (developer_feedback)
- "Resubmit" button available
- New 30-minute timer starts (optionnel, selon implémentation)

**Resubmit Flow (REJECTED → nouvelle soumission):**
1. Tester clique "Resubmit" (ou "Start Recording" sur la tâche rejetée)
2. Redirection vers Task Brief → Recording (même flow que première tentative)
3. Tester enregistre une nouvelle vidéo, soumet
4. Nouvelle ligne `submissions` créée (status pending) ; l’ancienne reste rejetée en historique
5. Developer review de la nouvelle soumission

### 6.4 Deadline Passed

**Scenario:** Test had a deadline and tester didn't submit in time.

**UI Behavior:**
- Claim automatically released
- Test returns to marketplace
- No penalty in v1 (track for future trust system)

### 6.5 Upload Failed

**Scenario:** Video upload fails due to network/error.

**UI Behavior:**
- Retry button prominently displayed
- Upload progress preserved
- Error message with specific issue
- Support contact link

### 6.6 Duplicate Claim

**Scenario:** Tester accidentally clicks claim twice.

**UI Behavior:**
- Second claim attempt ignored
- Already claimed toast shown
- Test appears in "My Tests"

---

## 7. Interaction Patterns

### 7.1 Browse & Filter

**Search:**
- Keyword search by app name, domain, or task title
- Debounced input (300ms)

**Filters:**
| Filter | Options | Type |
|--------|---------|------|
| Category | All, E-commerce, SaaS, Social, Other | Dropdown |
| Platform | All, Web, Mobile (iOS), Mobile (Android) | Dropdown |
| Duration | All, < 5 min, 5-10 min, 10+ min | Dropdown |
| Payout | All, $15-20, $20-30, $30+ | Dropdown |
| Difficulty | All, Easy, Medium, Hard | Dropdown |

**Quick Filters:**
- `< 5 mins` - Short tests
- `High Paying` - $30+ tests
- `Mobile Apps` - Mobile-specific tests

**Sort:**
- Recommended (default algorithm)
- Highest Payout
- Newest First

### 7.2 Claim Flow

1. Tester clicks "Start Test" on card
2. Confirmation modal: "Claim this test?"
3. On confirm → Test moves to "My Tests"
4. 30-minute timer starts
5. Toast: "Test claimed! You have 30 min to start."

### 7.3 Recording Flow

1. Tester opens Task Brief
2. Reviews app URL, instructions, requirements
3. Clicks "Start Recording"
4. Browser screen recorder starts (Loom or native)
5. Tester performs tasks while recording
6. Clicks "Stop"
7. Preview plays
8. If good → Proceed to Submit
9. If bad → Discard and re-record

### 7.4 Submit Flow

1. Upload video (max 100MB, MP4/MOV/WebM)
2. Progress bar shows upload status
3. Preview auto-plays on completion
4. Optional: Add notes for developer
5. Click "Submit for Review"
6. Success: Test moves to "Submitted" status
7. Redirect to "My Tests" with success toast

---

## 8. Alignment Check

### ✅ MVP Scope Alignment

| MVP Feature | Marketplace Spec | Status |
|-------------|------------------|--------|
| Tester submits app URL + task brief | Task Brief screen | ✅ |
| Tester claims task | Available Tests + Claim flow | ✅ |
| Tester records screen+voice | Recording screen | ✅ |
| Simple video upload | Submit screen | ✅ |
| Payment to tester | Earnings + Payout | ✅ |
| Simple dashboard | Available Tests (default) | ✅ |

### ✅ Marketplace Model Alignment

| MARKETPLACE.md Feature | Implementation |
|-----------------------|-----------------|
| Browse → Claim → Perform → Submit → Earn | Complete end-to-end flow |
| One-click claim | Implemented |
| 30-min lock timer | Implemented |
| Escrow payment | Earnings state |
| Tester ratings | Future v2 (not in v1) |

### ✅ Route Alignment

| Spec Route | Implemented Route | Status |
|------------|------------------|--------|
| Available Tests | `/tester/available` | ✅ |
| My Tests | `/tester/my-tests` | ✅ |
| Earnings | `/tester/earnings` | ✅ |
| Settings | `/tester/settings` | ✅ |
| Task Brief | `/tester/tasks/[id]` | ✅ |
| Recording | `/tester/tasks/[id]/record` | ✅ |
| Submit | `/tester/tasks/[id]/submit` | ✅ |

### ✅ UI Consolidation Alignment

| UI Element | Design System Token |
|------------|-------------------|
| Background | `#0a0a0a` |
| Cards | Glassmorphism (`bg-white/5`, `backdrop-blur`) |
| Borders | `border-white/10` |
| Primary Accent | Blue `#3b82f6` |
| Secondary Accent | Purple `#8b5cf6` |
| Transitions | `duration-200` |

---

## 9. V1 Out of Scope

The following are explicitly NOT in v1:

- ❌ Tester matching by demographics
- ❌ Public marketplace listing (invite-only)
- ❌ Tester profiles visible to developers
- ❌ Automated tester verification
- ❌ Dispute resolution system
- ❌ Referral program
- ❌ Test analytics for testers
- ❌ Mobile app for testers

---

## 10. Success Metrics (v1)

| Metric | Target |
|--------|--------|
| Tester conversion from landing | 5% |
| Claim-to-submission rate | 70% |
| Average time to claim | < 2 min |
| Average submission time | < 24 hours |
| Rejection rate | < 15% |
| Tester satisfaction | > 4.0 ★ |

---

*End of Specification*
