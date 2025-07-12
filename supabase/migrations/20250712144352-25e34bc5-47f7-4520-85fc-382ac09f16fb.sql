-- Update XP Investimentos district with the new sponsor logo URL
UPDATE public.districts 
SET sponsor_logo_url = '/assets/xp-logo.png'
WHERE sponsor_company = 'XP Investimentos' OR theme = 'renda_variavel';