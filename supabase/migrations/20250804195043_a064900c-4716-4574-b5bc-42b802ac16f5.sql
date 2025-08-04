-- Fix the transfer_btz function
CREATE OR REPLACE FUNCTION public.transfer_btz(
  sender_id uuid,
  receiver_id uuid,
  amount integer
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sender_profile RECORD;
  receiver_profile RECORD;
  transaction_id uuid;
BEGIN
  -- Get sender profile
  SELECT * INTO sender_profile FROM profiles WHERE id = sender_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sender not found');
  END IF;
  
  -- Get receiver profile
  SELECT * INTO receiver_profile FROM profiles WHERE id = receiver_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Receiver not found');
  END IF;
  
  -- Check if sender has enough BTZ
  IF sender_profile.points < amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  -- Start transaction
  BEGIN
    -- Deduct from sender
    UPDATE profiles 
    SET points = points - amount 
    WHERE id = sender_id;
    
    -- Add to receiver
    UPDATE profiles 
    SET points = points + amount 
    WHERE id = receiver_id;
    
    -- Create transaction record
    INSERT INTO transactions (
      user_id, 
      receiver_id, 
      amount_cents, 
      transfer_type, 
      status,
      currency
    ) VALUES (
      sender_profile.user_id,
      receiver_id,
      amount,
      'p2p',
      'completed',
      'BTZ'
    ) RETURNING id INTO transaction_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'transaction_id', transaction_id,
      'sender_new_balance', sender_profile.points - amount,
      'receiver_new_balance', receiver_profile.points + amount
    );
    
  EXCEPTION WHEN others THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
  END;
END;
$$;