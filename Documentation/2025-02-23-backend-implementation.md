# Backend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up Supabase backend with schema, client, data layer, and wire dev/tester pages to real data.

**Architecture:** Supabase Auth + PostgreSQL. `profiles` extends `auth.users`. Migrations create tables; `src/lib/supabase` provides client; `src/lib/db` implements CRUD; pages use server components/actions.

**Tech Stack:** Next.js 14, @supabase/supabase-js, Supabase (Auth + Postgres + Storage for video URLs)

**Reference:** `Documentation/DATABASE_SPEC.md`, `docs/plans/2025-02-23-backend-database-strategy.md`

---

## Phase 0: Verify Prerequisites

### Task 0: Confirm env and Supabase project

**Files:** `.env.local` (already exists)

**Step 1:** Ensure `.env.local` has:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Step 2:** Verify Supabase project exists. In Supabase Dashboard → SQL Editor, run:

```sql
SELECT 1;
```

Expected: Returns 1 row.

**Step 3:** Commit if not already (no code change needed for this task).

---

## Phase 1: Install & Create Supabase Client

### Task 1: Install Supabase and create client modules

**Files:**
- Modify: `package.json`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts` (for auth session refresh)

**Step 1: Install Supabase**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Step 2: Create client (browser)**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 3: Create server client**

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

**Note:** `@supabase/ssr` is for Next.js App Router. If not available, use `createClient` from `@supabase/supabase-js` and pass URL + anon key.

**Step 4:** Check package: `@supabase/ssr` is included with `@supabase/supabase-js` in recent versions. If `createBrowserClient` doesn't exist, use:

```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 5: Commit**

```bash
git add package.json package-lock.json src/lib/supabase/
git commit -m "feat: add Supabase client"
```

---

## Phase 2: Database Migrations

### Task 2: Create migration files in Supabase

**Context:** Run migrations via Supabase Dashboard SQL Editor, or use Supabase CLI if installed.

**Files:** Create `supabase/migrations/` folder for version control (optional). For now, run SQL directly in Supabase Dashboard.

**Step 1:** In Supabase Dashboard → SQL Editor, run migration in order.

**Migration 1: Enums**

```sql
CREATE TYPE user_role AS ENUM ('developer', 'tester');
CREATE TYPE trust_level AS ENUM ('new', 'regular', 'trusted');
CREATE TYPE task_status AS ENUM ('draft', 'posted', 'claimed', 'submitted', 'completed');
CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE payment_status AS ENUM ('held', 'released', 'disputed');
```

**Step 2: Migration 2 - profiles**

```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  trust_level trust_level NOT NULL DEFAULT 'new',
  completed_tasks_count int NOT NULL DEFAULT 0,
  avg_rating numeric(3,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_trust_level ON public.profiles(trust_level);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'tester')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Step 3: Migration 3 - tasks**

```sql
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  app_url text NOT NULL,
  instructions text NOT NULL CHECK (char_length(instructions) >= 50),
  budget numeric(10,2) NOT NULL CHECK (budget >= 15 AND budget <= 30),
  platform_fee_percent int NOT NULL DEFAULT 20,
  status task_status NOT NULL DEFAULT 'draft',
  assigned_tester_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  claim_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_developer ON public.tasks(developer_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_status_created ON public.tasks(status, created_at DESC);
CREATE INDEX idx_tasks_assigned ON public.tasks(assigned_tester_id);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Developers manage own tasks" ON public.tasks
  FOR ALL USING (auth.uid() = developer_id);

CREATE POLICY "Testers read posted tasks" ON public.tasks
  FOR SELECT USING (status = 'posted' OR assigned_tester_id = auth.uid());
```

**Step 4: Migration 4 - submissions**

```sql
CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  tester_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  video_duration_seconds int NOT NULL CHECK (video_duration_seconds >= 180),
  thumbnail_url text,
  notes text,
  status submission_status NOT NULL DEFAULT 'pending',
  developer_rating int CHECK (developer_rating >= 1 AND developer_rating <= 5),
  developer_feedback text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

CREATE INDEX idx_submissions_task ON public.submissions(task_id);
CREATE INDEX idx_submissions_tester ON public.submissions(tester_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Task owner and tester can read" ON public.submissions
  FOR SELECT USING (
    tester_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.developer_id = auth.uid())
  );

CREATE POLICY "Tester can insert own" ON public.submissions
  FOR INSERT WITH CHECK (tester_id = auth.uid());

CREATE POLICY "Task owner can update" ON public.submissions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.developer_id = auth.uid())
  );
```

**Step 5: Migration 5 - transactions**

```sql
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL UNIQUE REFERENCES public.submissions(id) ON DELETE CASCADE,
  developer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tester_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  tester_earnings numeric(10,2) NOT NULL,
  platform_fee numeric(10,2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'held',
  held_at timestamptz NOT NULL DEFAULT now(),
  released_at timestamptz
);

CREATE INDEX idx_transactions_task ON public.transactions(task_id);
CREATE INDEX idx_transactions_tester ON public.transactions(tester_id);
CREATE INDEX idx_transactions_developer ON public.transactions(developer_id);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can read own transactions" ON public.transactions
  FOR SELECT USING (developer_id = auth.uid() OR tester_id = auth.uid());
```

**Step 6: Migration 6 - reviews**

```sql
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_submission ON public.reviews(submission_id);
CREATE INDEX idx_reviews_reviewee ON public.reviews(reviewee_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can read" ON public.reviews
  FOR SELECT USING (reviewer_id = auth.uid() OR reviewee_id = auth.uid());

CREATE POLICY "Reviewer can insert" ON public.reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());
```

**Step 7:** Note: Service role (used in `createAdminClient()`) bypasses RLS, so no extra policy is needed for transaction inserts.

**Step 8: Commit** (save migration SQL to repo if using supabase/migrations)

```bash
mkdir -p supabase/migrations
# Save each migration block to files like 001_enums.sql, 002_profiles.sql, etc.
git add supabase/
git commit -m "chore: add Supabase migrations"
```

---

## Phase 3: Data Layer Implementation

### Task 3: Implement src/lib/db with Supabase

**Files:** Modify `src/lib/db/index.ts`; create `src/lib/db/tasks.ts`, `submissions.ts`, `transactions.ts` (or single file).

**Step 1:** Create Supabase admin client for server-side (bypasses RLS when needed):

```typescript
// src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
```

**Step 2:** Implement db module. Use `src/lib/db/index.ts`:

```typescript
// src/lib/db/index.ts
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const db = {
  tasks: {
    async create(data: {
      developerId: string
      appUrl: string
      instructions: string
      budget: number
    }) {
      const supabase = await createClient()
      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          developer_id: data.developerId,
          app_url: data.appUrl,
          instructions: data.instructions,
          budget: data.budget,
          status: 'posted',
        })
        .select()
        .single()
      if (error) throw error
      return task
    },
    async findById(id: string) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    async findByDeveloper(developerId: string) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('developer_id', developerId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    async updateStatus(id: string, status: string, assignedTesterId?: string, claimExpiresAt?: string) {
      const supabase = await createClient()
      const payload: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
      if (assignedTesterId) payload.assigned_tester_id = assignedTesterId
      if (claimExpiresAt) payload.claim_expires_at = claimExpiresAt
      const { data, error } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
  },
  submissions: {
    async create(data: {
      taskId: string
      testerId: string
      videoUrl: string
      videoDurationSeconds: number
      notes?: string
    }) {
      const supabase = await createClient()
      const { data: sub, error } = await supabase
        .from('submissions')
        .insert({
          task_id: data.taskId,
          tester_id: data.testerId,
          video_url: data.videoUrl,
          video_duration_seconds: data.videoDurationSeconds,
          notes: data.notes,
        })
        .select()
        .single()
      if (error) throw error
      return sub
    },
    async findByTask(taskId: string) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('task_id', taskId)
      if (error) throw error
      return data
    },
    async updateStatus(id: string, status: string, developerRating?: number, developerFeedback?: string) {
      const supabase = await createClient()
      const payload: Record<string, unknown> = { status, reviewed_at: new Date().toISOString() }
      if (developerRating != null) payload.developer_rating = developerRating
      if (developerFeedback) payload.developer_feedback = developerFeedback
      const { data, error } = await supabase
        .from('submissions')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
  },
  payments: {
    async create(data: {
      taskId: string
      submissionId: string
      developerId: string
      testerId: string
      amount: number
      testerEarnings: number
      platformFee: number
    }) {
      const admin = createAdminClient()
      const { data: tx, error } = await admin
        .from('transactions')
        .insert({
          task_id: data.taskId,
          submission_id: data.submissionId,
          developer_id: data.developerId,
          tester_id: data.testerId,
          amount: data.amount,
          tester_earnings: data.testerEarnings,
          platform_fee: data.platformFee,
        })
        .select()
        .single()
      if (error) throw error
      return tx
    },
    async release(transactionId: string) {
      const admin = createAdminClient()
      const { data, error } = await admin
        .from('transactions')
        .update({ status: 'released', released_at: new Date().toISOString() })
        .eq('id', transactionId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    async findByTester(testerId: string) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('tester_id', testerId)
      if (error) throw error
      return data
    },
  },
}
```

**Step 3:** Fix server client if using `@supabase/ssr` – check if package exists. If not:

```bash
npm install @supabase/ssr
```

**Step 4:** Add path alias in `tsconfig.json` for `@/`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Step 5: Commit**

```bash
git add src/lib/
git commit -m "feat: implement db layer with Supabase"
```

---

## Phase 4: Seed Data (Optional)

### Task 4: Seed dev data for testing

**Files:** Create `supabase/seed.sql` or run in SQL Editor.

**Step 1:** Create test users via Supabase Auth UI or:

```sql
-- Manually create users in Auth, then insert profiles. Or use Supabase Auth signup.
-- For seed, assume you have 2-3 user IDs from auth.users. Insert into profiles if not exists.
-- Then insert tasks:
INSERT INTO public.tasks (developer_id, app_url, instructions, budget, status)
VALUES
  ('REPLACE_WITH_DEV_UUID', 'https://example.com', 'Test the login flow. Try to sign up and note any confusion.', 25, 'posted'),
  ('REPLACE_WITH_DEV_UUID', 'https://myapp.com', 'Test checkout. Add item to cart and go through payment.', 30, 'posted');
```

**Step 2:** Or skip seed and create users/tasks through the app after Auth is wired.

---

## Phase 5: Wire Auth & Pages (Next Phase)

**Out of scope for this plan:** Full auth flow (signup/signin pages with Supabase Auth), wiring each page to `db`. That will be a separate plan.

This plan stops at: migrations applied, client + db layer ready.

---

## Execution Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 0 | Verify env | Pending |
| 1 | Install Supabase, create client | Pending |
| 2 | Run migrations | Pending |
| 3 | Implement db layer | Pending |
| 4 | Seed (optional) | Pending |

---

*End of Implementation Plan*
