-- Verificar e ajustar a estrutura da tabela duels existente
-- Adicionar coluna topic se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'duels' 
        AND column_name = 'topic'
    ) THEN
        ALTER TABLE public.duels ADD COLUMN topic TEXT NOT NULL DEFAULT 'general';
    END IF;
END $$;

-- Verificar e ajustar a estrutura da tabela duel_invites se existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'duel_invites'
    ) THEN
        -- Adicionar coluna topic se não existir
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'duel_invites' 
            AND column_name = 'topic'
        ) THEN
            ALTER TABLE public.duel_invites ADD COLUMN topic TEXT NOT NULL DEFAULT 'general';
        END IF;
    ELSE
        -- Criar tabela duel_invites se não existir
        CREATE TABLE public.duel_invites (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            challenger_id UUID NOT NULL,
            challenged_id UUID NOT NULL,
            topic TEXT NOT NULL DEFAULT 'general',
            bet_amount INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'pending'::text,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + '00:10:00'::interval)
        );
        
        -- Habilitar RLS
        ALTER TABLE public.duel_invites ENABLE ROW LEVEL SECURITY;
        
        -- Criar políticas RLS
        CREATE POLICY "Users can create duel invites" ON public.duel_invites
            FOR INSERT WITH CHECK (
                challenger_id IN (
                    SELECT id FROM profiles WHERE user_id = auth.uid()
                )
            );

        CREATE POLICY "Users can view their own duel invites" ON public.duel_invites
            FOR SELECT USING (
                challenger_id IN (
                    SELECT id FROM profiles WHERE user_id = auth.uid()
                ) OR challenged_id IN (
                    SELECT id FROM profiles WHERE user_id = auth.uid()
                )
            );

        CREATE POLICY "Users can update their own duel invites" ON public.duel_invites
            FOR UPDATE USING (
                challenger_id IN (
                    SELECT id FROM profiles WHERE user_id = auth.uid()
                ) OR challenged_id IN (
                    SELECT id FROM profiles WHERE user_id = auth.uid()
                )
            );
    END IF;
END $$;