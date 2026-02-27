-- Sync missing index for reviews performance
-- This index exists in live DB but was missing from migrations
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON public.reviews(reviewer_id);
