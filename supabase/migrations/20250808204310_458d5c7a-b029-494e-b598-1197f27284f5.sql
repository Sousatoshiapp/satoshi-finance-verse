-- Create storage buckets for chat media
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('chat-images', 'chat-images', true),
  ('chat-voice', 'chat-voice', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for chat-images bucket
CREATE POLICY "Users can view chat images they're part of" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'chat-images' AND 
  auth.uid() IN (
    SELECT DISTINCT profiles.user_id 
    FROM profiles 
    JOIN conversations ON (
      conversations.participant1_id = profiles.id OR 
      conversations.participant2_id = profiles.id
    )
    WHERE conversations.id::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "Users can upload chat images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'chat-images' AND 
  auth.uid() IN (
    SELECT DISTINCT profiles.user_id 
    FROM profiles 
    JOIN conversations ON (
      conversations.participant1_id = profiles.id OR 
      conversations.participant2_id = profiles.id
    )
    WHERE conversations.id::text = (storage.foldername(name))[2]
  )
);

-- Create RLS policies for chat-voice bucket
CREATE POLICY "Users can view chat voice they're part of" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'chat-voice' AND 
  auth.uid() IN (
    SELECT DISTINCT profiles.user_id 
    FROM profiles 
    JOIN conversations ON (
      conversations.participant1_id = profiles.id OR 
      conversations.participant2_id = profiles.id
    )
    WHERE conversations.id::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "Users can upload chat voice" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'chat-voice' AND 
  auth.uid() IN (
    SELECT DISTINCT profiles.user_id 
    FROM profiles 
    JOIN conversations ON (
      conversations.participant1_id = profiles.id OR 
      conversations.participant2_id = profiles.id
    )
    WHERE conversations.id::text = (storage.foldername(name))[2]
  )
);

-- Add message_type and media_url columns to messages table if they don't exist
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text',
ADD COLUMN IF NOT EXISTS media_url TEXT;

-- Update messages table structure for better chat support
UPDATE messages SET message_type = 'text' WHERE message_type IS NULL;