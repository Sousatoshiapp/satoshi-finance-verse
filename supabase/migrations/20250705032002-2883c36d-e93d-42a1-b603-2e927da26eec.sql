-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT
);

-- Create push notification settings table
CREATE TABLE public.push_notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  endpoint TEXT,
  p256dh_key TEXT,
  auth_key TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification templates table
CREATE TABLE public.notification_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for push notification settings
CREATE POLICY "Users can manage their push settings" 
ON public.push_notification_settings 
FOR ALL 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for notification templates (admin only for now)
CREATE POLICY "Templates are viewable by everyone" 
ON public.notification_templates 
FOR SELECT 
USING (true);

-- Add foreign key constraints
ALTER TABLE public.notifications 
ADD CONSTRAINT fk_notifications_user 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE public.push_notification_settings 
ADD CONSTRAINT fk_push_settings_user 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Insert some notification templates
INSERT INTO notification_templates (name, title_template, message_template, type) VALUES
('welcome', 'Bem-vindo ao {app_name}!', 'Olá {user_name}, bem-vindo à nossa plataforma!', 'info'),
('new_follower', 'Novo seguidor!', '{follower_name} começou a seguir você!', 'social'),
('new_message', 'Nova mensagem', 'Você recebeu uma nova mensagem de {sender_name}', 'message'),
('level_up', 'Parabéns!', 'Você subiu para o nível {level}!', 'achievement'),
('email_verification', 'Verificação de Email', 'Verifique seu email para ativar sua conta', 'verification');

-- Enable realtime for notifications
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE notifications;