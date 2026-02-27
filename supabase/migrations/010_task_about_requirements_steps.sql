-- Add structured sections: About this Task, Requirements, What to Test
-- Mirrors the tester task detail view

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS about text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS requirements text[] DEFAULT '{}';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS steps text[] DEFAULT '{}';

-- Relax instructions: when using steps[], we may use instructions as fallback/legacy
ALTER TABLE public.tasks ALTER COLUMN instructions DROP NOT NULL;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_instructions_check;
