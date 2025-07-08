-- Create function to fill missing bot social posts
CREATE OR REPLACE FUNCTION public.fill_missing_bot_posts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bot_record RECORD;
  bot_count INTEGER := 0;
  random_date DATE;
  days_since_join INTEGER;
  social_interactions INTEGER;
BEGIN
  -- Loop through bots that don't have social posts
  FOR bot_record IN 
    SELECT id, nickname, level, created_at
    FROM public.profiles 
    WHERE is_bot = true 
    AND NOT EXISTS (SELECT 1 FROM public.social_posts WHERE user_id = profiles.id)
  LOOP
    -- Get member since date
    random_date := bot_record.created_at::DATE;
    days_since_join := CURRENT_DATE - random_date;
    
    -- Create social posts based on bot level
    social_interactions := CASE
      WHEN bot_record.level <= 10 THEN 1 + floor(random() * 3)  -- 1-3 posts
      WHEN bot_record.level <= 30 THEN 2 + floor(random() * 5)  -- 2-6 posts
      ELSE 3 + floor(random() * 8)                              -- 3-10 posts
    END;
    
    FOR i IN 1..social_interactions LOOP
      INSERT INTO public.social_posts (
        user_id,
        content,
        post_type,
        likes_count,
        comments_count,
        created_at
      ) VALUES (
        bot_record.id,
        (ARRAY[
          'Acabei de completar um quiz incrível! 🎯',
          'Subindo no ranking! 🚀',
          'Nova sequência de vitórias! 🔥',
          'Aprendendo muito sobre finanças 📈',
          'Quem quer duelar? 💪',
          'Conquistei um novo troféu! 🏆',
          'Estudando economia digital! 💡',
          'Batendo metas diárias! ⭐',
          'Trading virtual em alta! 📊',
          'Comunidade incrível aqui! 🤝'
        ])[floor(random() * 10) + 1],
        'text',
        floor(random() * 15), -- 0-14 likes
        floor(random() * 4),  -- 0-3 comments
        random_date + (INTERVAL '1 day') * floor(random() * days_since_join)
      );
    END LOOP;
    
    bot_count := bot_count + 1;
  END LOOP;
  
  RETURN bot_count;
END;
$$;