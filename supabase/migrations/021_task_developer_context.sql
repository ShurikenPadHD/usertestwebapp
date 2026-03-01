-- Developer test intent fields for the insights analysis prompt
-- Used by video-insights-analysis to provide context to the AI

ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS test_goal text,
ADD COLUMN IF NOT EXISTS focus_areas text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS success_definition text,
ADD COLUMN IF NOT EXISTS target_persona text,
ADD COLUMN IF NOT EXISTS key_feature text;

CREATE INDEX IF NOT EXISTS idx_tasks_focus_areas ON public.tasks USING GIN (focus_areas);
