-- Habilitar realtime para a tabela direct_messages
ALTER TABLE public.direct_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;