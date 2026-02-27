-- Sync changes from dashboard and fix task claiming logic

-- 1. Sync: Add the policy for reading profiles (which you added in dashboard)
-- We use DO block to avoid error if it already exists when running locally
DO $$ BEGIN
  CREATE POLICY "Profiles are readable by authenticated users" ON public.profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Fix: Drop the broken "Testers can claim posted tasks" policy if it exists
DROP POLICY IF EXISTS "Testers can claim posted tasks" ON public.tasks;

-- 3. Fix: Create the correct policy for claiming tasks
-- Logic:
--   USING: The task must be 'posted' and currently have NO tester assigned.
--   WITH CHECK: The new state must have the current user as the assigned tester.
CREATE POLICY "Testers can claim posted tasks" ON public.tasks
  FOR UPDATE
  USING (status = 'posted' AND assigned_tester_id IS NULL)
  WITH CHECK (assigned_tester_id = auth.uid());
