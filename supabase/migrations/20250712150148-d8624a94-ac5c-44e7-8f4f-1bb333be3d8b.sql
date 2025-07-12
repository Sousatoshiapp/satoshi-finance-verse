-- Corrigir URLs dos logos dos distritos com caminhos corretos
UPDATE public.districts 
SET sponsor_logo_url = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&h=100&fit=crop&crop=center'
WHERE sponsor_company = 'XP Investimentos' OR theme = 'renda_variavel';

UPDATE public.districts 
SET sponsor_logo_url = 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=100&h=100&fit=crop&crop=center'
WHERE sponsor_company = 'Ânima Educação' OR name LIKE '%Ânima%';

-- Adicionar backgrounds para os distritos
UPDATE public.districts 
SET image_url = 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=600&fit=crop'
WHERE sponsor_company = 'XP Investimentos' OR theme = 'renda_variavel';

UPDATE public.districts 
SET image_url = 'https://images.unsplash.com/photo-1523050854058-8df90110c9d1?w=800&h=600&fit=crop'
WHERE sponsor_company = 'Ânima Educação' OR name LIKE '%Ânima%';