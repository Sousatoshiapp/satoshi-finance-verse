-- Criar um perfil de teste com muitos pontos para facilitar os testes
INSERT INTO public.profiles (user_id, nickname, points, level, xp, streak, completed_lessons)
VALUES ('test-user-id', 'Usuário Teste', 100000, 10, 5000, 30, 50)
ON CONFLICT (user_id) DO UPDATE SET
  points = 100000,
  level = 10,
  xp = 5000;