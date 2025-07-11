-- Adicionar colunas para persistir estado de gamificação
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_streak_multiplier INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS streak_session_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_streak_reset_date DATE DEFAULT CURRENT_DATE;

-- Adicionar comentários para explicar as colunas
COMMENT ON COLUMN public.profiles.current_streak_multiplier IS 'Multiplicador atual do streak que persiste até erro ou uso de vida';
COMMENT ON COLUMN public.profiles.streak_session_active IS 'Indica se o usuário está em uma sessão ativa de streak';
COMMENT ON COLUMN public.profiles.last_streak_reset_date IS 'Data do último reset de streak para controle';

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_streak_multiplier ON public.profiles(current_streak_multiplier) WHERE streak_session_active = true;