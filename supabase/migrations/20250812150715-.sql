-- FASE 1: Corrigir RLS da tabela transactions para permitir P2P notifications
-- Remover políticas problemáticas e criar novas que permitem P2P funcionar

-- Dropar políticas existentes que podem estar bloqueando
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view their sent transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view their received transactions" ON public.transactions;

-- Criar políticas RLS otimizadas para P2P
CREATE POLICY "Users can view transactions they sent" ON public.transactions
FOR SELECT USING (
  user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view transactions they received" ON public.transactions  
FOR SELECT USING (
  receiver_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create transactions" ON public.transactions
FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Garantir que a tabela transactions está configurada para realtime
ALTER TABLE public.transactions REPLICA IDENTITY FULL;

-- Verificar se está na publicação realtime
SELECT 'transactions' as table_name, 
       schemaname, 
       tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'transactions';

-- Se não estiver, adicionar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
  END IF;
END $$;