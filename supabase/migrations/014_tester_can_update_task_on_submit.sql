-- Allow assigned tester to update task when submitting (status claimed -> submitted)
-- Without this, RLS blocks the update and .single() returns 0 rows -> PGRST116

CREATE POLICY "Assigned tester can update task on submit" ON public.tasks
  FOR UPDATE USING (assigned_tester_id = auth.uid());
