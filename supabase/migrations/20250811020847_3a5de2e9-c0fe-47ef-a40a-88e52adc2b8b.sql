-- Criar tabela duels se não existir
CREATE TABLE IF NOT EXISTS public.duels (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    challenger_id UUID NOT NULL,
    challenged_id UUID NOT NULL,
    topic TEXT NOT NULL,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'waiting'::text,
    bet_amount INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    winner_id UUID,
    current_question INTEGER NOT NULL DEFAULT 0,
    challenger_score INTEGER NOT NULL DEFAULT 0,
    challenged_score INTEGER NOT NULL DEFAULT 0
);

-- Criar tabela duel_invites se não existir
CREATE TABLE IF NOT EXISTS public.duel_invites (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    challenger_id UUID NOT NULL,
    challenged_id UUID NOT NULL,
    topic TEXT NOT NULL,
    bet_amount INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending'::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + '00:10:00'::interval)
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_invites ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para duels
CREATE POLICY "Users can create their own duels" ON public.duels
    FOR INSERT WITH CHECK (
        challenger_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own duels" ON public.duels
    FOR SELECT USING (
        challenger_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        ) OR challenged_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own duels" ON public.duels
    FOR UPDATE USING (
        challenger_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        ) OR challenged_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Políticas RLS para duel_invites
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