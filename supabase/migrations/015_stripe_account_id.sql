-- Store Stripe Connect account ID for testers (payouts)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_account_id text;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_account ON public.profiles(stripe_account_id)
  WHERE stripe_account_id IS NOT NULL;
