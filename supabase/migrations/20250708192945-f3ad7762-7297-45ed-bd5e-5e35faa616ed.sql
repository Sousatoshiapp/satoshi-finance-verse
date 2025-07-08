-- Add unique constraint to achievements name column
ALTER TABLE public.achievements ADD CONSTRAINT achievements_name_unique UNIQUE (name);

-- Insert the achievement definitions
INSERT INTO public.achievements (name, description, type, rarity, requirement_data) VALUES
('first_steps', 'Alcançou nível 5', 'level', 'common', '{"level_required": 5}'),
('rising_star', 'Alcançou nível 10', 'level', 'common', '{"level_required": 10}'),
('expert', 'Alcançou nível 20', 'level', 'rare', '{"level_required": 20}'),
('master', 'Alcançou nível 30', 'level', 'epic', '{"level_required": 30}'),
('legend', 'Alcançou nível 40', 'level', 'legendary', '{"level_required": 40}'),
('quiz_enthusiast', 'Completou 10 quizzes', 'quiz', 'common', '{"quizzes_required": 10}'),
('quiz_master', 'Completou 50 quizzes', 'quiz', 'rare', '{"quizzes_required": 50}'),
('combo_expert', 'Conseguiu combo de 10', 'combo', 'rare', '{"combo_required": 10}'),
('streak_warrior', 'Manteve streak de 7 dias', 'streak', 'common', '{"streak_required": 7}'),
('dedication', 'Manteve streak de 30 dias', 'streak', 'epic', '{"streak_required": 30}')
ON CONFLICT (name) DO NOTHING;