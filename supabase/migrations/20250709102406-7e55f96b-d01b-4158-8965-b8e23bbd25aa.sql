-- Criar sistema completo de guildas
CREATE TABLE public.guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  emblem TEXT DEFAULT '🛡️',
  leader_id UUID NOT NULL,
  max_members INTEGER DEFAULT 50,
  member_count INTEGER DEFAULT 1,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  requirements JSONB DEFAULT '{"min_level": 1, "min_xp": 0}',
  perks JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'disbanded')),
  is_recruiting BOOLEAN DEFAULT true,
  weekly_goal INTEGER DEFAULT 1000,
  weekly_progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (leader_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Membros das guildas
CREATE TABLE public.guild_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'officer', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  weekly_contribution INTEGER DEFAULT 0,
  total_contribution INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(guild_id, user_id)
);

-- Solicitações de entrada
CREATE TABLE public.guild_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL,
  user_id UUID NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE(guild_id, user_id)
);

-- Chat das guildas
CREATE TABLE public.guild_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'achievement')),
  reply_to_id UUID,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (reply_to_id) REFERENCES guild_messages(id) ON DELETE SET NULL
);

-- Atividades das guildas
CREATE TABLE public.guild_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}',
  xp_earned INTEGER DEFAULT 0,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
);

-- Missões das guildas
CREATE TABLE public.guild_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  mission_type TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_progress INTEGER DEFAULT 0,
  rewards JSONB DEFAULT '{"xp": 100, "beetz": 50}',
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_guilds_leader ON guilds(leader_id);
CREATE INDEX idx_guilds_status ON guilds(status) WHERE status = 'active';
CREATE INDEX idx_guild_members_guild ON guild_members(guild_id);
CREATE INDEX idx_guild_members_user ON guild_members(user_id);
CREATE INDEX idx_guild_requests_guild ON guild_requests(guild_id);
CREATE INDEX idx_guild_requests_user ON guild_requests(user_id);
CREATE INDEX idx_guild_requests_status ON guild_requests(status) WHERE status = 'pending';
CREATE INDEX idx_guild_messages_guild ON guild_messages(guild_id);
CREATE INDEX idx_guild_messages_created ON guild_messages(created_at DESC);

-- RLS Policies
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_missions ENABLE ROW LEVEL SECURITY;

-- Políticas para Guilds
CREATE POLICY "Guilds são visíveis para todos" ON guilds FOR SELECT USING (status = 'active');
CREATE POLICY "Usuários autenticados podem criar guilds" ON guilds FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  leader_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Líderes podem atualizar suas guilds" ON guilds FOR UPDATE USING (
  leader_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Políticas para Guild Members
CREATE POLICY "Membros podem ver seus membros de guild" ON guild_members FOR SELECT USING (
  guild_id IN (SELECT guild_id FROM guild_members WHERE user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Usuários podem se juntar a guilds" ON guild_members FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Membros podem sair das guilds" ON guild_members FOR UPDATE USING (
  user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
  guild_id IN (SELECT guild_id FROM guild_members WHERE user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) AND role IN ('leader', 'officer'))
);

-- Políticas para Guild Requests
CREATE POLICY "Membros podem ver solicitações da guild" ON guild_requests FOR SELECT USING (
  guild_id IN (SELECT guild_id FROM guild_members WHERE user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())) OR
  user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Usuários podem criar solicitações" ON guild_requests FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Líderes podem atualizar solicitações" ON guild_requests FOR UPDATE USING (
  guild_id IN (SELECT guild_id FROM guild_members WHERE user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) AND role IN ('leader', 'officer'))
);

-- Políticas para Guild Messages
CREATE POLICY "Membros podem ver mensagens da guild" ON guild_messages FOR SELECT USING (
  guild_id IN (SELECT guild_id FROM guild_members WHERE user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) AND is_active = true)
);
CREATE POLICY "Membros podem enviar mensagens" ON guild_messages FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) AND
  guild_id IN (SELECT guild_id FROM guild_members WHERE user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) AND is_active = true)
);
CREATE POLICY "Usuários podem atualizar suas mensagens" ON guild_messages FOR UPDATE USING (
  user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Políticas para Guild Activities e Missions
CREATE POLICY "Membros podem ver atividades da guild" ON guild_activities FOR SELECT USING (
  guild_id IN (SELECT guild_id FROM guild_members WHERE user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Sistema pode inserir atividades" ON guild_activities FOR INSERT WITH CHECK (true);

CREATE POLICY "Membros podem ver missões da guild" ON guild_missions FOR SELECT USING (
  guild_id IN (SELECT guild_id FROM guild_members WHERE user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Líderes podem criar missões" ON guild_missions FOR INSERT WITH CHECK (
  guild_id IN (SELECT guild_id FROM guild_members WHERE user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) AND role IN ('leader', 'officer'))
);

-- Triggers para atualizar contadores
CREATE OR REPLACE FUNCTION update_guild_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE guilds SET member_count = member_count + 1 WHERE id = NEW.guild_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE guilds SET member_count = member_count - 1 WHERE id = OLD.guild_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_guild_member_count
  AFTER INSERT OR DELETE ON guild_members
  FOR EACH ROW EXECUTE FUNCTION update_guild_member_count();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_guilds_updated_at BEFORE UPDATE ON guilds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guild_messages_updated_at BEFORE UPDATE ON guild_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para solicitar entrada em guild
CREATE OR REPLACE FUNCTION request_guild_membership(
  p_guild_id UUID,
  p_user_id UUID,
  p_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  guild_record RECORD;
BEGIN
  -- Verificar se a guild existe e está ativa
  SELECT * INTO guild_record FROM guilds WHERE id = p_guild_id AND status = 'active';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Guild não encontrada ou inativa';
  END IF;
  
  -- Verificar se já é membro
  IF EXISTS (SELECT 1 FROM guild_members WHERE guild_id = p_guild_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'Usuário já é membro desta guild';
  END IF;
  
  -- Verificar se já tem solicitação pendente
  IF EXISTS (SELECT 1 FROM guild_requests WHERE guild_id = p_guild_id AND user_id = p_user_id AND status = 'pending') THEN
    RAISE EXCEPTION 'Já existe uma solicitação pendente';
  END IF;
  
  -- Verificar se a guild tem vagas
  IF guild_record.member_count >= guild_record.max_members THEN
    RAISE EXCEPTION 'Guild está lotada';
  END IF;
  
  -- Criar solicitação
  INSERT INTO guild_requests (guild_id, user_id, message)
  VALUES (p_guild_id, p_user_id, p_message);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para aprovar/rejeitar solicitações
CREATE OR REPLACE FUNCTION process_guild_request(
  p_request_id UUID,
  p_reviewer_id UUID,
  p_approved BOOLEAN
)
RETURNS BOOLEAN AS $$
DECLARE
  request_record RECORD;
BEGIN
  -- Buscar solicitação
  SELECT gr.*, g.max_members, g.member_count 
  INTO request_record 
  FROM guild_requests gr
  JOIN guilds g ON gr.guild_id = g.id
  WHERE gr.id = p_request_id AND gr.status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitação não encontrada';
  END IF;
  
  -- Verificar se o revisor tem permissão
  IF NOT EXISTS (
    SELECT 1 FROM guild_members 
    WHERE guild_id = request_record.guild_id 
    AND user_id = p_reviewer_id 
    AND role IN ('leader', 'officer')
  ) THEN
    RAISE EXCEPTION 'Sem permissão para revisar solicitações';
  END IF;
  
  -- Atualizar solicitação
  UPDATE guild_requests 
  SET status = CASE WHEN p_approved THEN 'approved' ELSE 'rejected' END,
      reviewed_by = p_reviewer_id,
      reviewed_at = now()
  WHERE id = p_request_id;
  
  -- Se aprovado, adicionar à guild
  IF p_approved THEN
    -- Verificar se ainda há vagas
    IF request_record.member_count >= request_record.max_members THEN
      RAISE EXCEPTION 'Guild está lotada';
    END IF;
    
    INSERT INTO guild_members (guild_id, user_id, role)
    VALUES (request_record.guild_id, request_record.user_id, 'member');
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;