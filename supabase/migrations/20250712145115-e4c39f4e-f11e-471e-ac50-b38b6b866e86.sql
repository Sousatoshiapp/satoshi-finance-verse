-- Atualizar logo XP com caminho local correto
UPDATE public.districts 
SET sponsor_logo_url = '/src/assets/xp-logo.png'
WHERE sponsor_company = 'XP Investimentos' OR theme = 'renda_variavel';

-- Atualizar também outros distritos com logos gerados
UPDATE public.districts 
SET sponsor_logo_url = '/src/assets/anima-logo.png'
WHERE sponsor_company = 'Ânima Educação' OR name LIKE '%Ânima%';