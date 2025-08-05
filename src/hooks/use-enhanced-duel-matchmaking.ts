import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MatchmakingResult {
  opponentId: string | null;
  opponentType: 'human' | 'bot' | 'waiting';
  matchFound: boolean;
  opponentData?: any;
}

export function useEnhancedDuelMatchmaking() {
  const [isSearching, setIsSearching] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchmakingResult | null>(null);
  const { toast } = useToast();

  const startMatchmaking = async (topic: string = 'financas') => {
    try {
      setIsSearching(true);
      setMatchResult(null);
      
      // Get current user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Call the automatic opponent finding function
      const { data: result, error } = await supabase.rpc('find_automatic_opponent', {
        p_user_id: profile.id,
        p_topic: topic
      });

      if (error) throw error;

      const matchData = result[0];
      
      if (matchData.match_found) {
        // Get opponent data
        const { data: opponentData } = await supabase
          .from('profiles')
          .select(`
            id, nickname, level, avatar_id, is_bot,
            avatars (name, image_url, avatar_class)
          `)
          .eq('id', matchData.opponent_id)
          .single();

        setMatchResult({
          opponentId: matchData.opponent_id,
          opponentType: matchData.opponent_type as 'human' | 'bot',
          matchFound: true,
          opponentData
        });
        
        toast({
          title: "🎯 Oponente encontrado!",
          description: `Preparando duelo contra ${opponentData?.nickname || 'oponente'}...`,
        });
      } else {
        setMatchResult({
          opponentId: null,
          opponentType: 'waiting',
          matchFound: false
        });
        
        // Poll for matches every 2 seconds
        const pollInterval = setInterval(async () => {
          try {
            const { data: pollResult } = await supabase.rpc('find_automatic_opponent', {
              p_user_id: profile.id,
              p_topic: topic
            });
            
            const pollData = pollResult[0];
            if (pollData.match_found) {
              clearInterval(pollInterval);
              
              // Get opponent data
              const { data: opponentData } = await supabase
                .from('profiles')
                .select(`
                  id, nickname, level, avatar_id, is_bot,
                  avatars (name, image_url, avatar_class)
                `)
                .eq('id', pollData.opponent_id)
                .single();

              setMatchResult({
                opponentId: pollData.opponent_id,
                opponentType: pollData.opponent_type as 'human' | 'bot',
                matchFound: true,
                opponentData
              });
              
              toast({
                title: "🎉 Match encontrado!",
                description: `Duelo iniciado contra ${opponentData?.nickname || 'oponente'}!`,
              });
            }
          } catch (error) {
            console.error('Error polling for matches:', error);
          }
        }, 2000);
        
        // Stop polling after 30 seconds
        setTimeout(() => {
          clearInterval(pollInterval);
          if (isSearching) {
            setIsSearching(false);
            toast({
              title: "⏰ Tempo esgotado",
              description: "Nenhum oponente encontrado. Tente novamente.",
              variant: "destructive"
            });
          }
        }, 30000);
      }
    } catch (error) {
      console.error('Matchmaking error:', error);
      toast({
        title: "❌ Erro no matchmaking",
        description: "Não foi possível encontrar oponente",
        variant: "destructive"
      });
      setIsSearching(false);
    }
  };

  const cancelMatchmaking = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        // Remove from queue
        await supabase
          .from('duel_queue')
          .delete()
          .eq('user_id', profile.id);
      }
    } catch (error) {
      console.error('Error canceling matchmaking:', error);
    }
    
    setIsSearching(false);
    setMatchResult(null);
  };

  const createDuel = async (opponentId: string, topic: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Generate 10 random questions for the duel
      const questions = await generateDuelQuestions(topic, 10);
      
      // Use RPC function to create duel with proper permissions
      const { data: duelId, error: duelError } = await supabase.rpc('create_duel_with_invite', {
        p_challenger_id: profile.id,
        p_challenged_id: opponentId,
        p_quiz_topic: topic,
        p_questions: questions
      });

      if (duelError) throw duelError;

      return { id: duelId };
    } catch (error) {
      console.error('Error creating duel:', error);
      throw error;
    }
  };

  return {
    isSearching,
    matchResult,
    startMatchmaking,
    cancelMatchmaking,
    createDuel,
    setIsSearching
  };
}

async function generateDuelQuestions(topic: string, count: number = 10) {
  // Expanded question pool with 10+ questions per topic
  const questionPools = {
    financas: [
      {
        id: '1',
        question: 'O que é diversificação de investimentos?',
        options: [
          { id: 'a', text: 'Investir apenas em ações', isCorrect: false },
          { id: 'b', text: 'Distribuir investimentos em diferentes ativos', isCorrect: true },
          { id: 'c', text: 'Investir apenas em renda fixa', isCorrect: false },
          { id: 'd', text: 'Comprar apenas um tipo de ação', isCorrect: false }
        ]
      },
      {
        id: '2',
        question: 'O que é o CDI?',
        options: [
          { id: 'a', text: 'Certificado de Depósito Interbancário', isCorrect: true },
          { id: 'b', text: 'Conta de Depósito Individual', isCorrect: false },
          { id: 'c', text: 'Central de Dados Internacionais', isCorrect: false },
          { id: 'd', text: 'Cadastro de Investidores', isCorrect: false }
        ]
      },
      {
        id: '3',
        question: 'Qual é a principal característica da renda fixa?',
        options: [
          { id: 'a', text: 'Alto risco', isCorrect: false },
          { id: 'b', text: 'Rentabilidade previsível', isCorrect: true },
          { id: 'c', text: 'Volatilidade alta', isCorrect: false },
          { id: 'd', text: 'Liquidez baixa', isCorrect: false }
        ]
      },
      {
        id: '4',
        question: 'O que são ações?',
        options: [
          { id: 'a', text: 'Títulos de dívida', isCorrect: false },
          { id: 'b', text: 'Participações no capital de empresas', isCorrect: true },
          { id: 'c', text: 'Investimentos imobiliários', isCorrect: false },
          { id: 'd', text: 'Reservas bancárias', isCorrect: false }
        ]
      },
      {
        id: '5',
        question: 'Qual é o objetivo da reserva de emergência?',
        options: [
          { id: 'a', text: 'Investir em ações', isCorrect: false },
          { id: 'b', text: 'Cobrir gastos imprevistos', isCorrect: true },
          { id: 'c', text: 'Pagar impostos', isCorrect: false },
          { id: 'd', text: 'Comprar bens de luxo', isCorrect: false }
        ]
      },
      {
        id: '6',
        question: 'O que é inflação?',
        options: [
          { id: 'a', text: 'Aumento geral dos preços', isCorrect: true },
          { id: 'b', text: 'Diminuição dos juros', isCorrect: false },
          { id: 'c', text: 'Valorização da moeda', isCorrect: false },
          { id: 'd', text: 'Crescimento econômico', isCorrect: false }
        ]
      },
      {
        id: '7',
        question: 'Qual a vantagem dos fundos de investimento?',
        options: [
          { id: 'a', text: 'Garantia de lucro', isCorrect: false },
          { id: 'b', text: 'Gestão profissional', isCorrect: true },
          { id: 'c', text: 'Isenção de impostos', isCorrect: false },
          { id: 'd', text: 'Liquidez zero', isCorrect: false }
        ]
      },
      {
        id: '8',
        question: 'O que é Tesouro Direto?',
        options: [
          { id: 'a', text: 'Ações do governo', isCorrect: false },
          { id: 'b', text: 'Títulos públicos federais', isCorrect: true },
          { id: 'c', text: 'Investimentos privados', isCorrect: false },
          { id: 'd', text: 'Moedas digitais', isCorrect: false }
        ]
      },
      {
        id: '9',
        question: 'Qual é o risco da renda variável?',
        options: [
          { id: 'a', text: 'Perda de capital', isCorrect: true },
          { id: 'b', text: 'Ganho garantido', isCorrect: false },
          { id: 'c', text: 'Juros baixos', isCorrect: false },
          { id: 'd', text: 'Liquidez alta', isCorrect: false }
        ]
      },
      {
        id: '10',
        question: 'O que significa IPO?',
        options: [
          { id: 'a', text: 'Investimento Pessoal Online', isCorrect: false },
          { id: 'b', text: 'Oferta Pública Inicial', isCorrect: true },
          { id: 'c', text: 'Índice de Preços Oficial', isCorrect: false },
          { id: 'd', text: 'Imposto sobre Operações', isCorrect: false }
        ]
      },
      {
        id: '11',
        question: 'O que é taxa Selic?',
        options: [
          { id: 'a', text: 'Taxa básica de juros da economia', isCorrect: true },
          { id: 'b', text: 'Taxa de câmbio', isCorrect: false },
          { id: 'c', text: 'Taxa de inflação', isCorrect: false },
          { id: 'd', text: 'Taxa de desemprego', isCorrect: false }
        ]
      },
      {
        id: '12',
        question: 'Qual o prazo ideal para reserva de emergência?',
        options: [
          { id: 'a', text: '3 a 6 meses de gastos', isCorrect: true },
          { id: 'b', text: '1 mês de gastos', isCorrect: false },
          { id: 'c', text: '1 ano de gastos', isCorrect: false },
          { id: 'd', text: '2 anos de gastos', isCorrect: false }
        ]
      }
    ],
    investimentos: [
      {
        id: '1',
        question: 'O que caracteriza um investimento de longo prazo?',
        options: [
          { id: 'a', text: 'Prazo superior a 2 anos', isCorrect: true },
          { id: 'b', text: 'Prazo de 6 meses', isCorrect: false },
          { id: 'c', text: 'Prazo de 1 ano', isCorrect: false },
          { id: 'd', text: 'Prazo de 3 meses', isCorrect: false }
        ]
      },
      {
        id: '2',
        question: 'Qual é o principal objetivo da diversificação?',
        options: [
          { id: 'a', text: 'Reduzir riscos', isCorrect: true },
          { id: 'b', text: 'Aumentar lucros', isCorrect: false },
          { id: 'c', text: 'Facilitar gestão', isCorrect: false },
          { id: 'd', text: 'Reduzir custos', isCorrect: false }
        ]
      },
      {
        id: '3',
        question: 'O que é uma carteira de investimentos?',
        options: [
          { id: 'a', text: 'Uma conta bancária', isCorrect: false },
          { id: 'b', text: 'Conjunto de ativos financeiros', isCorrect: true },
          { id: 'c', text: 'Um tipo de seguro', isCorrect: false },
          { id: 'd', text: 'Uma forma de pagamento', isCorrect: false }
        ]
      },
      {
        id: '4',
        question: 'Qual a diferença entre renda fixa e variável?',
        options: [
          { id: 'a', text: 'Previsibilidade de retornos', isCorrect: true },
          { id: 'b', text: 'Valor mínimo de investimento', isCorrect: false },
          { id: 'c', text: 'Prazo de investimento', isCorrect: false },
          { id: 'd', text: 'Forma de pagamento', isCorrect: false }
        ]
      },
      {
        id: '5',
        question: 'O que é rentabilidade real?',
        options: [
          { id: 'a', text: 'Rentabilidade total', isCorrect: false },
          { id: 'b', text: 'Rentabilidade descontada a inflação', isCorrect: true },
          { id: 'c', text: 'Rentabilidade mínima', isCorrect: false },
          { id: 'd', text: 'Rentabilidade máxima', isCorrect: false }
        ]
      },
      {
        id: '6',
        question: 'Qual a função de um fundo de investimento?',
        options: [
          { id: 'a', text: 'Reunir recursos para investir', isCorrect: true },
          { id: 'b', text: 'Guardar dinheiro', isCorrect: false },
          { id: 'c', text: 'Emprestar dinheiro', isCorrect: false },
          { id: 'd', text: 'Seguro de vida', isCorrect: false }
        ]
      },
      {
        id: '7',
        question: 'O que são dividendos?',
        options: [
          { id: 'a', text: 'Taxas de administração', isCorrect: false },
          { id: 'b', text: 'Distribuição de lucros aos acionistas', isCorrect: true },
          { id: 'c', text: 'Impostos sobre investimentos', isCorrect: false },
          { id: 'd', text: 'Comissões de corretagem', isCorrect: false }
        ]
      },
      {
        id: '8',
        question: 'Qual é o risco de liquidez?',
        options: [
          { id: 'a', text: 'Perda de capital', isCorrect: false },
          { id: 'b', text: 'Dificuldade para vender o ativo', isCorrect: true },
          { id: 'c', text: 'Variação de preços', isCorrect: false },
          { id: 'd', text: 'Falência da empresa', isCorrect: false }
        ]
      },
      {
        id: '9',
        question: 'O que é uma LCI?',
        options: [
          { id: 'a', text: 'Letra de Crédito Imobiliário', isCorrect: true },
          { id: 'b', text: 'Linha de Crédito Internacional', isCorrect: false },
          { id: 'c', text: 'Liquidação de Conta Investimento', isCorrect: false },
          { id: 'd', text: 'Lista de Cotações Internacionais', isCorrect: false }
        ]
      },
      {
        id: '10',
        question: 'Qual o prazo de carência comum em investimentos?',
        options: [
          { id: 'a', text: '30 a 90 dias', isCorrect: true },
          { id: 'b', text: '1 a 2 anos', isCorrect: false },
          { id: 'c', text: '5 a 10 anos', isCorrect: false },
          { id: 'd', text: 'Não existe carência', isCorrect: false }
        ]
      }
    ],
    criptomoedas: [
      {
        id: '1',
        question: 'O que é Bitcoin?',
        options: [
          { id: 'a', text: 'Uma moeda digital descentralizada', isCorrect: true },
          { id: 'b', text: 'Uma empresa de tecnologia', isCorrect: false },
          { id: 'c', text: 'Um banco digital', isCorrect: false },
          { id: 'd', text: 'Uma rede social', isCorrect: false }
        ]
      },
      {
        id: '2',
        question: 'O que é blockchain?',
        options: [
          { id: 'a', text: 'Um tipo de criptomoeda', isCorrect: false },
          { id: 'b', text: 'Tecnologia de registro distribuído', isCorrect: true },
          { id: 'c', text: 'Uma exchange', isCorrect: false },
          { id: 'd', text: 'Um wallet digital', isCorrect: false }
        ]
      },
      {
        id: '3',
        question: 'O que é Ethereum?',
        options: [
          { id: 'a', text: 'Uma cópia do Bitcoin', isCorrect: false },
          { id: 'b', text: 'Plataforma para contratos inteligentes', isCorrect: true },
          { id: 'c', text: 'Um banco tradicional', isCorrect: false },
          { id: 'd', text: 'Uma moeda física', isCorrect: false }
        ]
      },
      {
        id: '4',
        question: 'O que são altcoins?',
        options: [
          { id: 'a', text: 'Criptomoedas alternativas ao Bitcoin', isCorrect: true },
          { id: 'b', text: 'Moedas físicas antigas', isCorrect: false },
          { id: 'c', text: 'Moedas de outros países', isCorrect: false },
          { id: 'd', text: 'Moedas falsas', isCorrect: false }
        ]
      },
      {
        id: '5',
        question: 'O que é DeFi?',
        options: [
          { id: 'a', text: 'Definição Financeira', isCorrect: false },
          { id: 'b', text: 'Finanças Descentralizadas', isCorrect: true },
          { id: 'c', text: 'Déficit Financeiro', isCorrect: false },
          { id: 'd', text: 'Depósito Fixo', isCorrect: false }
        ]
      },
      {
        id: '6',
        question: 'O que é uma wallet de criptomoedas?',
        options: [
          { id: 'a', text: 'Carteira física para moedas', isCorrect: false },
          { id: 'b', text: 'Software para armazenar chaves privadas', isCorrect: true },
          { id: 'c', text: 'Conta bancária tradicional', isCorrect: false },
          { id: 'd', text: 'Cartão de crédito especial', isCorrect: false }
        ]
      },
      {
        id: '7',
        question: 'O que é mineração de criptomoedas?',
        options: [
          { id: 'a', text: 'Extração física de ouro digital', isCorrect: false },
          { id: 'b', text: 'Processo de validação de transações', isCorrect: true },
          { id: 'c', text: 'Compra de criptomoedas', isCorrect: false },
          { id: 'd', text: 'Venda de criptomoedas', isCorrect: false }
        ]
      },
      {
        id: '8',
        question: 'O que é HODL?',
        options: [
          { id: 'a', text: 'Vender rapidamente', isCorrect: false },
          { id: 'b', text: 'Manter por longo prazo', isCorrect: true },
          { id: 'c', text: 'Trocar constantemente', isCorrect: false },
          { id: 'd', text: 'Emprestar moedas', isCorrect: false }
        ]
      },
      {
        id: '9',
        question: 'O que são smart contracts?',
        options: [
          { id: 'a', text: 'Contratos em papel inteligente', isCorrect: false },
          { id: 'b', text: 'Contratos autoexecutáveis em blockchain', isCorrect: true },
          { id: 'c', text: 'Contratos com advogados', isCorrect: false },
          { id: 'd', text: 'Contratos de trabalho', isCorrect: false }
        ]
      },
      {
        id: '10',
        question: 'O que é uma ICO?',
        options: [
          { id: 'a', text: 'Oferta Inicial de Moedas', isCorrect: true },
          { id: 'b', text: 'Investimento Controlado Online', isCorrect: false },
          { id: 'c', text: 'Índice de Cotação Online', isCorrect: false },
          { id: 'd', text: 'Internet das Coisas', isCorrect: false }
        ]
      }
    ],
    economia: [
      {
        id: '1',
        question: 'O que é PIB?',
        options: [
          { id: 'a', text: 'Produto Interno Bruto', isCorrect: true },
          { id: 'b', text: 'Plano de Investimento Bancário', isCorrect: false },
          { id: 'c', text: 'Programa de Incentivo Brasileiro', isCorrect: false },
          { id: 'd', text: 'Política de Interesse Básico', isCorrect: false }
        ]
      },
      {
        id: '2',
        question: 'O que causa inflação?',
        options: [
          { id: 'a', text: 'Aumento da oferta de dinheiro', isCorrect: true },
          { id: 'b', text: 'Diminuição dos preços', isCorrect: false },
          { id: 'c', text: 'Redução da demanda', isCorrect: false },
          { id: 'd', text: 'Baixo desemprego apenas', isCorrect: false }
        ]
      },
      {
        id: '3',
        question: 'O que é taxa de desemprego?',
        options: [
          { id: 'a', text: 'Percentual de pessoas sem trabalho', isCorrect: true },
          { id: 'b', text: 'Número total de desempregados', isCorrect: false },
          { id: 'c', text: 'Taxa de crescimento de empregos', isCorrect: false },
          { id: 'd', text: 'Salário médio dos trabalhadores', isCorrect: false }
        ]
      },
      {
        id: '4',
        question: 'O que é déficit público?',
        options: [
          { id: 'a', text: 'Gastos maiores que receitas', isCorrect: true },
          { id: 'b', text: 'Superávit orçamentário', isCorrect: false },
          { id: 'c', text: 'Receitas equilibradas', isCorrect: false },
          { id: 'd', text: 'Crescimento econômico', isCorrect: false }
        ]
      },
      {
        id: '5',
        question: 'O que é balança comercial?',
        options: [
          { id: 'a', text: 'Diferença entre exportações e importações', isCorrect: true },
          { id: 'b', text: 'Total de vendas no comércio', isCorrect: false },
          { id: 'c', text: 'Impostos sobre comércio', isCorrect: false },
          { id: 'd', text: 'Número de empresas comerciais', isCorrect: false }
        ]
      },
      {
        id: '6',
        question: 'O que é recessão econômica?',
        options: [
          { id: 'a', text: 'Duas quedas consecutivas do PIB', isCorrect: true },
          { id: 'b', text: 'Aumento da inflação', isCorrect: false },
          { id: 'c', text: 'Crescimento do emprego', isCorrect: false },
          { id: 'd', text: 'Valorização da moeda', isCorrect: false }
        ]
      },
      {
        id: '7',
        question: 'O que é política monetária?',
        options: [
          { id: 'a', text: 'Controle da oferta de moeda e juros', isCorrect: true },
          { id: 'b', text: 'Gastos do governo', isCorrect: false },
          { id: 'c', text: 'Impostos e tributos', isCorrect: false },
          { id: 'd', text: 'Comércio exterior', isCorrect: false }
        ]
      },
      {
        id: '8',
        question: 'O que é câmbio?',
        options: [
          { id: 'a', text: 'Troca entre moedas diferentes', isCorrect: true },
          { id: 'b', text: 'Compra de ações', isCorrect: false },
          { id: 'c', text: 'Empréstimo bancário', isCorrect: false },
          { id: 'd', text: 'Investimento imobiliário', isCorrect: false }
        ]
      },
      {
        id: '9',
        question: 'O que é mercado de capitais?',
        options: [
          { id: 'a', text: 'Local de negociação de valores mobiliários', isCorrect: true },
          { id: 'b', text: 'Mercado de produtos agrícolas', isCorrect: false },
          { id: 'c', text: 'Loja de capitais físicos', isCorrect: false },
          { id: 'd', text: 'Mercado de trabalho', isCorrect: false }
        ]
      },
      {
        id: '10',
        question: 'O que é spread bancário?',
        options: [
          { id: 'a', text: 'Diferença entre juros pagos e cobrados', isCorrect: true },
          { id: 'b', text: 'Taxa de administração', isCorrect: false },
          { id: 'c', text: 'Imposto sobre operações', isCorrect: false },
          { id: 'd', text: 'Seguro de depósitos', isCorrect: false }
        ]
      }
    ]
  };

  const pool = questionPools[topic as keyof typeof questionPools] || questionPools.financas;
  
  // Shuffle and select random questions
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}