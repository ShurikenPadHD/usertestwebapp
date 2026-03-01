-- Submission Insights: structured product/UX findings from AI analysis
-- Links to submissions (one-to-one). Created when developer views a submission
-- or when insights are generated asynchronously.

CREATE TABLE IF NOT EXISTS public.submission_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL UNIQUE REFERENCES public.submissions(id) ON DELETE CASCADE,
  findings jsonb NOT NULL DEFAULT '[]',
  provider text,
  analyzed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submission_insights_submission ON public.submission_insights(submission_id);

ALTER TABLE public.submission_insights ENABLE ROW LEVEL SECURITY;

-- Developers can read insights for submissions of their tasks
CREATE POLICY "Task owner can read insights" ON public.submission_insights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.submissions s
      JOIN public.tasks t ON t.id = s.task_id
      WHERE s.id = submission_insights.submission_id
        AND t.developer_id = auth.uid()
    )
  );

-- Task owner can insert insights (when generating for their submission)
CREATE POLICY "Task owner can insert insights" ON public.submission_insights
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.submissions s
      JOIN public.tasks t ON t.id = s.task_id
      WHERE s.id = submission_insights.submission_id
        AND t.developer_id = auth.uid()
    )
  );

-- Task owner can update insights
CREATE POLICY "Task owner can update insights" ON public.submission_insights
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.submissions s
      JOIN public.tasks t ON t.id = s.task_id
      WHERE s.id = submission_insights.submission_id
        AND t.developer_id = auth.uid()
    )
  );
