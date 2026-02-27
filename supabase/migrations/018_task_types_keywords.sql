-- Multi-select task types + custom keywords
-- task_types: array of predefined types (login_flow, checkout, etc.) and/or custom keywords

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS task_types text[] DEFAULT '{}';

-- Backfill from existing task_type
UPDATE public.tasks
SET task_types = ARRAY[task_type]::text[]
WHERE task_type IS NOT NULL AND (task_types IS NULL OR task_types = '{}');

-- Index for marketplace filtering (GIN for array containment)
CREATE INDEX IF NOT EXISTS idx_tasks_task_types ON public.tasks USING GIN (task_types);
