-- Transactions table (escrow/payments)
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL UNIQUE REFERENCES public.submissions(id) ON DELETE CASCADE,
  developer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tester_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  tester_earnings numeric(10,2) NOT NULL,
  platform_fee numeric(10,2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'held',
  held_at timestamptz NOT NULL DEFAULT now(),
  released_at timestamptz
);

CREATE INDEX idx_transactions_task ON public.transactions(task_id);
CREATE INDEX idx_transactions_tester ON public.transactions(tester_id);
CREATE INDEX idx_transactions_developer ON public.transactions(developer_id);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can read own transactions" ON public.transactions
  FOR SELECT USING (developer_id = auth.uid() OR tester_id = auth.uid());
