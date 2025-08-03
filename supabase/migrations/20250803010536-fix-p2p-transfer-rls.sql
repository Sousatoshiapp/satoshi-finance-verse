
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;

CREATE POLICY "Users can view their own transactions" ON public.transactions
FOR SELECT USING (
  user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
  (transfer_type = 'p2p' AND receiver_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);
