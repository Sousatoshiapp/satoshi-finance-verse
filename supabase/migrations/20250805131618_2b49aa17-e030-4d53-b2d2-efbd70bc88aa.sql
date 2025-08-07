-- Primeiro, vamos verificar a estrutura da tabela user_avatars
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_avatars' 
AND table_schema = 'public';