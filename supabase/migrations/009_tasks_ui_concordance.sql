-- Concordance UI Developer ↔ Database ↔ Marketplace Tester
-- Adds fields from Create New Test form and tester marketplace display

-- Extend budget constraint: UI uses $15–$50 (was 15–30)
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_budget_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_budget_check
  CHECK (budget >= 15 AND budget <= 50);

-- Task type (Login Flow, Checkout, Signup, Navigation, Onboarding)
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS task_type text;

-- Short title for marketplace (e.g. "Test Signup", derived from task_type by default)
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS title text;

-- Number of testers wanted
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS max_testers int NOT NULL DEFAULT 1;

-- Estimated duration (minutes) for filters/display
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS estimated_duration_minutes int;

-- Difficulty: Easy, Medium, Hard
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS difficulty text;

-- Platform: Web, Mobile (iOS), Mobile (Android)
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS platform text;

-- Constraints for controlled vocabularies
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_task_type_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_task_type_check
  CHECK (task_type IS NULL OR task_type IN ('login_flow', 'checkout', 'signup', 'navigation', 'onboarding'));

ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_difficulty_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_difficulty_check
  CHECK (difficulty IS NULL OR difficulty IN ('easy', 'medium', 'hard'));

ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_platform_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_platform_check
  CHECK (platform IS NULL OR platform IN ('web', 'mobile_ios', 'mobile_android'));

ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_max_testers_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_max_testers_check
  CHECK (max_testers >= 1 AND max_testers <= 100);

-- Index for marketplace filters
CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON public.tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_tasks_budget ON public.tasks(budget);
CREATE INDEX IF NOT EXISTS idx_tasks_platform ON public.tasks(platform);
