-- Create crypto_payments table to track cryptocurrency payments
CREATE TABLE public.crypto_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  payment_id TEXT NOT NULL UNIQUE, -- NOWPayments payment ID
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  amount_usd NUMERIC NOT NULL,
  crypto_amount NUMERIC,
  crypto_currency TEXT,
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting, confirming, confirmed, finished, failed, refunded
  payment_url TEXT,
  type TEXT NOT NULL, -- 'product', 'subscription', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.crypto_payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own crypto payments
CREATE POLICY "Users can view their own crypto payments" 
ON public.crypto_payments 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- System can insert and update crypto payments
CREATE POLICY "System can manage crypto payments" 
ON public.crypto_payments 
FOR ALL 
USING (true);

-- Add index for faster lookups
CREATE INDEX idx_crypto_payments_user_id ON public.crypto_payments(user_id);
CREATE INDEX idx_crypto_payments_payment_id ON public.crypto_payments(payment_id);
CREATE INDEX idx_crypto_payments_status ON public.crypto_payments(status);