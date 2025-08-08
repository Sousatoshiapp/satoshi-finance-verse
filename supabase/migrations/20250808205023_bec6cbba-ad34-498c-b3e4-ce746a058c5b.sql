-- Create new direct_messages table specifically for chat
CREATE TABLE public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' NOT NULL,
  media_url TEXT,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for direct messages - users can only see messages from conversations they're part of
CREATE POLICY "Users can view messages from their conversations" 
ON public.direct_messages 
FOR SELECT 
USING (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE participant1_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
       OR participant2_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages to their conversations" 
ON public.direct_messages 
FOR INSERT 
WITH CHECK (
  sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE participant1_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
       OR participant2_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can update read status of messages in their conversations" 
ON public.direct_messages 
FOR UPDATE 
USING (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE participant1_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
       OR participant2_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- Create index for better performance
CREATE INDEX idx_direct_messages_conversation_id ON public.direct_messages(conversation_id);
CREATE INDEX idx_direct_messages_created_at ON public.direct_messages(created_at);

-- Enable realtime for the table
ALTER TABLE public.direct_messages REPLICA IDENTITY FULL;