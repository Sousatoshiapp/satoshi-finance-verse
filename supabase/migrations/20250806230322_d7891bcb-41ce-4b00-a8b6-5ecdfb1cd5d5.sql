-- Activate more bots to improve matchmaking
UPDATE bot_presence_simulation 
SET is_online = true, 
    last_activity_at = now() 
WHERE bot_id IN (
  SELECT id 
  FROM profiles 
  WHERE is_bot = true 
  ORDER BY level DESC 
  LIMIT 25
);

-- Create function to get arena users for the wheel display
CREATE OR REPLACE FUNCTION public.get_arena_users()
RETURNS TABLE(
  id uuid,
  nickname text,
  level integer,
  avatar_id text,
  is_bot boolean,
  is_online boolean,
  profile_image_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return online bots and recent active users
  RETURN QUERY
  SELECT 
    p.id,
    p.nickname,
    p.level,
    p.avatar_id,
    p.is_bot,
    COALESCE(bps.is_online, false) as is_online,
    p.profile_image_url
  FROM profiles p
  LEFT JOIN bot_presence_simulation bps ON p.id = bps.bot_id
  WHERE (
    -- Online bots
    (p.is_bot = true AND bps.is_online = true)
    OR 
    -- Recent active real users
    (p.is_bot = false AND p.last_login_date >= CURRENT_DATE - INTERVAL '7 days')
  )
  ORDER BY 
    CASE WHEN p.is_bot THEN 0 ELSE 1 END, -- Bots first
    p.level DESC,
    p.updated_at DESC
  LIMIT 20;
END;
$$;