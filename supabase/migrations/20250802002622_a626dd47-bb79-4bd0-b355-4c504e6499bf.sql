-- Fix user_presence table RLS policies
DROP POLICY IF EXISTS "Users can manage their own presence" ON user_presence;

CREATE POLICY "Users can insert their own presence" 
ON user_presence 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own presence" 
ON user_presence 
FOR UPDATE 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view all presence" 
ON user_presence 
FOR SELECT 
USING (true);

CREATE POLICY "Users can delete their own presence" 
ON user_presence 
FOR DELETE 
USING (auth.uid()::text = user_id);