export interface LessonContent {
  id: number;
  title: string;
  content: string;
  xpReward: number;
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
    title: "Orçamento Pessoal",
    description: "Aprenda a controlar seus gastos e criar um orçamento que funciona para você",
    progress: 3,
    totalLessons: 5,
    difficulty: "Básico",
    icon: "💰",
    isLocked: false,
    lessons: [
      {
        id: 1,
        title: "O que é um Orçamento?",
        content: `Um orçamento pessoal é um plano que ajuda você a controlar suas finanças, mostrando quanto dinheiro entra e sai da sua conta todo mês.

**Por que fazer um orçamento?**
- Controle total dos seus gastos
- Evitar dívidas desnecessárias  
- Conseguir economizar dinheiro
- Realizar seus sonhos financeiros

**Componentes básicos:**
1. **Receitas**: Todo dinheiro que você recebe
2. **Gastos fixos**: Contas que não mudam (aluguel, internet)
3. **Gastos variáveis**: Compras do dia a dia (comida, transporte)
4. **Poupança**: Dinheiro guardado para o futuro

Lembre-se: um bom orçamento é aquele que você consegue seguir!`,
        xpReward: 25
      },
      {
        id: 2,
        title: "Calculando sua Renda",
        content: `Para criar um orçamento eficaz, você precisa saber exatamente quanto dinheiro entra na sua conta.

**Tipos de renda para considerar:**
- Salário líquido (após descontos)
- Freelances e trabalhos extras
- Rendimentos de investimentos
- Mesada ou ajuda da família
- Vendas ocasionais

**Dica importante:** Use sempre o valor líquido (o que realmente cai na sua conta), não o valor bruto.

**Renda variável:** Se sua renda muda todo mês, use a média dos últimos 3-6 meses como base, mas seja conservador!

**Exercício prático:** Anote todas suas fontes de renda do último mês. Essa será a base do seu orçamento.`,
        xpReward: 25
      },
      {
        id: 3,
        title: "Identificando seus Gastos",
        content: `Agora vamos descobrir para onde vai seu dinheiro. Muitas pessoas se surpreendem ao ver seus gastos reais!

**Gastos Fixos (não mudam):**
- Aluguel/Financiamento
- Plano de celular
- Internet
- Seguros
- Assinaturas (Netflix, Spotify)

**Gastos Variáveis (mudam todo mês):**
- Alimentação
- Transporte
- Roupas
- Entretenimento
- Gastos médicos

**Como rastrear:** Use um app ou caderno por 1 semana para anotar TUDO que você gasta, até o cafezinho!

**Meta:** Seus gastos devem ser menor que sua renda. Se não for, precisamos ajustar!`,
        xpReward: 25
      },
      {
        id: 4,
        title: "Criando seu Primeiro Orçamento",
        content: `Agora vamos juntar tudo e criar seu orçamento pessoal!

**Fórmula simples:**
Renda - Gastos Fixos - Poupança = Dinheiro para Gastos Variáveis

**Regra 50-30-20:**
- 50% para necessidades (gastos fixos)
- 30% para desejos (lazer, entretenimento)
- 20% para poupança/investimentos

**Passos práticos:**
1. Liste sua renda total
2. Anote todos os gastos fixos
3. Defina quanto quer poupar (mínimo 10%)
4. O resto é para gastos variáveis
5. Acompanhe diariamente por 1 mês

**Lembre-se:** O primeiro orçamento nunca é perfeito. Ajuste conforme necessário!`,
        xpReward: 25
      },
      {
        id: 5,
        title: "Mantendo o Orçamento em Dia",
        content: `Criar o orçamento é só o começo. O segredo está em mantê-lo funcionando!

**Dicas para não desistir:**
- Revise semanalmente
- Use apps para facilitar o controle
- Seja realista com seus limites
- Perdoe-se se sair do orçamento às vezes
- Comemore quando conseguir seguir o plano

**Sinais de que precisa ajustar:**
- Sempre estourando o limite
- Não conseguindo poupar nada
- Sentindo que é muito restritivo
- Esquecendo de anotar gastos

**Ferramentas úteis:**
- Apps: GuiaBolso, Organizze, Mobills
- Planilhas: Google Sheets ou Excel
- Método físico: Envelope com dinheiro

**Objetivo final:** Tornar o controle financeiro um hábito natural!`,
        xpReward: 25
      }
    ]
  },
  {
    id: 2,
    title: "Poupança Inteligente",
    description: "Descubra estratégias para economizar dinheiro e construir sua reserva de emergência",
    progress: 0,
    totalLessons: 4,
    difficulty: "Básico",
    icon: "🏦",
    isLocked: false,
    lessons: [
      {
        id: 1,
        title: "Por que Poupar é Importante?",
        content: `Poupar dinheiro é uma das habilidades mais importantes para sua segurança financeira.

**Benefícios de ter uma poupança:**
- Segurança em emergências (perda de emprego, problemas de saúde)
- Liberdade para aproveitar oportunidades
- Menos estresse financeiro
- Possibilidade de realizar sonhos

**Tipos de poupança:**
1. **Reserva de emergência**: 6 meses de gastos básicos
2. **Objetivos específicos**: Viagem, carro, casa
3. **Aposentadoria**: Para o futuro distante

**Mito comum:** "Não ganho o suficiente para poupar"
**Verdade:** Qualquer quantia, mesmo R$ 10, já é um começo!

O importante é criar o hábito. Comece pequeno e vá aumentando gradualmente.`,
        xpReward: 30
      },
      {
        id: 2,
        title: "Estratégias para Economizar",
        content: `Existem várias maneiras inteligentes de economizar dinheiro no dia a dia.

**Estratégias de economia:**

**1. Pague-se primeiro**
- Assim que receber, já separe o dinheiro da poupança
- Trate como uma conta obrigatória

**2. Regra dos 30 dias**
- Para compras não essenciais, espere 30 dias
- Muitas vezes você vai perceber que não precisava

**3. Compare preços**
- Use apps como Zoom ou Buscape
- Pesquise em 3 lugares diferentes antes de comprar

**4. Evite desperdícios**
- Aproveite promoções de verdade
- Compre genéricos
- Reutilize e conserte quando possível

**5. Automatize a poupança**
- Configure transferência automática para a poupança
- Use o "dinheiro esquecido" que sobra na conta`,
        xpReward: 30
      },
      {
        id: 3,
        title: "Construindo sua Reserva de Emergência",
        content: `A reserva de emergência é sua proteção contra imprevistos financeiros.

**Quanto guardar?**
- Mínimo: 3 meses de gastos essenciais
- Ideal: 6 meses de gastos essenciais
- Conservador: 12 meses

**Como calcular:**
Some apenas os gastos que você NÃO pode cortar:
- Aluguel/Financiamento
- Alimentação básica
- Transporte para trabalho
- Remédios/Plano de saúde
- Contas básicas (luz, água, telefone)

**Onde guardar:**
- Poupança tradicional (fácil acesso)
- CDB com liquidez diária
- Tesouro Selic
- Conta corrente (só enquanto constrói)

**Cronograma sugerido:**
- Mês 1-3: R$ 1.000 iniciais
- Mês 4-12: Complete 3 meses de gastos
- Mês 13-24: Chegue aos 6 meses ideais

**Importante:** Só use em emergências REAIS!`,
        xpReward: 30
      },
      {
        id: 4,
        title: "Onde Guardar seu Dinheiro",
        content: `Saber onde colocar sua poupança é tão importante quanto poupar.

**Opções para iniciantes:**

**1. Poupança tradicional**
- Prós: Segura, fácil acesso, isenta de IR
- Contras: Rendimento baixo
- Ideal para: Reserva de emergência inicial

**2. CDB (Certificado de Depósito Bancário)**
- Prós: Rendimento melhor que poupança
- Contras: Pode ter carência
- Ideal para: Parte da reserva de emergência

**3. Tesouro Direto**
- Prós: Garantido pelo governo, bom rendimento
- Contras: Pode oscilar no curto prazo
- Ideal para: Objetivos de médio/longo prazo

**Dicas importantes:**
- Diversifique: não coloque tudo em um lugar
- Mantenha parte em alta liquidez (acesso imediato)
- Pesquise taxas antes de investir
- Comece simples e vá aprendendo

**Regra de ouro:** Comece guardando, mesmo que seja na poupança. O importante é criar o hábito!`,
        xpReward: 30
      }
    ]
  },
  {
    id: 3,
    title: "Investimentos Básicos",
    description: "Introdução ao mundo dos investimentos: ações, fundos e renda fixa",
    progress: 0,
    totalLessons: 6,
    difficulty: "Intermediário",
    icon: "📈",
    isLocked: true,
    lessons: [
      {
        id: 1,
        title: "Introdução aos Investimentos",
        content: "Conteúdo bloqueado - Complete as lições anteriores primeiro!",
        xpReward: 40
      }
    ]
  },
  {
    id: 4,
    title: "Planejamento Financeiro",
    description: "Aprenda a definir metas financeiras e criar um plano para alcançá-las",
    progress: 0,
    totalLessons: 5,
    difficulty: "Intermediário",
    icon: "🎯",
    isLocked: true,
    lessons: [
      {
        id: 1,
        title: "Definindo Metas Financeiras",
        content: "Conteúdo bloqueado - Complete as lições anteriores primeiro!",
        xpReward: 40
      }
    ]
  }
];