# UserTest – Hackathon Demo Script

**Live URL:** `https://TODO-your-vercel-app.vercel.app`  
**Repo:** `https://github.com/TODO/your-repo`

---

## Prerequisites

- **Google account** (used for sign-in; no email/password required)
- **Popup allowed** – Google OAuth may open a popup; allow it if blocked
- **Test mode** – Seeded/demo data allowed. Stripe in test mode; no real money.
- **Supabase auth cookies** – App uses Supabase session cookies; ensure cookies enabled.

---

## End-to-End Test Script

### A) Developer: Sign in → Create task

1. Open **Landing:** `https://TODO-your-vercel-app.vercel.app/`
2. Click **"For Developers"** or go to **`/dev/signin`**
3. Click **"Sign in with Google"** → complete Google OAuth
4. You land on **`/dev`** (dashboard)
5. Click **"New Task"** or go to **`/dev/tasks/new`**
6. Fill: app URL, title, brief, budget, steps → **Create Task**
7. You land on **`/dev/tasks`** → click the new task to open **`/dev/tasks/[id]`**

**Direct links (replace `BASE` with your live URL):**
- `BASE/dev/signin`
- `BASE/dev`
- `BASE/dev/tasks/new`
- `BASE/dev/tasks` (list)

---

### B) Tester: Sign in → Browse → Submit recording

1. **Sign out** (or use incognito / different browser)
2. Open **`/tester/signin`** → click **"Sign in with Google"**
3. You land on **`/tester/available`** (browse tasks)
4. Click a task → **`/tester/tasks/[id]`** (task brief)
5. Click **"Start Recording"** or **"Submit"** → **`/tester/tasks/[id]/submit`**
6. **Upload flow:** Click **"Choose File"** → fake progress bar runs → **"Upload Complete!"**
7. Add optional notes → **"Submit for Review"**
8. You land on **`/tester/my-tests`**
9. Go to **`/tester/earnings`** to see balance (updates after developer approves)

**Placeholder video path:** Real file upload is not implemented. The UI simulates upload; the backend stores `https://placeholder.test/submission-pending`. The submission record is created and the full approve/reject flow works. The developer will see the submission card and approve/reject UI; the video player may not play (placeholder URL).

**Direct links:**
- `BASE/tester/signin`
- `BASE/tester/available`
- `BASE/tester/tasks/[id]` (replace `[id]` with task ID from step A)
- `BASE/tester/tasks/[id]/submit`
- `BASE/tester/earnings`

---

### C) Developer: Watch → Approve → Confirm earnings

1. Go back to **`/dev/tasks/[id]`** (same task from step A)
2. You see the new submission in **TaskReviewPanel** (video player + approve/reject)
3. **Watch** – Video may not play (placeholder URL); metadata (tester name, duration, notes) is visible
4. Click **Approve** (optionally set star rating) or **Reject** (with feedback)
5. After approve: task status → completed; tester wallet credited
6. **Tester:** Refresh **`/tester/earnings`** → balance updated

---

## Expected Outcomes

| Step | What the judge should see |
|------|---------------------------|
| A1–A2 | Landing page loads; Developer sign-in page with Google button |
| A3 | Google OAuth popup/redirect; returns to `/dev` |
| A4 | Developer dashboard with task list |
| A5–A6 | Task creation form; new task appears in list |
| A7 | Task detail page with TaskReviewPanel (empty until tester submits) |
| B1–B3 | Tester sign-in; lands on available tasks |
| B4–B5 | Task brief; link to submit page |
| B6–B7 | Simulated upload (progress bar); Submit creates submission |
| B8–B9 | My Tests; Earnings page (balance may be $0 until approval) |
| C1–C4 | Submission visible; Approve/Reject works |
| C5–C6 | Task completed; Tester earnings updated |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| **Google popup blocked** | Allow popups for the site, or retry (redirect flow may be used) |
| **Wrong Supabase redirect URL** | In Supabase Dashboard → Auth → URL Configuration: add `https://YOUR-VERCEL-URL/auth/callback` to Redirect URLs |
| **Stuck on auth callback** | Check `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel env vars |
| **401 / redirect loops** | Clear cookies for the site; sign in again |
| **Video doesn’t play** | Expected – placeholder URL. Approve/reject flow still works. |

**Supabase redirect URL for production:**  
`https://YOUR-PROJECT.supabase.co/auth/v1/callback`  
Add your Vercel URL to Supabase: Auth → URL Configuration → Redirect URLs.

---

## Notes for Judges

- **Seeded data allowed** – You may seed tasks/users for demos.
- **Stripe test mode** – Add Funds uses Stripe test mode; no real charges.
- **Placeholder video** – Upload is simulated; video URL is a placeholder. Submission creation and grading flow are real.
- **Two roles** – Use two Google accounts (or incognito) to test Developer vs Tester flows.
- **No email/password required** – Demo uses Google Sign-In only.
- **Tester payouts** – Testers can set up Stripe Connect and request payout from `/tester/earnings` (optional demo step).
