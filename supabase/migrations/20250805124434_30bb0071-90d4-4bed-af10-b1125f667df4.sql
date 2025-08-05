-- Ativar RLS na tabela bot_presence_simulation
ALTER TABLE public.bot_presence_simulation ENABLE ROW LEVEL SECURITY;

-- Política para visualização pública (bots são públicos)
CREATE POLICY "Bot presence is viewable by everyone" 
ON public.bot_presence_simulation 
FOR SELECT 
USING (true);

-- Política para sistema atualizar presença
CREATE POLICY "System can update bot presence" 
ON public.bot_presence_simulation 
FOR ALL
USING (true);