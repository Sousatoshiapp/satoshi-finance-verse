-- Update XP Investimentos district with sponsor logo
UPDATE public.districts 
SET sponsor_logo_url = '/assets/districts/xp-investimentos-logo.jpg'
WHERE theme = 'renda_variavel' OR name ILIKE '%XP%' OR name ILIKE '%investimentos%';

-- Also update sponsor_company for consistency if not set
UPDATE public.districts 
SET sponsor_company = 'XP Investimentos'
WHERE theme = 'renda_variavel' AND (sponsor_company IS NULL OR sponsor_company = '');

-- Verify the update
SELECT id, name, theme, sponsor_company, sponsor_logo_url 
FROM public.districts 
WHERE theme = 'renda_variavel' OR sponsor_company = 'XP Investimentos';