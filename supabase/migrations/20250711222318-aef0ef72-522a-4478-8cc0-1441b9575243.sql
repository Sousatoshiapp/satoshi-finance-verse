-- Configurar realtime para a tabela profiles
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Verificar se a tabela está na publicação realtime
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;
END $$;