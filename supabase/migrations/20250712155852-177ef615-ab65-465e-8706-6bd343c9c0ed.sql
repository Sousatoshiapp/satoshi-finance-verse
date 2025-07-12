-- Corrigir erros de português brasileiro em todas as perguntas e respostas

-- Corrigir "e" para "é" nas perguntas
UPDATE quiz_questions SET question = 'O que é Day Trading?' WHERE question = 'O que e Day Trading?';
UPDATE quiz_questions SET question = 'O que é Stop Loss?' WHERE question = 'O que e Stop Loss?';
UPDATE quiz_questions SET question = 'O que é Análise Técnica?' WHERE question = 'O que e Analise Tecnica?';
UPDATE quiz_questions SET question = 'O que é Leverage?' WHERE question = 'O que e Leverage?';
UPDATE quiz_questions SET question = 'O que é Swing Trading?' WHERE question = 'O que e Swing Trading?';
UPDATE quiz_questions SET question = 'O que é Spread?' WHERE question = 'O que e Spread?';
UPDATE quiz_questions SET question = 'O que é Volume?' WHERE question = 'O que e Volume?';
UPDATE quiz_questions SET question = 'O que é Volatilidade?' WHERE question = 'O que e Volatilidade?';
UPDATE quiz_questions SET question = 'O que é Scalping?' WHERE question = 'O que e Scalping?';
UPDATE quiz_questions SET question = 'O que é uma Wallet?' WHERE question = 'O que e uma Wallet?';
UPDATE quiz_questions SET question = 'O que é Mining?' WHERE question = 'O que e Mining?';
UPDATE quiz_questions SET question = 'O que é uma Exchange?' WHERE question = 'O que e uma Exchange?';
UPDATE quiz_questions SET question = 'O que é DeFi?' WHERE question = 'O que e DeFi?';
UPDATE quiz_questions SET question = 'O que é Smart Contract?' WHERE question = 'O que e Smart Contract?';
UPDATE quiz_questions SET question = 'O que é Staking?' WHERE question = 'O que e Staking?';
UPDATE quiz_questions SET question = 'O que é NFT?' WHERE question = 'O que e NFT?';
UPDATE quiz_questions SET question = 'O que é Ethereum?' WHERE question = 'O que e Ethereum?';
UPDATE quiz_questions SET question = 'O que é HODL?' WHERE question = 'O que e HODL?';
UPDATE quiz_questions SET question = 'O que é diversificação?' WHERE question = 'O que e diversificacao?';
UPDATE quiz_questions SET question = 'O que é Asset Allocation?' WHERE question = 'O que e Asset Allocation?';
UPDATE quiz_questions SET question = 'O que é Rebalanceamento?' WHERE question = 'O que e Rebalanceamento?';
UPDATE quiz_questions SET question = 'O que é Correlação?' WHERE question = 'O que e Correlacao?';
UPDATE quiz_questions SET question = 'O que é Sharpe Ratio?' WHERE question = 'O que e Sharpe Ratio?';
UPDATE quiz_questions SET question = 'O que é Beta?' WHERE question = 'O que e Beta?';
UPDATE quiz_questions SET question = 'O que é Duration?' WHERE question = 'O que e Duration?';
UPDATE quiz_questions SET question = 'O que é Value at Risk?' WHERE question = 'O que e Value at Risk?';
UPDATE quiz_questions SET question = 'O que é Alpha?' WHERE question = 'O que e Alpha?';
UPDATE quiz_questions SET question = 'O que é Modern Portfolio Theory?' WHERE question = 'O que e Modern Portfolio Theory?';
UPDATE quiz_questions SET question = 'O que é Taxa Selic?' WHERE question = 'O que e Taxa Selic?';
UPDATE quiz_questions SET question = 'O que é Inflação?' WHERE question = 'O que e Inflacao?';
UPDATE quiz_questions SET question = 'O que é PIB?' WHERE question = 'O que e PIB?';
UPDATE quiz_questions SET question = 'O que é CDI?' WHERE question = 'O que e CDI?';
UPDATE quiz_questions SET question = 'O que é Tesouro Direto?' WHERE question = 'O que e Tesouro Direto?';
UPDATE quiz_questions SET question = 'O que é Imposto de Renda?' WHERE question = 'O que e Imposto de Renda?';
UPDATE quiz_questions SET question = 'O que é Liquidez?' WHERE question = 'O que e Liquidez?';
UPDATE quiz_questions SET question = 'O que é Rentabilidade?' WHERE question = 'O que e Rentabilidade?';
UPDATE quiz_questions SET question = 'O que é Benchmark?' WHERE question = 'O que e Benchmark?';
UPDATE quiz_questions SET question = 'O que é Compliance?' WHERE question = 'O que e Compliance?';

-- Corrigir acentos em opções e respostas corretas
UPDATE quiz_questions SET 
  options = '["Negociar apenas de dia", "Comprar e vender no mesmo dia", "Trading a longo prazo", "Investir em ações"]',
  correct_answer = 'Comprar e vender no mesmo dia',
  explanation = 'Day Trading envolve compra e venda no mesmo dia.'
WHERE id = 'e8d30ffd-40fa-4511-9000-458fd3a1127d';

UPDATE quiz_questions SET 
  options = '["Ganho máximo", "Ordem de proteção contra perdas", "Taxa de corretagem", "Dividendo"]',
  correct_answer = 'Ordem de proteção contra perdas'
WHERE id = 'bf80264e-0fec-484d-991b-fb1b7d3d5f3e';

UPDATE quiz_questions SET 
  options = '["Mercado em baixa", "Mercado em alta", "Mercado lateral", "Mercado volátil"]',
  correct_answer = 'Mercado em alta',
  explanation = 'Bull Market é período de crescimento contínuo.'
WHERE id = 'c533ba35-c338-4c74-b757-206d1409e8a1';

UPDATE quiz_questions SET 
  options = '["Análise de fundamentos", "Estudo de gráficos e preços", "Análise de balanços", "Estudo macroeconômico"]',
  correct_answer = 'Estudo de gráficos e preços',
  explanation = 'Análise Técnica usa histórico de preços.'
WHERE id = '35c6e170-ad78-4a82-ba9c-91525205aeb2';

UPDATE quiz_questions SET 
  options = '["Alavancagem financeira", "Taxa de juros", "Tipo de ação", "Estratégia conservadora"]',
  correct_answer = 'Alavancagem financeira'
WHERE id = 'ef69ae0e-789d-4f0d-991b-de91a110e093';

UPDATE quiz_questions SET 
  options = '["Trading intraday", "Posições por dias/semanas", "Trading alta frequência", "Investimento passivo"]',
  correct_answer = 'Posições por dias/semanas',
  explanation = 'Swing Trading mantém posições por dias ou semanas.'
WHERE id = '6b83d078-58ca-4bf2-8bf1-67a439451678';

UPDATE quiz_questions SET 
  options = '["Diferença entre compra e venda", "Taxa de corretagem", "Dividendo", "Valor patrimonial"]',
  correct_answer = 'Diferença entre compra e venda',
  explanation = 'Spread é diferença entre bid e ask.'
WHERE id = '982a5938-9731-4bf5-bfca-e5ccee12e849';

UPDATE quiz_questions SET 
  options = '["Preço do ativo", "Quantidade negociada", "Taxa de juros", "Volatilidade"]'
WHERE id = '87a2e3c7-55e7-4ed8-9775-6a90bde8c95c';

UPDATE quiz_questions SET 
  options = '["Estabilidade de preços", "Variação dos preços", "Tendência de alta", "Dividendos"]',
  correct_answer = 'Variação dos preços',
  explanation = 'Volatilidade mede variação de preços.'
WHERE id = 'd84c29a8-e4db-4c93-a330-b99924ff77fd';

UPDATE quiz_questions SET 
  options = '["Trading longo prazo", "Trading curtíssimo prazo", "Análise fundamentalista", "Investimento passivo"]',
  correct_answer = 'Trading curtíssimo prazo',
  explanation = 'Scalping busca lucros rápidos em minutos.'
WHERE id = '6dfb73e7-ef5c-4051-99ac-1f29c638da7b';

UPDATE quiz_questions SET 
  options = '["Carteira física", "Carteira digital para criptos", "Conta bancária", "Aplicativo de pagamento"]',
  correct_answer = 'Carteira digital para criptos'
WHERE id = '619e5d48-ba00-4951-be96-ae4518071f8e';

UPDATE quiz_questions SET 
  options = '["Comprar criptomoedas", "Validar transações na blockchain", "Vender criptomoedas", "Criar exchanges"]',
  correct_answer = 'Validar transações na blockchain',
  explanation = 'Mining valida transações e adiciona blocos.'
WHERE id = 'a71d3c6a-8894-41e1-b2c8-55941b3483e1';

UPDATE quiz_questions SET 
  options = '["Banco tradicional", "Plataforma para negociar cripto", "Carteira digital", "Protocolo blockchain"]'
WHERE id = '93cf81d6-4029-4016-84b2-6f2f9bc9a2df';

UPDATE quiz_questions SET 
  options = '["Bitcoin", "Finanças Descentralizadas", "Tipo de carteira", "Exchange centralizada"]',
  correct_answer = 'Finanças Descentralizadas',
  explanation = 'DeFi são aplicações financeiras descentralizadas.'
WHERE id = 'a8307f4b-3b79-40ab-a478-ad0e47a82025';

UPDATE quiz_questions SET 
  options = '["Contrato físico", "Contrato auto-executável", "Acordo bancário", "Aplicativo móvel"]',
  correct_answer = 'Contrato auto-executável'
WHERE id = '4253b337-f7e7-4734-8f98-caf4271bd5e2';

UPDATE quiz_questions SET 
  options = '["Minerar Bitcoin", "Participar na validação", "Vender criptomoedas", "Criar tokens"]',
  correct_answer = 'Participar na validação',
  explanation = 'Staking participa da validação de transações.'
WHERE id = '2b6e6215-6773-49ee-b250-e84ee72e6a0e';

UPDATE quiz_questions SET 
  options = '["Moeda digital", "Token Não-Fungível", "Protocolo blockchain", "Tipo de mineração"]',
  correct_answer = 'Token Não-Fungível',
  explanation = 'NFT representa propriedade de itens únicos.'
WHERE id = 'fe8afcc6-162a-4561-8652-d2dc586ed5ca';

UPDATE quiz_questions SET 
  options = '["Fork do Bitcoin", "Plataforma para smart contracts", "Exchange", "Carteira digital"]',
  correct_answer = 'Plataforma para smart contracts',
  explanation = 'Ethereum permite criação de smart contracts.'
WHERE id = '68f8e741-f5e7-4c65-8ba0-531fcd33f990';

UPDATE quiz_questions SET 
  options = '["Tipo de trading", "Estratégia de longo prazo", "Exchange", "Protocolo"]',
  correct_answer = 'Estratégia de longo prazo',
  explanation = 'HODL é estratégia de manter criptos longo prazo.'
WHERE id = '859707ff-d683-4a19-b109-1f19adb61ef2';

UPDATE quiz_questions SET 
  options = '["Concentrar em um ativo", "Distribuir investimentos", "Vender tudo", "Comprar apenas ações"]',
  explanation = 'Diversificação reduz risco distribuindo investimentos.'
WHERE id = '65f1ee4c-c05f-4324-a1aa-b79aeff84557';

UPDATE quiz_questions SET 
  options = '["Venda de ativos", "Alocação de ativos", "Compra de ações", "Análise técnica"]',
  correct_answer = 'Alocação de ativos'
WHERE id = 'a2558e7c-b841-42f6-ab87-8d0af7793b55';

UPDATE quiz_questions SET 
  options = '["Vender tudo", "Ajustar proporções do portfólio", "Comprar mais ações", "Calcular juros"]',
  correct_answer = 'Ajustar proporções do portfólio',
  explanation = 'Rebalanceamento restaura proporções originais.'
WHERE id = '0b43008b-9e17-401a-8de9-0ebb07b9c84f';

UPDATE quiz_questions SET 
  options = '["Preço de ativos", "Relação entre movimentos", "Taxa de retorno", "Dividendos"]',
  correct_answer = 'Relação entre movimentos'
WHERE id = '136324b3-b6cb-4448-9398-8b6b75e3c8b3';

UPDATE quiz_questions SET 
  options = '["Taxa de juros", "Medida retorno ajustada risco", "Preço de ações", "Volume negociação"]',
  correct_answer = 'Medida retorno ajustada risco',
  explanation = 'Sharpe Ratio mede retorno por unidade de risco.'
WHERE id = 'f3e66a02-6665-48ee-8901-f933332e04c1';

UPDATE quiz_questions SET 
  options = '["Tipo de ação", "Medida volatilidade relativa", "Taxa de dividendos", "Valor patrimonial"]',
  correct_answer = 'Medida volatilidade relativa'
WHERE id = 'f88dd749-f467-4e20-bad3-487d8e9cb507';

UPDATE quiz_questions SET 
  options = '["Prazo do investimento", "Sensibilidade a juros", "Taxa de retorno", "Valor presente"]',
  correct_answer = 'Sensibilidade a juros',
  explanation = 'Duration mede sensibilidade a mudanças de juros.'
WHERE id = 'cc9649bb-d425-4080-9733-24e9eb8254da';

UPDATE quiz_questions SET 
  options = '["Valor do portfólio", "Perda máxima esperada", "Ganho mínimo", "Taxa de juros"]',
  correct_answer = 'Perda máxima esperada',
  explanation = 'VaR estima perda máxima em período específico.'
WHERE id = 'e85fe966-0e59-43c8-86da-2b81d36f19c9';

UPDATE quiz_questions SET 
  options = '["Primeira ação", "Retorno em excesso", "Taxa de juros", "Dividendo"]',
  correct_answer = 'Retorno em excesso'
WHERE id = '999a9218-434b-456a-91ff-797a3c04fcd8';

UPDATE quiz_questions SET 
  options = '["Teoria antiga", "Otimização risco-retorno", "Análise técnica", "Teoria de jogos"]',
  correct_answer = 'Otimização risco-retorno'
WHERE id = '6e272e9d-2a05-49b8-bfc0-d55b9fcd189e';

UPDATE quiz_questions SET 
  options = '["Taxa de câmbio", "Taxa básica de juros", "Taxa de inflação", "Taxa de desemprego"]',
  correct_answer = 'Taxa básica de juros',
  explanation = 'Selic é a taxa básica de juros do Brasil.'
WHERE id = 'a2971ee6-94c0-48e6-a9f6-5b8c61fada6d';

UPDATE quiz_questions SET 
  options = '["Aumento de preços", "Queda de preços", "Estabilidade", "Taxa de juros"]',
  correct_answer = 'Aumento de preços',
  explanation = 'Inflação é aumento generalizado de preços.'
WHERE id = 'bd977b0c-2c83-4840-a9fb-e3c6185b1635';

UPDATE quiz_questions SET 
  options = '["Produto Interno Bruto", "Plano de Investimento", "Política Monetária", "Preço de Ações"]',
  correct_answer = 'Produto Interno Bruto',
  explanation = 'PIB mede valor total produzido no país.'
WHERE id = 'b367d3fc-def4-4f67-94c0-5ec54752c9ef';

UPDATE quiz_questions SET 
  options = '["Certificado de Depósito", "Conta Digital", "Cartão de Crédito", "Câmbio Dólar"]',
  correct_answer = 'Certificado de Depósito',
  explanation = 'CDI é taxa média de empréstimos entre bancos.'
WHERE id = '071a853c-c9a7-40cc-8371-227cb3497818';

UPDATE quiz_questions SET 
  options = '["Banco privado", "Programa de títulos públicos", "Fundo de investimento", "Corretora"]',
  correct_answer = 'Programa de títulos públicos'
WHERE id = '16c99c36-e8ea-4df8-8015-d1db25edebff';

UPDATE quiz_questions SET 
  options = '["Taxa sobre ganhos", "Taxa sobre vendas", "Taxa sobre importação", "Taxa sobre serviços"]',
  correct_answer = 'Taxa sobre ganhos'
WHERE id = '88065c72-27e5-4915-b0a0-be36ced48148';

UPDATE quiz_questions SET 
  options = '["Rentabilidade", "Facilidade conversão dinheiro", "Risco de investimento", "Taxa de juros"]',
  correct_answer = 'Facilidade conversão dinheiro'
WHERE id = 'bf3cd0ef-bbf2-4122-a430-cd54fc25949e';

UPDATE quiz_questions SET 
  options = '["Risco do investimento", "Retorno do investimento", "Taxa de juros", "Inflação"]'
WHERE id = '0ca07566-6a12-46d8-ae04-a1138fae88dc';

UPDATE quiz_questions SET 
  options = '["Tipo de investimento", "Parâmetro de comparação", "Taxa de corretagem", "Imposto"]',
  correct_answer = 'Parâmetro de comparação'
WHERE id = 'a9bd58f7-2185-4171-9afe-2ef28ca2b407';

UPDATE quiz_questions SET 
  options = '["Estratégia investimento", "Conformidade regulatória", "Análise de mercado", "Gestão de risco"]',
  correct_answer = 'Conformidade regulatória'
WHERE id = 'a0525a89-08b8-4be5-82d0-df5279ea3446';