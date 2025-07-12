-- Terceira correção de português brasileiro - versão corrigida para JSONB

-- Corrigir palavras comuns sem acentuação em campos de texto simples
UPDATE quiz_questions SET question = REPLACE(question, 'maximo', 'máximo');
UPDATE quiz_questions SET question = REPLACE(question, 'minimo', 'mínimo');
UPDATE quiz_questions SET question = REPLACE(question, 'basico', 'básico');
UPDATE quiz_questions SET question = REPLACE(question, 'economico', 'econômico');
UPDATE quiz_questions SET question = REPLACE(question, 'publico', 'público');
UPDATE quiz_questions SET question = REPLACE(question, 'pratico', 'prático');

-- Corrigir explicações
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'maximo', 'máximo') WHERE explanation IS NOT NULL;
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'minimo', 'mínimo') WHERE explanation IS NOT NULL;
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'basico', 'básico') WHERE explanation IS NOT NULL;
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'economico', 'econômico') WHERE explanation IS NOT NULL;
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'publico', 'público') WHERE explanation IS NOT NULL;
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'pratico', 'prático') WHERE explanation IS NOT NULL;
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'especifico', 'específico') WHERE explanation IS NOT NULL;
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'historico', 'histórico') WHERE explanation IS NOT NULL;
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'periodo', 'período') WHERE explanation IS NOT NULL;
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'rapidos', 'rápidos') WHERE explanation IS NOT NULL;
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'continuo', 'contínuo') WHERE explanation IS NOT NULL;
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'unicos', 'únicos') WHERE explanation IS NOT NULL;
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'medias', 'médias') WHERE explanation IS NOT NULL;
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'emprestimos', 'empréstimos') WHERE explanation IS NOT NULL;
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'titulos', 'títulos') WHERE explanation IS NOT NULL;
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'volatil', 'volátil') WHERE explanation IS NOT NULL;

-- Corrigir respostas corretas (campo texto simples)
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'maximo', 'máximo');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'minimo', 'mínimo');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'basico', 'básico');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'economico', 'econômico');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'publico', 'público');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'pratico', 'prático');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'especifico', 'específico');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'historico', 'histórico');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'periodo', 'período');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'rapidos', 'rápidos');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'continuo', 'contínuo');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'unicos', 'únicos');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'medias', 'médias');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'emprestimos', 'empréstimos');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'titulos', 'títulos');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'volatil', 'volátil');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'fisico', 'físico');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'bancario', 'bancário');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'movel', 'móvel');

-- Para as opções JSONB, vamos converter para texto, fazer replace e converter de volta
UPDATE quiz_questions SET options = 
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(options::text, 'maximo', 'máximo'),
                    'minimo', 'mínimo'
                  ),
                  'basico', 'básico'
                ),
                'economico', 'econômico'
              ),
              'publico', 'público'
            ),
            'pratico', 'prático'
          ),
          'especifico', 'específico'
        ),
        'historico', 'histórico'
      ),
      'periodo', 'período'
    ),
    'fisico', 'físico'
  )::jsonb;

-- Fazer segunda passada para mais correções
UPDATE quiz_questions SET options = 
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(options::text, 'rapidos', 'rápidos'),
                'continuo', 'contínuo'
              ),
              'unicos', 'únicos'
            ),
            'medias', 'médias'
          ),
          'emprestimos', 'empréstimos'
        ),
        'titulos', 'títulos'
      ),
      'volatil', 'volátil'
    ),
    'bancario', 'bancário'
  )::jsonb;

-- Terceira passada para correções finais
UPDATE quiz_questions SET options = 
  REPLACE(
    REPLACE(
      REPLACE(options::text, 'movel', 'móvel'),
      'credito', 'crédito'
    ),
    'cambio', 'câmbio'
  )::jsonb;