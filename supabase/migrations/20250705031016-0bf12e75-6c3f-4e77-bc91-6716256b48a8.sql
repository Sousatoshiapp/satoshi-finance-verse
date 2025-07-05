-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  participant1_id UUID NOT NULL,
  participant2_id UUID NOT NULL,
  UNIQUE(participant1_id, participant2_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  is_read BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (
  participant1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
  participant2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (
  participant1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
  participant2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" 
ON public.messages 
FOR SELECT 
USING (
  conversation_id IN (
    SELECT id FROM conversations WHERE 
    participant1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    participant2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their conversations" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) AND
  conversation_id IN (
    SELECT id FROM conversations WHERE 
    participant1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    participant2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can update read status of messages" 
ON public.messages 
FOR UPDATE 
USING (
  conversation_id IN (
    SELECT id FROM conversations WHERE 
    participant1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    participant2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

-- Add foreign key constraints
ALTER TABLE public.conversations 
ADD CONSTRAINT fk_conversations_participant1 
FOREIGN KEY (participant1_id) REFERENCES profiles(id);

ALTER TABLE public.conversations 
ADD CONSTRAINT fk_conversations_participant2 
FOREIGN KEY (participant2_id) REFERENCES profiles(id);

ALTER TABLE public.messages 
ADD CONSTRAINT fk_messages_conversation 
FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;

ALTER TABLE public.messages 
ADD CONSTRAINT fk_messages_sender 
FOREIGN KEY (sender_id) REFERENCES profiles(id);

-- Add indexes for better performance
CREATE INDEX idx_conversations_participants ON conversations(participant1_id, participant2_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Create trigger for updating conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Enable realtime for messages
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE messages;