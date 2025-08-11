-- Create the transfer_btz function that saves consistent profile.id values
CREATE OR REPLACE FUNCTION public.transfer_btz(sender_id uuid, receiver_id uuid, amount integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sender_profile RECORD;
  receiver_profile RECORD;
  transaction_id UUID;
  sender_new_balance INTEGER;
  receiver_new_balance INTEGER;
BEGIN
  -- Get sender profile (sender_id is profile.id)
  SELECT * INTO sender_profile 
  FROM public.profiles 
  WHERE id = sender_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sender profile not found');
  END IF;
  
  -- Get receiver profile (receiver_id is profile.id)
  SELECT * INTO receiver_profile 
  FROM public.profiles 
  WHERE id = receiver_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Receiver profile not found');
  END IF;
  
  -- Check sufficient balance
  IF sender_profile.points < amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  -- Transfer BTZ
  UPDATE public.profiles 
  SET points = points - amount 
  WHERE id = sender_id;
  
  UPDATE public.profiles 
  SET points = points + amount 
  WHERE id = receiver_id;
  
  -- Get updated balances
  SELECT points INTO sender_new_balance 
  FROM public.profiles 
  WHERE id = sender_id;
  
  SELECT points INTO receiver_new_balance 
  FROM public.profiles 
  WHERE id = receiver_id;
  
  -- Record transaction with CONSISTENT profile.id values for both sender and receiver
  INSERT INTO public.transactions (
    user_id,           -- sender profile.id
    receiver_id,       -- receiver profile.id  
    amount_cents,
    transfer_type,
    status
  ) VALUES (
    sender_id,         -- using profile.id (not auth.users.id)
    receiver_id,       -- using profile.id (not auth.users.id)
    amount,
    'p2p',
    'completed'
  ) RETURNING id INTO transaction_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'sender_new_balance', sender_new_balance,
    'receiver_new_balance', receiver_new_balance
  );
END;
$$;