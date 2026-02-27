-- Tasks table
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
