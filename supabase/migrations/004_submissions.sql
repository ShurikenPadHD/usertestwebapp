-- Submissions table
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
CREATE INDEX idx_submissions_task_status ON public.submissions(task_id, status);

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
