# Video Insights Analysis – Setup & Database Guide

## Overview

The product has two AI analysis flows:

1. **Guardrail analysis** (`video-analysis.ts`) – Yes/no decision on submission validity. Stored in `submissions.ai_analysis`.
2. **Insights analysis** (`video-insights-analysis.ts`) – Structured product/UX findings for developers. Stored in `submission_insights`.

## Database Schema

### New Tables

#### `submission_insights`

| Column         | Type         | Description                                      |
|----------------|--------------|--------------------------------------------------|
| id             | uuid         | Primary key                                      |
| submission_id  | uuid         | FK → submissions(id), UNIQUE (one insights per submission) |
| findings       | jsonb        | Array of RITE findings from the AI               |
| provider       | text         | `gemini` or `openai`                             |
| analyzed_at    | timestamptz  | When the analysis ran                            |
| created_at     | timestamptz  | Row creation time                                |

**Relationship:** `submission_insights.submission_id` → `submissions.id` (ON DELETE CASCADE)

### New Task Columns (Developer Context)

| Column              | Type    | Description                                  |
|---------------------|---------|----------------------------------------------|
| test_goal            | text    | What the developer wants to learn            |
| focus_areas          | text[]  | Areas to focus on (e.g. checkout, onboarding)|
| success_definition   | text    | How success is defined                       |
| target_persona       | text    | Target user persona                          |
| key_feature          | text    | Main feature under test                      |

These are optional and feed the insights prompt. If missing, the AI uses `about`, `requirements`, etc.

## Data Flow

```
submissions (video_url, task_id)
    ↓
submission_insights (findings jsonb)
    ↑
tasks (test_goal, focus_areas, success_definition, target_persona, key_feature)
```

- One `submission_insights` row per submission.
- Insights are generated when the developer clicks “Generate insights” on the review page.
- The API uses `submission.video_url` and `task` context to call the AI and store results.

## Running Migrations

### Option A: Supabase Dashboard

1. Open your project → SQL Editor.
2. Run each migration file in order:
   - `supabase/migrations/020_submission_insights.sql`
   - `supabase/migrations/021_task_developer_context.sql`

### Option B: Supabase CLI

```bash
supabase db push
```

Or run migrations manually:

```bash
supabase migration up
```

## RLS Policies

`submission_insights` uses RLS so that:

- **SELECT:** Only the task owner (developer) can read insights for their submissions.
- **INSERT:** Only the task owner can create insights for their submissions.
- **UPDATE:** Only the task owner can update insights.

The API uses `createClient()` with the user’s session, so `auth.uid()` is the developer.

## API Endpoints

- **POST** `/api/submissions/[id]/insights` – Generate insights for a submission (requires auth, task owner).
- **GET** `/api/submissions/[id]/insights` – Fetch existing insights for a submission.

## Findings JSON Structure

Each finding in the `findings` array:

```json
{
  "dimension": "Experience Quality",
  "dev_focus": "checkout flow",
  "severity": "high",
  "timestamp_sec": 245,
  "title": "Confusing checkout button",
  "problem": "User couldn't find the payment button.",
  "impact": "Abandoned before completing purchase.",
  "cause": "Button is below the fold and not visually distinct.",
  "recommendation": "Move CTA above the fold and add a subtle background color."
}
```

## Adding More Tables Later

1. Create a new migration file in `supabase/migrations/` (e.g. `022_my_table.sql`).
2. Use `CREATE TABLE` with `REFERENCES` for foreign keys.
3. Enable RLS and add policies for the relevant roles.
4. Run the migration.

Example for a future table:

```sql
CREATE TABLE public.my_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  -- other columns
);

ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Task owner can read" ON public.my_table
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.submissions s
      JOIN public.tasks t ON t.id = s.task_id
      WHERE s.id = my_table.submission_id AND t.developer_id = auth.uid()
    )
  );
```
