-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_submission ON public.reviews(submission_id);
CREATE INDEX idx_reviews_reviewee ON public.reviews(reviewee_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can read" ON public.reviews
  FOR SELECT USING (reviewer_id = auth.uid() OR reviewee_id = auth.uid());

CREATE POLICY "Reviewer can insert" ON public.reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());
