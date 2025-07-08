-- Update enhance_bot_realism function to remove achievements part temporarily
CREATE OR REPLACE FUNCTION public.enhance_bot_realism()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bot_record RECORD;
  random_date DATE;
  days_since_join INTEGER;
  weekly_xp INTEGER;
  quiz_sessions INTEGER;
  social_interactions INTEGER;
BEGIN
  -- Loop through all bot profiles
  FOR bot_record IN 
    SELECT id, nickname, level, xp, points, streak, created_at
    FROM public.profiles 
    WHERE is_bot = true
  LOOP
    -- Generate realistic member since date (between 6 months to 2 years ago)
    random_date := CURRENT_DATE - (INTERVAL '180 days') - (INTERVAL '1 day') * floor(random() * 550);
    days_since_join := CURRENT_DATE - random_date;
    
    -- Update profile with member since date
    UPDATE public.profiles 
    SET created_at = random_date
    WHERE id = bot_record.id;
    
    -- Create realistic quiz sessions based on bot level
    quiz_sessions := CASE 
      WHEN bot_record.level <= 10 THEN 5 + floor(random() * 15)
      WHEN bot_record.level <= 30 THEN 15 + floor(random() * 35) 
      ELSE 40 + floor(random() * 60)
    END;
    
    -- Insert quiz sessions
    FOR i IN 1..quiz_sessions LOOP
      INSERT INTO public.quiz_sessions (
        user_id, 
        session_type, 
        questions_total, 
        questions_correct,
        questions_incorrect,
        combo_count,
        max_combo,
        performance_score,
        completed_at,
        created_at
      ) VALUES (
        bot_record.id,
        (ARRAY['review', 'practice', 'challenge'])[floor(random() * 3) + 1]::character varying,
        10,
        6 + floor(random() * 4), -- 6-9 correct
        1 + floor(random() * 4), -- 1-4 incorrect  
        2 + floor(random() * 6), -- 2-7 combo
        4 + floor(random() * 8), -- 4-11 max combo
        0.60 + (random() * 0.35), -- 60-95% performance
        random_date + (INTERVAL '1 day') * floor(random() * days_since_join),
        random_date + (INTERVAL '1 day') * floor(random() * days_since_join)
      );
    END LOOP;
    
    -- Insert social posts to simulate interactions
    social_interactions := CASE
      WHEN bot_record.level <= 10 THEN floor(random() * 5)
      WHEN bot_record.level <= 30 THEN 3 + floor(random() * 12)
      ELSE 10 + floor(random() * 25)
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
          'Conquistei um novo troféu! 🏆'
        ])[floor(random() * 6) + 1],
        'text',
        floor(random() * 20), -- 0-19 likes
        floor(random() * 5),  -- 0-4 comments
        random_date + (INTERVAL '1 day') * floor(random() * days_since_join)
      );
    END LOOP;
    
    -- Create weekly leaderboard entries for recent weeks
    FOR week_offset IN 0..8 LOOP
      weekly_xp := 50 + floor(random() * 300); -- Random weekly XP
      
      INSERT INTO public.weekly_leaderboards (
        user_id,
        week_start_date,
        xp_earned,
        quiz_score,
        duels_won,
        total_score
      ) VALUES (
        bot_record.id,
        date_trunc('week', CURRENT_DATE - (INTERVAL '1 week') * week_offset)::DATE,
        weekly_xp,
        quiz_sessions / 4, -- Approximate quiz score
        floor(random() * 3), -- 0-2 duels won per week
        weekly_xp + (quiz_sessions / 4) + (floor(random() * 3) * 100)
      ) ON CONFLICT (user_id, week_start_date) DO NOTHING;
    END LOOP;
    
    -- Create portfolios for some bots
    IF random() > 0.3 THEN -- 70% chance
      INSERT INTO public.portfolios (
        user_id,
        name,
        description,
        initial_balance,
        current_balance,
        performance_percentage,
        is_public,
        district_theme
      ) VALUES (
        bot_record.id,
        bot_record.nickname || '''s Portfolio',
        'Portfolio diversificado com foco em crescimento',
        10000.00,
        9800.00 + (random() * 4000.00), -- 9800-13800
        -2.0 + (random() * 6.0), -- -2% to +4%
        random() > 0.5, -- 50% public
        (ARRAY['tech', 'finance', 'crypto', 'traditional'])[floor(random() * 4) + 1]
      );
    END IF;
    
  END LOOP;
  
  RAISE NOTICE 'Bot realism enhancement completed successfully';
END;
$$;

-- Function to update bot nicknames from Bot_ prefix to realistic names
CREATE OR REPLACE FUNCTION public.update_bot_nicknames()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bot_count INTEGER := 0;
  bot_record RECORD;
  new_nickname TEXT;
  first_names TEXT[] := ARRAY[
    'Alexandre', 'Ana', 'André', 'Bruno', 'Carlos', 'Carla', 'Diego', 'Elena', 
    'Felipe', 'Fernanda', 'Gabriel', 'Giovanna', 'Henrique', 'Isabel', 'João', 
    'Julia', 'Leonardo', 'Larissa', 'Marcos', 'Marina', 'Pedro', 'Patrícia', 
    'Rafael', 'Renata', 'Rodrigo', 'Sabrina', 'Thiago', 'Vanessa', 'Victor', 
    'Vitória', 'Lucas', 'Luana', 'Mateus', 'Mariana', 'Daniel', 'Daniela',
    'Gustavo', 'Gisele', 'Ricardo', 'Regina', 'Sergio', 'Sandra', 'Fabio', 
    'Flávia', 'Eduardo', 'Eduarda', 'Caio', 'Camila', 'Otávio', 'Olivia'
  ];
  last_names TEXT[] := ARRAY[
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
    'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
    'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha',
    'Dias', 'Nascimento', 'Campos', 'Cardoso', 'Machado', 'Freitas', 'Correia',
    'Mendes', 'Cavalcanti', 'Monteiro', 'Moura', 'Ramos', 'Nunes', 'Moreira'
  ];
BEGIN
  -- Update bots with Bot_ prefix
  FOR bot_record IN 
    SELECT id, nickname 
    FROM public.profiles 
    WHERE is_bot = true AND nickname LIKE 'Bot_%'
  LOOP
    -- Generate realistic Brazilian name
    new_nickname := first_names[1 + floor(random() * array_length(first_names, 1))] || 
                   ' ' || 
                   last_names[1 + floor(random() * array_length(last_names, 1))];
    
    -- Update the nickname
    UPDATE public.profiles 
    SET nickname = new_nickname
    WHERE id = bot_record.id;
    
    bot_count := bot_count + 1;
  END LOOP;
  
  RETURN bot_count;
END;
$$;