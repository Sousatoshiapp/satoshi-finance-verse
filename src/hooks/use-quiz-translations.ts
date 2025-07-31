import { useI18n } from "@/hooks/use-i18n";
import { QuizQuestion } from "@/hooks/use-quiz-shuffle";

// Comprehensive mapping for all quiz questions
const questionTranslations: Record<string, Record<string, any>> = {
  "What is the main function of a stock exchange?": {
    'en-US': {
      question: "What is the main function of a stock exchange?",
      options: ["Lend money to companies", "Facilitate trading of securities", "Set interest rates", "Print money"],
      correct_answer: "Facilitate trading of securities",
      explanation: "Stock exchanges facilitate the trading of securities between buyers and sellers."
    },
    'pt-BR': {
      question: "Qual é a principal função de uma bolsa de valores?",
      options: ["Emprestar dinheiro para empresas", "Facilitar a negociação de títulos", "Definir taxas de juros", "Imprimir dinheiro"],
      correct_answer: "Facilitar a negociação de títulos",
      explanation: "Bolsas de valores facilitam a negociação de títulos entre compradores e vendedores."
    }
  },
  "What does IPO stand for?": {
    'en-US': {
      question: "What does IPO stand for?",
      options: ["Initial Public Offering", "International Purchase Order", "Investment Portfolio Options", "Internal Price Optimization"],
      correct_answer: "Initial Public Offering",
      explanation: "IPO stands for Initial Public Offering, when a company first sells shares to the public."
    },
    'pt-BR': {
      question: "O que significa IPO?",
      options: ["Oferta Pública Inicial", "Ordem de Compra Internacional", "Opções de Portfólio de Investimento", "Otimização Interna de Preços"],
      correct_answer: "Oferta Pública Inicial",
      explanation: "IPO significa Oferta Pública Inicial, quando uma empresa vende ações ao público pela primeira vez."
    }
  },
  "What is diversification in investing?": {
    'en-US': {
      question: "What is diversification in investing?",
      options: ["Investing all money in one stock", "Spreading investments across different assets", "Only buying stocks", "Selling all investments"],
      correct_answer: "Spreading investments across different assets",
      explanation: "Diversification involves spreading investments across different assets to reduce risk."
    },
    'pt-BR': {
      question: "O que é diversificação em investimentos?",
      options: ["Investir todo o dinheiro em uma ação", "Espalhar investimentos entre diferentes ativos", "Comprar apenas ações", "Vender todos os investimentos"],
      correct_answer: "Espalhar investimentos entre diferentes ativos",
      explanation: "Diversificação envolve espalhar investimentos entre diferentes ativos para reduzir riscos."
    }
  },
  "O que é DeFi?": {
    'en-US': {
      question: "What is DeFi?",
      options: ["Bitcoin", "Decentralized Finance", "Type of wallet", "Centralized exchange"],
      correct_answer: "Decentralized Finance",
      explanation: "DeFi are decentralized financial applications."
    },
    'pt-BR': {
      question: "O que é DeFi?",
      options: ["Bitcoin", "Finanças Descentralizadas", "Tipo de carteira", "Exchange centralizada"],
      correct_answer: "Finanças Descentralizadas",
      explanation: "DeFi são aplicações financeiras descentralizadas."
    }
  },
  "O que é Correlação?": {
    'en-US': {
      question: "What is Correlation?",
      options: ["Asset price", "Relationship between movements", "Return rate", "Dividends"],
      correct_answer: "Relationship between movements",
      explanation: "Correlation measures how assets move together."
    },
    'pt-BR': {
      question: "O que é Correlação?",
      options: ["Preço de ativos", "Relação entre movimentos", "Taxa de retorno", "Dividendos"],
      correct_answer: "Relação entre movimentos",
      explanation: "Correlacao mede como ativos se movem juntos."
    }
  },
  "Quem criou o Bitcoin?": {
    'en-US': {
      question: "Who created Bitcoin?",
      options: ["Vitalik Buterin", "Satoshi Nakamoto", "Charlie Lee", "Gavin Andresen"],
      correct_answer: "Satoshi Nakamoto",
      explanation: "Satoshi Nakamoto is the pseudonym of Bitcoin's creator."
    },
    'pt-BR': {
      question: "Quem criou o Bitcoin?",
      options: ["Vitalik Buterin", "Satoshi Nakamoto", "Charlie Lee", "Gavin Andresen"],
      correct_answer: "Satoshi Nakamoto",
      explanation: "Satoshi Nakamoto e o pseudonimo do criador do Bitcoin."
    }
  },
  "O que é Duration?": {
    'en-US': {
      question: "What is Duration?",
      options: ["Investment term", "Interest rate sensitivity", "Return rate", "Present value"],
      correct_answer: "Interest rate sensitivity",
      explanation: "Duration measures sensitivity to interest rate changes."
    },
    'pt-BR': {
      question: "O que é Duration?",
      options: ["Prazo do investimento", "Sensibilidade a juros", "Taxa de retorno", "Valor presente"],
      correct_answer: "Sensibilidade a juros",
      explanation: "Duration mede sensibilidade a mudanças de juros."
    }
  },
  "O que significa Bull Market?": {
    'en-US': {
      question: "What does Bull Market mean?",
      options: ["Bear market", "Bull market", "Sideways market", "Volatile market"],
      correct_answer: "Bull market",
      explanation: "Bull Market is a period of continuous growth."
    },
    'pt-BR': {
      question: "O que significa Bull Market?",
      options: ["Mercado em baixa", "Mercado em alta", "Mercado lateral", "Mercado volátil"],
      correct_answer: "Mercado em alta",
      explanation: "Bull Market é período de crescimento contínuo."
    }
  },
  "O que é ROI?": {
    'en-US': {
      question: "What is ROI?",
      options: ["Return on Investment", "Rate of Interest", "Risk of Investment", "Real Operating Income"],
      correct_answer: "Return on Investment",
      explanation: "ROI stands for Return on Investment, measuring profitability."
    },
    'pt-BR': {
      question: "O que é ROI?",
      options: ["Retorno sobre Investimento", "Taxa de Juros", "Risco do Investimento", "Receita Operacional Real"],
      correct_answer: "Retorno sobre Investimento",
      explanation: "ROI significa Retorno sobre Investimento, medindo rentabilidade."
    }
  },
  "O que é volatilidade?": {
    'en-US': {
      question: "What is volatility?",
      options: ["Price stability", "Price variation", "Investment guarantee", "Fixed return"],
      correct_answer: "Price variation",
      explanation: "Volatility measures how much an asset's price fluctuates."
    },
    'pt-BR': {
      question: "O que é volatilidade?",
      options: ["Estabilidade de preços", "Variação de preços", "Garantia de investimento", "Retorno fixo"],
      correct_answer: "Variação de preços",
      explanation: "Volatilidade mede o quanto o preço de um ativo oscila."
    }
  },
  "O que é Bear Market?": {
    'en-US': {
      question: "What is Bear Market?",
      options: ["Rising market", "Falling market", "Stable market", "New market"],
      correct_answer: "Falling market",
      explanation: "Bear Market is a period of declining prices."
    },
    'pt-BR': {
      question: "O que é Bear Market?",
      options: ["Mercado em alta", "Mercado em baixa", "Mercado estável", "Mercado novo"],
      correct_answer: "Mercado em baixa",
      explanation: "Bear Market é período de queda de preços."
    }
  }
};

export const useQuizTranslations = () => {
  const { getCurrentLanguage } = useI18n();
  
  const translateQuestion = (question: QuizQuestion): QuizQuestion => {
    const currentLang = getCurrentLanguage();
    
    console.log('🌍 Traduzindo pergunta:', question.question, 'para idioma:', currentLang);
    
    // Try to find translation by exact match first
    let translation = questionTranslations[question.question];
    
    // If not found, try to find by similarity or key words
    if (!translation) {
      // Find translation by checking if any translation key contains similar content
      const questionKeys = Object.keys(questionTranslations);
      for (const key of questionKeys) {
        const keyTranslations = questionTranslations[key];
        // Check if the English or Portuguese version matches
        if (keyTranslations['en-US']?.question === question.question || 
            keyTranslations['pt-BR']?.question === question.question) {
          translation = keyTranslations;
          break;
        }
      }
    }
    
    if (translation && translation[currentLang]) {
      console.log('✅ Tradução encontrada para:', currentLang);
      return {
        ...question,
        question: translation[currentLang].question,
        options: translation[currentLang].options,
        correct_answer: translation[currentLang].correct_answer,
        explanation: translation[currentLang].explanation
      };
    }
    
    console.log('❌ Tradução não encontrada para:', question.question);
    return question;
  };

  const translateQuestions = (questions: QuizQuestion[]): QuizQuestion[] => {
    console.log('🔄 Traduzindo', questions.length, 'perguntas para idioma:', getCurrentLanguage());
    const translatedQuestions = questions.map(translateQuestion);
    console.log('✅ Perguntas traduzidas:', translatedQuestions.length);
    return translatedQuestions;
  };

  return {
    translateQuestion,
    translateQuestions
  };
};