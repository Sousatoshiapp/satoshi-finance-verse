import { useI18n } from "@/hooks/use-i18n";
import { QuizQuestion } from "@/hooks/use-quiz-shuffle";
import { createEnhancedTranslationMatcher } from "@/utils/translation-mapper";

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
    },
    'es-ES': {
      question: "¿Cuál es la función principal de una bolsa de valores?",
      options: ["Prestar dinero a empresas", "Facilitar el comercio de valores", "Establecer tasas de interés", "Imprimir dinero"],
      correct_answer: "Facilitar el comercio de valores",
      explanation: "Las bolsas de valores facilitan el comercio de valores entre compradores y vendedores."
    },
    'hi-IN': {
      question: "स्टॉक एक्सचेंज का मुख्य कार्य क्या है?",
      options: ["कंपनियों को पैसा उधार देना", "प्रतिभूतियों के व्यापार की सुविधा", "ब्याज दरें निर्धारित करना", "पैसा छापना"],
      correct_answer: "प्रतिभूतियों के व्यापार की सुविधा",
      explanation: "स्टॉक एक्सचेंज खरीदारों और विक्रेताओं के बीच प्रतिभूतियों के व्यापार की सुविधा प्रदान करते हैं।"
    },
    'zh-CN': {
      question: "证券交易所的主要功能是什么？",
      options: ["向公司放贷", "促进证券交易", "设定利率", "印刷货币"],
      correct_answer: "促进证券交易",
      explanation: "证券交易所促进买卖双方之间的证券交易。"
    },
    'ar-SA': {
      question: "ما هي الوظيفة الرئيسية لبورصة الأوراق المالية؟",
      options: ["إقراض الأموال للشركات", "تسهيل تداول الأوراق المالية", "تحديد أسعار الفائدة", "طباعة النقود"],
      correct_answer: "تسهيل تداول الأوراق المالية",
      explanation: "تسهل بورصات الأوراق المالية تداول الأوراق المالية بين المشترين والبائعين."
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
    },
    'es-ES': {
      question: "¿Qué significa IPO?",
      options: ["Oferta Pública Inicial", "Orden de Compra Internacional", "Opciones de Cartera de Inversión", "Optimización Interna de Precios"],
      correct_answer: "Oferta Pública Inicial",
      explanation: "IPO significa Oferta Pública Inicial, cuando una empresa vende acciones al público por primera vez."
    },
    'hi-IN': {
      question: "IPO का क्या मतलब है?",
      options: ["प्रारंभिक सार्वजनिक पेशकश", "अंतर्राष्ट्रीय खरीद आदेश", "निवेश पोर्टफोलियो विकल्प", "आंतरिक मूल्य अनुकूलन"],
      correct_answer: "प्रारंभिक सार्वजनिक पेशकश",
      explanation: "IPO का मतलब प्रारंभिक सार्वजनिक पेशकश है, जब कोई कंपनी पहली बार जनता को शेयर बेचती है।"
    },
    'zh-CN': {
      question: "IPO代表什么？",
      options: ["首次公开募股", "国际采购订单", "投资组合选项", "内部价格优化"],
      correct_answer: "首次公开募股",
      explanation: "IPO代表首次公开募股，即公司首次向公众出售股票。"
    },
    'ar-SA': {
      question: "ماذا يعني IPO؟",
      options: ["الطرح العام الأولي", "أمر الشراء الدولي", "خيارات محفظة الاستثمار", "تحسين الأسعار الداخلي"],
      correct_answer: "الطرح العام الأولي",
      explanation: "IPO يعني الطرح العام الأولي، عندما تبيع الشركة الأسهم للجمهور لأول مرة."
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
    },
    'es-ES': {
      question: "¿Qué es la diversificación en inversiones?",
      options: ["Invertir todo el dinero en una acción", "Distribuir inversiones entre diferentes activos", "Solo comprar acciones", "Vender todas las inversiones"],
      correct_answer: "Distribuir inversiones entre diferentes activos",
      explanation: "La diversificación implica distribuir inversiones entre diferentes activos para reducir el riesgo."
    },
    'hi-IN': {
      question: "निवेश में विविधीकरण क्या है?",
      options: ["सारा पैसा एक स्टॉक में लगाना", "विभिन्न संपत्तियों में निवेश फैलाना", "केवल स्टॉक खरीदना", "सभी निवेश बेचना"],
      correct_answer: "विभिन्न संपत्तियों में निवेश फैलाना",
      explanation: "विविधीकरण में जोखिम कम करने के लिए विभिन्न संपत्तियों में निवेश फैलाना शामिल है।"
    },
    'zh-CN': {
      question: "投资中的多元化是什么？",
      options: ["将所有资金投入一只股票", "将投资分散到不同资产", "只购买股票", "出售所有投资"],
      correct_answer: "将投资分散到不同资产",
      explanation: "多元化涉及将投资分散到不同资产以降低风险。"
    },
    'ar-SA': {
      question: "ما هو التنويع في الاستثمار؟",
      options: ["استثمار كل الأموال في سهم واحد", "توزيع الاستثمارات عبر أصول مختلفة", "شراء الأسهم فقط", "بيع جميع الاستثمارات"],
      correct_answer: "توزيع الاستثمارات عبر أصول مختلفة",
      explanation: "التنويع يتضمن توزيع الاستثمارات عبر أصول مختلفة لتقليل المخاطر."
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
    },
    'es-ES': {
      question: "¿Qué es DeFi?",
      options: ["Bitcoin", "Finanzas Descentralizadas", "Tipo de billetera", "Exchange centralizado"],
      correct_answer: "Finanzas Descentralizadas",
      explanation: "DeFi son aplicaciones financieras descentralizadas."
    },
    'hi-IN': {
      question: "DeFi क्या है?",
      options: ["बिटकॉइन", "विकेंद्रीकृत वित्त", "वॉलेट का प्रकार", "केंद्रीकृत एक्सचेंज"],
      correct_answer: "विकेंद्रीकृत वित्त",
      explanation: "DeFi विकेंद्रीकृत वित्तीय अनुप्रयोग हैं।"
    },
    'zh-CN': {
      question: "什么是DeFi？",
      options: ["比特币", "去中心化金融", "钱包类型", "中心化交易所"],
      correct_answer: "去中心化金融",
      explanation: "DeFi是去中心化金融应用程序。"
    },
    'ar-SA': {
      question: "ما هو DeFi؟",
      options: ["بيتكوين", "التمويل اللامركزي", "نوع من المحفظة", "بورصة مركزية"],
      correct_answer: "التمويل اللامركزي",
      explanation: "DeFi هي تطبيقات مالية لامركزية."
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
    },
    'es-ES': {
      question: "¿Qué es la Correlación?",
      options: ["Precio de activos", "Relación entre movimientos", "Tasa de retorno", "Dividendos"],
      correct_answer: "Relación entre movimientos",
      explanation: "La correlación mide cómo se mueven los activos juntos."
    },
    'hi-IN': {
      question: "सहसंबंध क्या है?",
      options: ["संपत्ति की कीमत", "गतिविधियों के बीच संबंध", "रिटर्न दर", "लाभांश"],
      correct_answer: "गतिविधियों के बीच संबंध",
      explanation: "सहसंबंध मापता है कि संपत्तियां एक साथ कैसे चलती हैं।"
    },
    'zh-CN': {
      question: "什么是相关性？",
      options: ["资产价格", "运动之间的关系", "回报率", "股息"],
      correct_answer: "运动之间的关系",
      explanation: "相关性衡量资产如何一起移动。"
    },
    'ar-SA': {
      question: "ما هو الارتباط؟",
      options: ["سعر الأصول", "العلاقة بين الحركات", "معدل العائد", "أرباح الأسهم"],
      correct_answer: "العلاقة بين الحركات",
      explanation: "الارتباط يقيس كيف تتحرك الأصول معًا."
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
    },
    'es-ES': {
      question: "¿Quién creó Bitcoin?",
      options: ["Vitalik Buterin", "Satoshi Nakamoto", "Charlie Lee", "Gavin Andresen"],
      correct_answer: "Satoshi Nakamoto",
      explanation: "Satoshi Nakamoto es el seudónimo del creador de Bitcoin."
    },
    'hi-IN': {
      question: "बिटकॉइन किसने बनाया?",
      options: ["विटालिक ब्यूटेरिन", "सातोशी नाकामोतो", "चार्ली ली", "गेविन एंड्रेसन"],
      correct_answer: "सातोशी नाकामोतो",
      explanation: "सातोशी नाकामोतो बिटकॉइन के निर्माता का छद्म नाम है।"
    },
    'zh-CN': {
      question: "谁创造了比特币？",
      options: ["维塔利克·布特林", "中本聪", "查理·李", "加文·安德烈森"],
      correct_answer: "中本聪",
      explanation: "中本聪是比特币创造者的化名。"
    },
    'ar-SA': {
      question: "من أنشأ البيتكوين؟",
      options: ["فيتاليك بوتيرين", "ساتوشي ناكاموتو", "تشارلي لي", "جافين أندريسن"],
      correct_answer: "ساتوشي ناكاموتو",
      explanation: "ساتوشي ناكاموتو هو الاسم المستعار لمنشئ البيتكوين."
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
    },
    'es-ES': {
      question: "¿Qué es la Duración?",
      options: ["Plazo de inversión", "Sensibilidad a tasas de interés", "Tasa de retorno", "Valor presente"],
      correct_answer: "Sensibilidad a tasas de interés",
      explanation: "La duración mide la sensibilidad a los cambios en las tasas de interés."
    },
    'hi-IN': {
      question: "अवधि क्या है?",
      options: ["निवेश अवधि", "ब्याज दर संवेदनशीलता", "रिटर्न दर", "वर्तमान मूल्य"],
      correct_answer: "ब्याज दर संवेदनशीलता",
      explanation: "अवधि ब्याज दर परिवर्तनों के प्रति संवेदनशीलता को मापती है।"
    },
    'zh-CN': {
      question: "什么是久期？",
      options: ["投资期限", "利率敏感性", "回报率", "现值"],
      correct_answer: "利率敏感性",
      explanation: "久期衡量对利率变化的敏感性。"
    },
    'ar-SA': {
      question: "ما هي المدة؟",
      options: ["مدة الاستثمار", "حساسية أسعار الفائدة", "معدل العائد", "القيمة الحالية"],
      correct_answer: "حساسية أسعار الفائدة",
      explanation: "المدة تقيس الحساسية لتغيرات أسعار الفائدة."
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
    },
    'es-ES': {
      question: "¿Qué significa Mercado Alcista?",
      options: ["Mercado bajista", "Mercado alcista", "Mercado lateral", "Mercado volátil"],
      correct_answer: "Mercado alcista",
      explanation: "El Mercado Alcista es un período de crecimiento continuo."
    },
    'hi-IN': {
      question: "बुल मार्केट का क्या मतलब है?",
      options: ["बेयर मार्केट", "बुल मार्केट", "साइडवेज मार्केट", "अस्थिर बाजार"],
      correct_answer: "बुल मार्केट",
      explanation: "बुल मार्केट निरंतर वृद्धि की अवधि है।"
    },
    'zh-CN': {
      question: "牛市是什么意思？",
      options: ["熊市", "牛市", "横盘市场", "波动市场"],
      correct_answer: "牛市",
      explanation: "牛市是持续增长的时期。"
    },
    'ar-SA': {
      question: "ماذا يعني السوق الصاعد؟",
      options: ["السوق الهابط", "السوق الصاعد", "السوق الجانبي", "السوق المتقلب"],
      correct_answer: "السوق الصاعد",
      explanation: "السوق الصاعد هو فترة من النمو المستمر."
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
    },
    'es-ES': {
      question: "¿Qué es ROI?",
      options: ["Retorno de la Inversión", "Tasa de Interés", "Riesgo de Inversión", "Ingresos Operativos Reales"],
      correct_answer: "Retorno de la Inversión",
      explanation: "ROI significa Retorno de la Inversión, midiendo la rentabilidad."
    },
    'hi-IN': {
      question: "ROI क्या है?",
      options: ["निवेश पर रिटर्न", "ब्याज दर", "निवेश का जोखिम", "वास्तविक परिचालन आय"],
      correct_answer: "निवेश पर रिटर्न",
      explanation: "ROI का मतलब निवेश पर रिटर्न है, जो लाभप्रदता को मापता है।"
    },
    'zh-CN': {
      question: "什么是ROI？",
      options: ["投资回报率", "利率", "投资风险", "实际营业收入"],
      correct_answer: "投资回报率",
      explanation: "ROI代表投资回报率，衡量盈利能力。"
    },
    'ar-SA': {
      question: "ما هو ROI؟",
      options: ["عائد الاستثمار", "معدل الفائدة", "مخاطر الاستثمار", "الدخل التشغيلي الحقيقي"],
      correct_answer: "عائد الاستثمار",
      explanation: "ROI يعني عائد الاستثمار، ويقيس الربحية."
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
    },
    'es-ES': {
      question: "¿Qué es la volatilidad?",
      options: ["Estabilidad de precios", "Variación de precios", "Garantía de inversión", "Retorno fijo"],
      correct_answer: "Variación de precios",
      explanation: "La volatilidad mide cuánto fluctúa el precio de un activo."
    },
    'hi-IN': {
      question: "अस्थिरता क्या है?",
      options: ["मूल्य स्थिरता", "मूल्य भिन्नता", "निवेश गारंटी", "निश्चित रिटर्न"],
      correct_answer: "मूल्य भिन्नता",
      explanation: "अस्थिरता मापती है कि किसी संपत्ति की कीमत कितनी उतार-चढ़ाव करती है।"
    },
    'zh-CN': {
      question: "什么是波动性？",
      options: ["价格稳定性", "价格变动", "投资保证", "固定回报"],
      correct_answer: "价格变动",
      explanation: "波动性衡量资产价格的波动程度。"
    },
    'ar-SA': {
      question: "ما هو التقلب؟",
      options: ["استقرار الأسعار", "تغير الأسعار", "ضمان الاستثمار", "عائد ثابت"],
      correct_answer: "تغير الأسعار",
      explanation: "التقلب يقيس مدى تذبذب سعر الأصل."
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
    },
    'es-ES': {
      question: "¿Qué es el Mercado Bajista?",
      options: ["Mercado en alza", "Mercado en baja", "Mercado estable", "Mercado nuevo"],
      correct_answer: "Mercado en baja",
      explanation: "El Mercado Bajista es un período de precios en declive."
    },
    'hi-IN': {
      question: "बेयर मार्केट क्या है?",
      options: ["बढ़ता बाजार", "गिरता बाजार", "स्थिर बाजार", "नया बाजार"],
      correct_answer: "गिरता बाजार",
      explanation: "बेयर मार्केट कीमतों में गिरावट की अवधि है।"
    },
    'zh-CN': {
      question: "什么是熊市？",
      options: ["上涨市场", "下跌市场", "稳定市场", "新市场"],
      correct_answer: "下跌市场",
      explanation: "熊市是价格下跌的时期。"
    },
    'ar-SA': {
      question: "ما هو السوق الهابط؟",
      options: ["السوق الصاعد", "السوق الهابط", "السوق المستقر", "السوق الجديد"],
      correct_answer: "السوق الهابط",
      explanation: "السوق الهابط هو فترة من انخفاض الأسعار."
    }
  },

  "O que é inflação?": {
    "en-US": {
      question: "What is inflation?",
      options: ["Price increase", "Price decrease", "Currency exchange", "Interest rate"],
      correct_answer: "Price increase",
      explanation: "Inflation is the general increase in prices and fall in the purchasing value of money."
    },
    "es-ES": {
      question: "¿Qué es la inflación?",
      options: ["Aumento de precios", "Disminución de precios", "Cambio de moneda", "Tasa de interés"],
      correct_answer: "Aumento de precios",
      explanation: "La inflación es el aumento general de precios y la caída del valor adquisitivo del dinero."
    },
    "fr-FR": {
      question: "Qu'est-ce que l'inflation ?",
      options: ["Augmentation des prix", "Diminution des prix", "Change de devise", "Taux d'intérêt"],
      correct_answer: "Augmentation des prix",
      explanation: "L'inflation est l'augmentation générale des prix et la baisse du pouvoir d'achat de la monnaie."
    },
    "de-DE": {
      question: "Was ist Inflation?",
      options: ["Preisanstieg", "Preisrückgang", "Währungstausch", "Zinssatz"],
      correct_answer: "Preisanstieg",
      explanation: "Inflation ist der allgemeine Preisanstieg und der Rückgang der Kaufkraft des Geldes."
    },
    "it-IT": {
      question: "Cos'è l'inflazione?",
      options: ["Aumento dei prezzi", "Diminuzione dei prezzi", "Cambio valuta", "Tasso di interesse"],
      correct_answer: "Aumento dei prezzi",
      explanation: "L'inflazione è l'aumento generale dei prezzi e la caduta del valore d'acquisto del denaro."
    },
    "ja-JP": {
      question: "インフレーションとは何ですか？",
      options: ["価格上昇", "価格下落", "通貨交換", "金利"],
      correct_answer: "価格上昇",
      explanation: "インフレーションは物価の全般的な上昇とお金の購買力の低下です。"
    }
  },

  "O que é diversificação?": {
    "en-US": {
      question: "What is diversification?",
      options: ["Risk spreading", "Risk concentration", "Profit maximization", "Cost reduction"],
      correct_answer: "Risk spreading",
      explanation: "Diversification is spreading investments across different assets to reduce risk."
    },
    "es-ES": {
      question: "¿Qué es la diversificación?",
      options: ["Distribución de riesgo", "Concentración de riesgo", "Maximización de beneficios", "Reducción de costos"],
      correct_answer: "Distribución de riesgo",
      explanation: "La diversificación es distribuir inversiones entre diferentes activos para reducir el riesgo."
    },
    "fr-FR": {
      question: "Qu'est-ce que la diversification ?",
      options: ["Répartition des risques", "Concentration des risques", "Maximisation des profits", "Réduction des coûts"],
      correct_answer: "Répartition des risques",
      explanation: "La diversification consiste à répartir les investissements entre différents actifs pour réduire les risques."
    },
    "de-DE": {
      question: "Was ist Diversifikation?",
      options: ["Risikostreuung", "Risikokonzentration", "Gewinnmaximierung", "Kostenreduzierung"],
      correct_answer: "Risikostreuung",
      explanation: "Diversifikation ist die Verteilung von Investitionen auf verschiedene Vermögenswerte zur Risikominderung."
    },
    "it-IT": {
      question: "Cos'è la diversificazione?",
      options: ["Distribuzione del rischio", "Concentrazione del rischio", "Massimizzazione del profitto", "Riduzione dei costi"],
      correct_answer: "Distribuzione del rischio",
      explanation: "La diversificazione è la distribuzione degli investimenti tra diversi asset per ridurre il rischio."
    },
    "ja-JP": {
      question: "分散投資とは何ですか？",
      options: ["リスク分散", "リスク集中", "利益最大化", "コスト削減"],
      correct_answer: "リスク分散",
      explanation: "分散投資はリスクを減らすために異なる資産に投資を分散することです。"
    }
  },

  "O que é liquidez?": {
    "en-US": {
      question: "What is liquidity?",
      options: ["Ease of conversion to cash", "Investment return", "Market volatility", "Interest rate"],
      correct_answer: "Ease of conversion to cash",
      explanation: "Liquidity refers to how easily an asset can be converted into cash without affecting its market price."
    },
    "es-ES": {
      question: "¿Qué es la liquidez?",
      options: ["Facilidad de conversión a efectivo", "Retorno de inversión", "Volatilidad del mercado", "Tasa de interés"],
      correct_answer: "Facilidad de conversión a efectivo",
      explanation: "La liquidez se refiere a la facilidad con que un activo puede convertirse en efectivo sin afectar su precio de mercado."
    },
    "fr-FR": {
      question: "Qu'est-ce que la liquidité ?",
      options: ["Facilité de conversion en espèces", "Retour sur investissement", "Volatilité du marché", "Taux d'intérêt"],
      correct_answer: "Facilité de conversion en espèces",
      explanation: "La liquidité fait référence à la facilité avec laquelle un actif peut être converti en espèces sans affecter son prix de marché."
    },
    "de-DE": {
      question: "Was ist Liquidität?",
      options: ["Leichtigkeit der Umwandlung in Bargeld", "Investitionsrendite", "Marktvolatilität", "Zinssatz"],
      correct_answer: "Leichtigkeit der Umwandlung in Bargeld",
      explanation: "Liquidität bezieht sich darauf, wie leicht ein Vermögenswert in Bargeld umgewandelt werden kann, ohne seinen Marktpreis zu beeinflussen."
    },
    "it-IT": {
      question: "Cos'è la liquidità?",
      options: ["Facilità di conversione in contanti", "Ritorno sull'investimento", "Volatilità del mercato", "Tasso di interesse"],
      correct_answer: "Facilità di conversione in contanti",
      explanation: "La liquidità si riferisce alla facilità con cui un asset può essere convertito in contanti senza influenzare il suo prezzo di mercato."
    },
    "ja-JP": {
      question: "流動性とは何ですか？",
      options: ["現金への変換の容易さ", "投資収益", "市場のボラティリティ", "金利"],
      correct_answer: "現金への変換の容易さ",
      explanation: "流動性とは、資産が市場価格に影響を与えることなく現金に変換できる容易さを指します。"
    }
  },

  "O que são juros compostos?": {
    "en-US": {
      question: "What is compound interest?",
      options: ["Interest on interest", "Simple interest", "Fixed rate", "Variable rate"],
      correct_answer: "Interest on interest",
      explanation: "Compound interest is interest calculated on the initial principal and accumulated interest from previous periods."
    },
    "es-ES": {
      question: "¿Qué es el interés compuesto?",
      options: ["Interés sobre interés", "Interés simple", "Tasa fija", "Tasa variable"],
      correct_answer: "Interés sobre interés",
      explanation: "El interés compuesto es el interés calculado sobre el capital inicial y los intereses acumulados de períodos anteriores."
    },
    "fr-FR": {
      question: "Qu'est-ce que l'intérêt composé ?",
      options: ["Intérêt sur intérêt", "Intérêt simple", "Taux fixe", "Taux variable"],
      correct_answer: "Intérêt sur intérêt",
      explanation: "L'intérêt composé est l'intérêt calculé sur le capital initial et les intérêts accumulés des périodes précédentes."
    },
    "de-DE": {
      question: "Was ist Zinseszins?",
      options: ["Zinsen auf Zinsen", "Einfache Zinsen", "Fester Zinssatz", "Variabler Zinssatz"],
      correct_answer: "Zinsen auf Zinsen",
      explanation: "Zinseszins sind Zinsen, die auf das ursprüngliche Kapital und die angesammelten Zinsen aus früheren Perioden berechnet werden."
    },
    "it-IT": {
      question: "Cos'è l'interesse composto?",
      options: ["Interesse su interesse", "Interesse semplice", "Tasso fisso", "Tasso variabile"],
      correct_answer: "Interesse su interesse",
      explanation: "L'interesse composto è l'interesse calcolato sul capitale iniziale e sugli interessi accumulati dei periodi precedenti."
    },
    "ja-JP": {
      question: "複利とは何ですか？",
      options: ["利息に対する利息", "単利", "固定金利", "変動金利"],
      correct_answer: "利息に対する利息",
      explanation: "複利とは、元本と過去の期間から蓄積された利息に対して計算される利息です。"
    }
  }
};

export const useQuizTranslations = () => {
  const { getCurrentLanguage } = useI18n();
  
  const translateQuestion = (question: QuizQuestion): QuizQuestion => {
    const currentLang = getCurrentLanguage();
    
    console.log('🌍 Translating question:', question.question, 'to language:', currentLang);
    console.log('🔍 Available translation keys:', Object.keys(questionTranslations));
    console.log('🎯 Looking for exact match for:', question.question);
    
    // Try to find translation by exact match first
    let translation = questionTranslations[question.question];
    let matchType = 'exact';
    
    if (!translation) {
      const matcher = createEnhancedTranslationMatcher();
      const availableKeys = Object.keys(questionTranslations);
      const { match, score } = matcher.findBestMatch(question.question, availableKeys, 0.7);
      
      if (match && score > 0.7) {
        translation = questionTranslations[match];
        matchType = `fuzzy (${(score * 100).toFixed(1)}%)`;
        console.log(`🎯 Fuzzy match found: "${match}" with ${(score * 100).toFixed(1)}% similarity`);
      }
    }
    
    if (!translation) {
      const questionKeys = Object.keys(questionTranslations);
      for (const key of questionKeys) {
        const keyTranslations = questionTranslations[key];
        // Check if the English or Portuguese version matches
        if (keyTranslations['en-US']?.question === question.question || 
            keyTranslations['pt-BR']?.question === question.question) {
          translation = keyTranslations;
          matchType = 'cross-language';
          break;
        }
      }
    }
    
    if (translation && translation[currentLang]) {
      console.log(`✅ Translation found via ${matchType} match for:`, currentLang);
      console.log('📝 Original question:', question.question);
      console.log('🌍 Translated question:', translation[currentLang].question);
      return {
        ...question,
        question: translation[currentLang].question,
        options: translation[currentLang].options,
        correct_answer: translation[currentLang].correct_answer,
        explanation: translation[currentLang].explanation
      };
    }
    
    console.log('❌ Translation not found for:', question.question);
    console.log('🔍 Checked translation object:', translation);
    console.log('💡 Consider adding this question to translation mappings');
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
