-- Alterar coluna points para suportar decimais
ALTER TABLE public.profiles ALTER COLUMN points TYPE NUMERIC(10,2);

-- Atualizar valores existentes para formato decimal (adicionar .00)
UPDATE public.profiles SET points = points::NUMERIC(10,2);