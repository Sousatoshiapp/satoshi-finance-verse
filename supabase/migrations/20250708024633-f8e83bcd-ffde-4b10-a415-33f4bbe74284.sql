-- Criar tabela para gerenciar tokens de reset de senha admin
CREATE TABLE IF NOT EXISTS public.admin_password_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  email text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_password_tokens ENABLE ROW LEVEL SECURITY;

-- Policy para permitir inserção de tokens (usado pelo edge function)
CREATE POLICY "Allow service role to manage tokens" ON public.admin_password_tokens
  FOR ALL USING (true);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_admin_tokens_token ON public.admin_password_tokens(token);
CREATE INDEX IF NOT EXISTS idx_admin_tokens_expires ON public.admin_password_tokens(expires_at);