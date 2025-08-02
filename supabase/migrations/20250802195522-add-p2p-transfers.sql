ALTER TYPE currency_type ADD VALUE 'BTZ';

ALTER TABLE transactions ADD COLUMN receiver_id UUID REFERENCES profiles(id);
ALTER TABLE transactions ADD COLUMN transfer_type TEXT DEFAULT 'purchase';

CREATE OR REPLACE FUNCTION public.transfer_btz(
  sender_id UUID,
  receiver_id UUID,
  amount INTEGER
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sender_balance INTEGER;
  receiver_balance INTEGER;
  transaction_id UUID;
  sender_user_id UUID;
BEGIN
  SELECT points, user_id INTO sender_balance, sender_user_id FROM profiles WHERE id = sender_id;
  IF sender_balance < amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  SELECT points INTO receiver_balance FROM profiles WHERE id = receiver_id;
  
  INSERT INTO transactions (
    user_id, amount_cents, currency, status, transfer_type,
    receiver_id, processed_at
  ) VALUES (
    sender_user_id,
    amount, 'BTZ', 'completed', 'p2p',
    receiver_id, now()
  ) RETURNING id INTO transaction_id;
  
  UPDATE profiles SET points = points - amount WHERE id = sender_id;
  UPDATE profiles SET points = points + amount WHERE id = receiver_id;
  
  INSERT INTO wallet_transactions (user_id, transaction_type, amount, balance_after, source_type, source_id, description)
  VALUES 
    (sender_id, 'transfer_out', -amount, sender_balance - amount, 'p2p_transfer', transaction_id, 'P2P Transfer Sent'),
    (receiver_id, 'transfer_in', amount, receiver_balance + amount, 'p2p_transfer', transaction_id, 'P2P Transfer Received');
  
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'sender_new_balance', sender_balance - amount,
    'receiver_new_balance', receiver_balance + amount
  );
END;
$$;
