-- Atualizar os perfis existentes para ter mais pontos para testes
UPDATE public.profiles 
SET points = 100000, level = 10, xp = 5000
WHERE points < 10000;