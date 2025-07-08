import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FloatingNavbar } from "@/components/floating-navbar";
import { Bot, Send, TrendingUp, Brain, Zap, ArrowLeft, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MarketInsight {
  id: string;
  title: string;
  description: string;
  confidence: number;
  type: 'bullish' | 'bearish' | 'neutral';
}

export default function AIAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    // Mock initial data
    const mockInsights: MarketInsight[] = [
      {
        id: '1',
        title: 'Bitcoin mostra força acima de $50k',
        description: 'Análise técnica indica possível rompimento de resistência',
        confidence: 85,
        type: 'bullish'
      },
      {
        id: '2',
        title: 'Setor DeFi em consolidação',
        description: 'Tokens DeFi apresentam lateralização antes de próximo movimento',
        confidence: 72,
        type: 'neutral'
      },
      {
        id: '3',
        title: 'Ethereum prepara upgrade importante',
        description: 'Próxima atualização pode impactar positivamente o preço',
        confidence: 78,
        type: 'bullish'
      }
    ];

    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        type: 'assistant',
        content: 'Olá! Sou seu assistente de IA especializado em trading e criptomoedas. Como posso ajudá-lo hoje?',
        timestamp: new Date()
      }
    ];

    setTimeout(() => {
      setInsights(mockInsights);
      setMessages(mockMessages);
      setLoading(false);
    }, 1000);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(newMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  const generateAIResponse = (userMessage: string): string => {
    const responses = [
      "Com base nos dados de mercado atuais, sugiro observar os níveis de suporte e resistência antes de tomar uma decisão.",
      "Analisando os indicadores técnicos, vejo uma tendência interessante que pode se desenvolver nas próximas horas.",
      "O sentimento do mercado está mudando. Recomendo cautela e aguardar confirmações antes de posicionar.",
      "Os volumes de negociação indicam um movimento significativo se aproximando. Prepare-se para volatilidade.",
      "Baseado no histórico de preços, este pode ser um bom momento para revisar sua estratégia de portfolio."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getInsightBadge = (type: string) => {
    switch (type) {
      case 'bullish': return <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Alta</Badge>;
      case 'bearish': return <Badge className="bg-red-500/10 text-red-500 border-red-500/30">Baixa</Badge>;
      default: return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">Neutro</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-muted/30 rounded-lg p-6 h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bot className="h-6 w-6 text-blue-500" />
                Assistente de IA
              </h1>
              <p className="text-muted-foreground">Análises inteligentes e insights de mercado em tempo real</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Market Insights */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    Insights de Mercado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.map((insight) => (
                      <div key={insight.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{insight.title}</h4>
                          {getInsightBadge(insight.type)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{insight.description}</p>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground">Confiança:</div>
                          <div className="text-xs font-medium">{insight.confidence}%</div>
                          <div className="flex-1 bg-muted rounded-full h-1">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full"
                              style={{ width: `${insight.confidence}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-green-500" />
                    Chat com IA
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua pergunta sobre trading ou mercado..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage} size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <TrendingUp className="h-6 w-6" />
                <span className="text-xs">Análise Técnica</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Zap className="h-6 w-6" />
                <span className="text-xs">Alertas de Preço</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Brain className="h-6 w-6" />
                <span className="text-xs">Estratégias IA</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Bot className="h-6 w-6" />
                <span className="text-xs">Configurações</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <FloatingNavbar />
    </div>
  );
}