-- CORREÇÃO DRÁSTICA: Vincular todos os usuários ao distrito XP automaticamente
INSERT INTO public.user_districts (user_id, district_id, is_residence, joined_at, residence_started_at)
SELECT 
  p.id as user_id,
  '0645a23d-6f02-465a-b9a5-8571853ebdec'::uuid as district_id,
  true as is_residence,
  now() as joined_at,
  now() as residence_started_at
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_districts ud 
  WHERE ud.user_id = p.id AND ud.is_residence = true
);

-- Atualizar logo XP correto
UPDATE public.districts 
SET sponsor_logo_url = 'https://logoeps.com/wp-content/uploads/2013/03/xp-vector-logo.png'
WHERE sponsor_company = 'XP Investimentos' OR theme = 'renda_variavel';