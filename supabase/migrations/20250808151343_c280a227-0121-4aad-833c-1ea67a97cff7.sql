-- Adicionar níveis 21-100 na tabela level_tiers com nomes e descrições
INSERT INTO public.level_tiers (level, xp_required, name, description)
SELECT 
  level_num,
  CASE 
    WHEN level_num <= 30 THEN level_num * 500
    WHEN level_num <= 50 THEN 15000 + (level_num - 30) * 750
    WHEN level_num <= 75 THEN 30000 + (level_num - 50) * 1000
    ELSE 55000 + (level_num - 75) * 1500
  END as xp_required,
  CASE 
    WHEN level_num <= 25 THEN 'Especialista Nível ' || level_num
    WHEN level_num <= 35 THEN 'Expert Avançado ' || level_num
    WHEN level_num <= 50 THEN 'Mestre das Finanças ' || level_num
    WHEN level_num <= 75 THEN 'Guru Financeiro ' || level_num
    ELSE 'Lenda ' || level_num
  END as name,
  CASE 
    WHEN level_num <= 25 THEN 'Conhecimento especializado em mercado financeiro'
    WHEN level_num <= 35 THEN 'Expertise avançada em investimentos'
    WHEN level_num <= 50 THEN 'Domínio completo do sistema financeiro'
    WHEN level_num <= 75 THEN 'Sabedoria financeira superior'
    ELSE 'Status lendário no mundo das finanças'
  END as description
FROM generate_series(21, 100) as level_num
WHERE NOT EXISTS (
  SELECT 1 FROM public.level_tiers WHERE level = level_num
);

-- Atualizar níveis dos usuários que já ultrapassaram nível 20
UPDATE public.profiles 
SET level = public.calculate_correct_level(xp)
WHERE xp > 10450;