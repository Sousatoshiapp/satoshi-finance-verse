-- Inserir lições exemplo para teste
INSERT INTO public.daily_lessons (
  id,
  title,
  content,
  quiz_question,
  quiz_options,
  correct_answer,
  category,
  xp_reward,
  btz_reward,
  difficulty,
  lesson_date,
  is_main_lesson,
  is_active
) VALUES 

-- Lição principal de hoje
(
  gen_random_uuid(),
  'Por que seu cartão de crédito pode te ferrar sem você perceber 🫠',
  'Ele é tipo aquele amigo que paga tudo no rolê, mas depois te cobra com juros de agiota. Use, mas paga logo, senão vira uma bola de neve que nem aquela dívida do primo que "era só um dinheirinho". 💀',
  'Qual a melhor forma de evitar juros no cartão?',
  ARRAY['Pagar a fatura inteira no vencimento', 'Pagar só o mínimo', 'Ignorar e rezar'],
  0,
  'dicas',
  15,
  0.7,
  'easy',
  CURRENT_DATE,
  true,
  true
),

-- Lições extras de hoje
(
  gen_random_uuid(),
  'O que é inflação? Spoiler: não é seu ego subindo 🤡',
  'É quando os preços sobem mais que stories no Instagram. Seu dinheiro vale menos, mas as coisas ficam mais caras. É tipo quando o açaí era R$ 5 e agora tá R$ 15. Cruel.',
  'O que acontece com seu dinheiro quando há inflação?',
  ARRAY['Ele vale menos', 'Ele vale mais', 'Não muda nada'],
  0,
  'glossario',
  8,
  0.4,
  'easy',
  CURRENT_DATE,
  false,
  true
),

(
  gen_random_uuid(),
  'Bull Market vs Bear Market (sem mimimi técnico) 🐂🐻',
  'Bull = touro = mercado subindo = stonks 📈. Bear = urso = mercado descendo = perda 📉. Simples assim, mano.',
  'O que significa Bull Market?',
  ARRAY['Mercado em alta/subindo', 'Mercado em baixa/caindo', 'Mercado de touros'],
  0,
  'glossario',
  10,
  0.5,
  'easy',
  CURRENT_DATE,
  false,
  true
),

-- Lições extras de amanhã
(
  gen_random_uuid(),
  'Como R$ 5 por dia vira R$ 1.800 por ano (magia não, matemática) ✨',
  'Aquele cafezinho de R$ 5 todo dia = R$ 150/mês = R$ 1.800/ano. Não tô falando pra parar de tomar café, mas pensa: dá um iPhone parcelado isso aí.',
  'Quanto você gastaria em um ano tomando café de R$ 5 todo dia?',
  ARRAY['R$ 1.800', 'R$ 1.200', 'R$ 2.400'],
  0,
  'curiosidades',
  12,
  0.6,
  'medium',
  CURRENT_DATE + INTERVAL '1 day',
  false,
  true
),

(
  gen_random_uuid(),
  'O que acontece se todo mundo sacar grana do banco junto? 🏃‍♂️💨',
  'Vira aquela correria de Black Friday, mas com dinheiro. O banco quebra porque não tem toda grana física. Por isso existe o Banco Central pra segurar a onda.',
  'Por que os bancos não têm todo o dinheiro fisicamente?',
  ARRAY['Porque emprestam parte do dinheiro', 'Porque guardam em outro lugar', 'Porque gastaram tudo'],
  0,
  'curiosidades',
  10,
  0.5,
  'medium',
  CURRENT_DATE + INTERVAL '1 day',
  false,
  true
);