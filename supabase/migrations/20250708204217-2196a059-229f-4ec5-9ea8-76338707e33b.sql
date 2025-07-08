-- Create district chat system
CREATE TABLE IF NOT EXISTS public.district_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID REFERENCES public.districts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  reply_to_id UUID REFERENCES public.district_chat_messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Create real-time notifications table
CREATE TABLE IF NOT EXISTS public.district_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID REFERENCES public.districts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'battle_started', 'new_member', 'achievement', 'power_change'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.district_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for district_chat_messages
CREATE POLICY "District members can view chat messages" ON public.district_chat_messages FOR SELECT
USING (
  district_id IN (
    SELECT district_id FROM public.user_districts 
    WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "District members can send messages" ON public.district_chat_messages FOR INSERT
WITH CHECK (
  user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND
  district_id IN (
    SELECT district_id FROM public.user_districts 
    WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own messages" ON public.district_chat_messages FOR UPDATE
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for district_notifications
CREATE POLICY "Users can view their district notifications" ON public.district_notifications FOR SELECT
USING (
  user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  district_id IN (
    SELECT district_id FROM public.user_districts 
    WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "System can create notifications" ON public.district_notifications FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_district_chat_messages_district_created ON public.district_chat_messages(district_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_district_notifications_user_created ON public.district_notifications(user_id, created_at DESC);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.district_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.district_notifications;