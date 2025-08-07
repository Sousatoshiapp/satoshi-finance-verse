import { XP_CONFIG } from '@/config/xp-config';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface LessonContent {
  id: number;
  title: string;
  content: string;
  xpReward: number;
  quiz?: {
    question: string;
    options: QuizOption[];
  };
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  difficulty: "Básico" | "Intermediário" | "Avançado";
  icon: string;
  isLocked: boolean;
  lessons: LessonContent[];
}

export const lessons: Lesson[] = [
  {
    id: 1,
    title: "Quiz: Orçamento Pessoal",
    description: "Teste seus conhecimentos sobre planejamento financeiro e controle de gastos",
    progress: 0,
    totalLessons: 5,
    difficulty: "Básico",
    icon: "💰",
    isLocked: false,
    lessons: [
      {
        id: 1,
        title: "O que é Orçamento?",
        content: "**Orçamento pessoal** é um plano que ajuda você a controlar suas finanças.\n\nÉ uma ferramenta fundamental para:\n• Saber para onde vai seu dinheiro\n• Planejar gastos futuros\n• Alcançar seus objetivos financeiros\n• Evitar dívidas desnecessárias\n\nCom um bom orçamento, você tem controle total sobre sua vida financeira!",
        xpReward: XP_CONFIG.LESSON_BASIC,
        quiz: {
          question: "Qual é o objetivo principal de um orçamento pessoal?",
          options: [
            { id: "a", text: "Gastar todo o dinheiro disponível", isCorrect: false },
            { id: "b", text: "Controlar e planejar as finanças pessoais", isCorrect: true },
            { id: "c", text: "Apenas anotar os gastos", isCorrect: false },
            { id: "d", text: "Investir em ações", isCorrect: false }
          ]
        }
      },
      {
        id: 2,
        title: "Receitas vs Despesas",
        content: "**Receitas** são todo o dinheiro que entra:\n• Salário\n• Freelances\n• Renda extra\n• Investimentos\n\n**Despesas** são todo o dinheiro que sai:\n• Moradia\n• Alimentação\n• Transporte\n• Lazer\n\nA regra de ouro: Receitas > Despesas = Vida financeira saudável!",
        xpReward: XP_CONFIG.LESSON_BASIC,
        quiz: {
          question: "Para ter uma vida financeira saudável, qual regra devemos seguir?",
          options: [
            { id: "a", text: "Receitas = Despesas", isCorrect: false },
            { id: "b", text: "Receitas > Despesas", isCorrect: true },
            { id: "c", text: "Receitas < Despesas", isCorrect: false },
            { id: "d", text: "Não importa a relação", isCorrect: false }
          ]
        }
      },
      {
        id: 3,
        title: "Método 50-30-20",
        content: "O **método 50-30-20** é uma forma simples de organizar seu orçamento:\n\n• **50%** para necessidades básicas (moradia, alimentação, transporte)\n• **30%** para desejos (lazer, hobbies, compras)\n• **20%** para poupança e investimentos\n\nEste método garante que você cubra o essencial, tenha diversão e ainda poupe para o futuro!",
        xpReward: XP_CONFIG.LESSON_BASIC,
        quiz: {
          question: "No método 50-30-20, qual porcentagem deve ser destinada à poupança?",
          options: [
            { id: "a", text: "50%", isCorrect: false },
            { id: "b", text: "30%", isCorrect: false },
            { id: "c", text: "20%", isCorrect: true },
            { id: "d", text: "10%", isCorrect: false }
          ]
        }
      },
      {
        id: 4,
        title: "Emergências Financeiras",
        content: "A **reserva de emergência** é fundamental para sua segurança financeira.\n\n**Valor ideal:** 6 a 12 meses de gastos essenciais\n\n**Para que serve:**\n• Perda de emprego\n• Problemas de saúde\n• Reparos urgentes\n• Oportunidades inesperadas\n\nSem reserva de emergência, qualquer imprevisto pode virar uma grande dívida!",
        xpReward: XP_CONFIG.LESSON_BASIC,
        quiz: {
          question: "Qual o valor ideal para uma reserva de emergência?",
          options: [
            { id: "a", text: "1 a 2 meses de gastos", isCorrect: false },
            { id: "b", text: "3 a 4 meses de gastos", isCorrect: false },
            { id: "c", text: "6 a 12 meses de gastos", isCorrect: true },
            { id: "d", text: "1 ano de salário", isCorrect: false }
          ]
        }
      },
      {
        id: 5,
        title: "Planejamento de Metas",
        content: "**Metas financeiras** dão propósito ao seu dinheiro!\n\n**Metas de curto prazo (até 1 ano):**\n• Viagem\n• Curso\n• Gadget\n\n**Metas de médio prazo (1-5 anos):**\n• Carro\n• Casa própria\n• Especialização\n\n**Metas de longo prazo (5+ anos):**\n• Aposentadoria\n• Educação dos filhos\n• Independência financeira\n\nCom metas claras, você se motiva a economizar e investir!",
        xpReward: XP_CONFIG.LESSON_BASIC,
        quiz: {
          question: "Qual é um exemplo de meta financeira de longo prazo?",
          options: [
            { id: "a", text: "Comprar um celular novo", isCorrect: false },
            { id: "b", text: "Fazer uma viagem", isCorrect: false },
            { id: "c", text: "Planejamento da aposentadoria", isCorrect: true },
            { id: "d", text: "Jantar em um restaurante caro", isCorrect: false }
          ]
        }
      }
    ]
  },
  {
    id: 2,
    title: "Quiz: Cartão de Crédito",
    description: "Aprenda a usar o cartão de crédito de forma inteligente e evite armadilhas",
    progress: 0,
    totalLessons: 4,
    difficulty: "Intermediário",
    icon: "💳",
    isLocked: true,
    lessons: [
      {
        id: 1,
        title: "Como Funciona o Cartão",
        content: "O **cartão de crédito** é uma ferramenta financeira poderosa quando usada corretamente.\n\n**Como funciona:**\n• Você compra e paga depois\n• O banco te empresta o dinheiro\n• Você paga na próxima fatura\n• Se não pagar tudo, cobra juros\n\n**Vantagens:**\n• Conveniência\n• Segurança\n• Pontos e benefícios\n• Histórico de crédito\n\n**Cuidados:**\n• Juros altos no rotativo\n• Facilidade de gastar demais",
        xpReward: XP_CONFIG.LESSON_INTERMEDIATE,
        quiz: {
          question: "Qual o maior risco do cartão de crédito?",
          options: [
            { id: "a", text: "Perder o cartão físico", isCorrect: false },
            { id: "b", text: "Entrar no rotativo com juros altos", isCorrect: true },
            { id: "c", text: "Não ganhar pontos", isCorrect: false },
            { id: "d", text: "Ter limite baixo", isCorrect: false }
          ]
        }
      },
      {
        id: 2,
        title: "Rotativo e Parcelamento",
        content: "**Rotativo** é quando você paga apenas parte da fatura.\n\n**Juros do rotativo:** Entre 300% a 500% ao ano!\n\n**Parcelamento:**\n• Juros menores que o rotativo\n• Parcelas fixas\n• Planejamento mais fácil\n\n**Melhor opção:** Sempre pagar a fatura integral!\n\nSe não conseguir, prefira o parcelamento ao rotativo.",
        xpReward: XP_CONFIG.LESSON_INTERMEDIATE,
        quiz: {
          question: "Entre rotativo e parcelamento, qual tem juros menores?",
          options: [
            { id: "a", text: "Rotativo", isCorrect: false },
            { id: "b", text: "Parcelamento", isCorrect: true },
            { id: "c", text: "São iguais", isCorrect: false },
            { id: "d", text: "Depende do banco", isCorrect: false }
          ]
        }
      },
      {
        id: 3,
        title: "Limite Consciente",
        content: "O **limite do cartão** não é extensão da sua renda!\n\n**Regra de ouro:** Use no máximo 30% do limite\n\n**Por que 30%?**\n• Mantém score alto\n• Evita gastos excessivos\n• Sobra margem para emergências\n• Melhora relacionamento com banco\n\n**Exemplo:**\n• Limite: R$ 1.000\n• Use no máximo: R$ 300\n\nAssim você usa o cartão a seu favor, não contra você!",
        xpReward: XP_CONFIG.LESSON_INTERMEDIATE,
        quiz: {
          question: "Qual porcentagem máxima do limite devemos usar?",
          options: [
            { id: "a", text: "100%", isCorrect: false },
            { id: "b", text: "50%", isCorrect: false },
            { id: "c", text: "30%", isCorrect: true },
            { id: "d", text: "10%", isCorrect: false }
          ]
        }
      },
      {
        id: 4,
        title: "Benefícios e Armadilhas",
        content: "**Benefícios do cartão:**\n• Cashback\n• Milhas aéreas\n• Descontos em parceiros\n• Seguro viagem\n• Proteção de compras\n\n**Armadilhas comuns:**\n• Anuidade alta\n• Juros escondidos\n• Seguros desnecessários\n• Compras por impulso\n• Limite muito alto\n\n**Dica de ouro:** Escolha cartão sem anuidade ou que compense os benefícios!",
        xpReward: XP_CONFIG.LESSON_INTERMEDIATE,
        quiz: {
          question: "Qual é a melhor estratégia para escolher um cartão?",
          options: [
            { id: "a", text: "Sempre o de maior limite", isCorrect: false },
            { id: "b", text: "O mais bonito", isCorrect: false },
            { id: "c", text: "Sem anuidade ou com benefícios que compensem", isCorrect: true },
            { id: "d", text: "O que o banco oferece", isCorrect: false }
          ]
        }
      }
    ]
  },
  {
    id: 3,
    title: "Quiz: Investimentos Básicos",
    description: "Descubra o mundo dos investimentos e faça seu dinheiro trabalhar para você",
    progress: 0,
    totalLessons: 5,
    difficulty: "Avançado",
    icon: "📈",
    isLocked: true,
    lessons: [
      {
        id: 1,
        title: "Por que Investir?",
        content: "**Investir** é fazer seu dinheiro trabalhar para você!\n\n**Inflação vs Poupança:**\n• Inflação: ~4% ao ano\n• Poupança: ~3% ao ano\n• Resultado: Você perde dinheiro!\n\n**Poder dos juros compostos:**\n• R$ 100 por mês\n• 12% ao ano\n• Em 10 anos: R$ 23.000!\n• Você investiu: R$ 12.000\n• Ganhou: R$ 11.000\n\nQuanto antes começar, melhor!",
        xpReward: XP_CONFIG.LESSON_ADVANCED,
        quiz: {
          question: "Por que a poupança não é um bom investimento?",
          options: [
            { id: "a", text: "É muito arriscada", isCorrect: false },
            { id: "b", text: "Rende menos que a inflação", isCorrect: true },
            { id: "c", text: "Tem muita taxa", isCorrect: false },
            { id: "d", text: "É difícil de sacar", isCorrect: false }
          ]
        }
      },
      {
        id: 2,
        title: "Renda Fixa vs Variável",
        content: "**Renda Fixa:**\n• Tesouro Direto\n• CDB\n• LCI/LCA\n• Rentabilidade previsível\n• Menor risco\n\n**Renda Variável:**\n• Ações\n• Fundos Imobiliários\n• Criptomoedas\n• Rentabilidade imprevisível\n• Maior risco e potencial retorno\n\n**Estratégia:** Comece com renda fixa, depois diversifique para renda variável!",
        xpReward: XP_CONFIG.LESSON_ADVANCED,
        quiz: {
          question: "Qual característica da renda fixa?",
          options: [
            { id: "a", text: "Alto risco", isCorrect: false },
            { id: "b", text: "Rentabilidade imprevisível", isCorrect: false },
            { id: "c", text: "Rentabilidade previsível", isCorrect: true },
            { id: "d", text: "Só para ricos", isCorrect: false }
          ]
        }
      },
      {
        id: 3,
        title: "Tesouro Direto",
        content: "O **Tesouro Direto** é o investimento mais seguro do Brasil!\n\n**Tipos:**\n• **Selic:** Segue a taxa básica\n• **Prefixado:** Taxa fixa conhecida\n• **IPCA+:** Protege da inflação\n\n**Vantagens:**\n• Garantido pelo governo\n• A partir de R$ 30\n• Liquidez diária\n• Baixas taxas\n\n**Ideal para:** Reserva de emergência e primeiros investimentos!",
        xpReward: XP_CONFIG.LESSON_ADVANCED,
        quiz: {
          question: "Qual tipo de Tesouro protege contra a inflação?",
          options: [
            { id: "a", text: "Tesouro Selic", isCorrect: false },
            { id: "b", text: "Tesouro Prefixado", isCorrect: false },
            { id: "c", text: "Tesouro IPCA+", isCorrect: true },
            { id: "d", text: "Todos protegem", isCorrect: false }
          ]
        }
      },
      {
        id: 4,
        title: "Diversificação",
        content: "**Diversificação** é não colocar todos os ovos na mesma cesta!\n\n**Por que diversificar:**\n• Reduz riscos\n• Aproveita diferentes oportunidades\n• Protege contra crises setoriais\n\n**Como diversificar:**\n• Renda fixa + variável\n• Diferentes setores\n• Brasil + exterior\n• Curto + longo prazo\n\n**Regra:** Nunca mais de 10% em um único ativo!",
        xpReward: XP_CONFIG.LESSON_ADVANCED,
        quiz: {
          question: "Qual o principal benefício da diversificação?",
          options: [
            { id: "a", text: "Aumentar os ganhos sempre", isCorrect: false },
            { id: "b", text: "Reduzir riscos", isCorrect: true },
            { id: "c", text: "Facilitar o controle", isCorrect: false },
            { id: "d", text: "Pagar menos impostos", isCorrect: false }
          ]
        }
      },
      {
        id: 5,
        title: "Perfil de Investidor",
        content: "Conheça seu **perfil de risco**:\n\n**Conservador:**\n• Prioriza segurança\n• Aceita rentabilidade menor\n• Renda fixa em sua maioria\n\n**Moderado:**\n• Equilíbrio risco/retorno\n• Mix renda fixa e variável\n• Perfil mais comum\n\n**Arrojado:**\n• Aceita riscos altos\n• Busca rentabilidade alta\n• Foco em renda variável\n\n**Importante:** Seu perfil pode mudar com o tempo e objetivos!",
        xpReward: XP_CONFIG.LESSON_ADVANCED,
        quiz: {
          question: "Qual perfil busca equilíbrio entre risco e retorno?",
          options: [
            { id: "a", text: "Conservador", isCorrect: false },
            { id: "b", text: "Moderado", isCorrect: true },
            { id: "c", text: "Arrojado", isCorrect: false },
            { id: "d", text: "Nenhum", isCorrect: false }
          ]
        }
      }
    ]
  }
];