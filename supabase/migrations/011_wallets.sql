-- Wallets and wallet_transactions
-- Uses auth.users(id) as canonical user FK; join profiles only for trust_level/role.
-- No new enums: TEXT + CHECK constraints to avoid migration pitfalls.

-- Wallets: balance_cents stores AVAILABLE only
CREATE TABLE public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_cents bigint NOT NULL DEFAULT 0 CHECK (balance_cents >= 0),
  currency text NOT NULL DEFAULT 'usd',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_wallets_user ON public.wallets(user_id);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wallet" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

-- wallet_transactions: audit trail; INSERT/UPDATE via service role only
CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('deposit', 'test_reserve', 'test_release', 'payout')),
  amount_cents bigint NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'completed')),
  metadata jsonb,
  available_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_wallet_transactions_user ON public.wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_user_created ON public.wallet_transactions(user_id, created_at DESC);
CREATE INDEX idx_wallet_transactions_pending ON public.wallet_transactions(user_id, status, available_at)
  WHERE status = 'pending' AND available_at IS NOT NULL;

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wallet_transactions" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);
