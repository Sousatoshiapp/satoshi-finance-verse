import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AIInsight {
  id: string;
  type: 'bullish' | 'bearish' | 'neutral' | 'warning';
  asset: string;
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
  created_at: string;
  priority: 'high' | 'medium' | 'low';
}

interface AISignal {
  id: string;
  action: 'buy' | 'sell' | 'hold';
  asset: string;
  entry_price: number;
  target_price: number;
  stop_loss: number;
  confidence: number;
  reasoning: string;
  status: 'active' | 'closed' | 'expired';
}

export function AITradingAssistant() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [signals, setSignals] = useState<AISignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiStatus, setAiStatus] = useState<'active' | 'learning' | 'offline'>('active');

  useEffect(() => {
    loadAIData();
  }, []);

  const loadAIData = async () => {
    try {
      // Mock AI insights data
      const mockInsights: AIInsight[] = [
        {
          id: '1',
          type: 'bullish',
          asset: 'BTC',
          title: 'Strong Accumulation Pattern Detected',
          description: 'Large wallet addresses showing increased BTC accumulation over the past 24h',
          confidence: 87,
          timeframe: '4h',
          created_at: new Date().toISOString(),
          priority: 'high'
        },
        {
          id: '2',
          type: 'warning',
          asset: 'ETH',
          title: 'Potential Resistance at $3,200',
          description: 'Technical analysis indicates strong resistance level approaching',
          confidence: 73,
          timeframe: '1h',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          priority: 'medium'
        },
        {
          id: '3',
          type: 'neutral',
          asset: 'SOL',
          title: 'Consolidation Phase Expected',
          description: 'Market showing sideways movement, waiting for catalyst',
          confidence: 65,
          timeframe: '1d',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          priority: 'low'
        }
      ];

      const mockSignals: AISignal[] = [
        {
          id: '1',
          action: 'buy',
          asset: 'BTC',
          entry_price: 42500,
          target_price: 45000,
          stop_loss: 41000,
          confidence: 82,
          reasoning: 'Golden cross formation on 4h chart with RSI oversold recovery',
          status: 'active'
        },
        {
          id: '2',
          action: 'sell',
          asset: 'ETH',
          entry_price: 3180,
          target_price: 3050,
          stop_loss: 3250,
          confidence: 76,
          reasoning: 'Bearish divergence on MACD with high volume distribution',
          status: 'active'
        }
      ];

      setInsights(mockInsights);
      setSignals(mockSignals);
    } catch (error) {
      console.error('Error loading AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'bullish': return 'text-green-500 border-green-500/30 bg-green-500/10';
      case 'bearish': return 'text-red-500 border-red-500/30 bg-red-500/10';
      case 'warning': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
      case 'neutral': return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
      default: return 'text-muted-foreground';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'buy': return 'text-green-500';
      case 'sell': return 'text-red-500';
      case 'hold': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Zap className="h-3 w-3 text-green-500" />;
      case 'learning': return <Brain className="h-3 w-3 text-blue-500" />;
      case 'offline': return <AlertTriangle className="h-3 w-3 text-red-500" />;
      default: return null;
    }
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return { label: 'Muito Alta', color: 'text-green-500' };
    if (confidence >= 60) return { label: 'Alta', color: 'text-blue-500' };
    if (confidence >= 40) return { label: 'Média', color: 'text-yellow-500' };
    return { label: 'Baixa', color: 'text-red-500' };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Assistente de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-muted/30 rounded-lg p-3 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-500/20 bg-gradient-to-br from-background to-blue-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            Assistente de IA
            <div className="flex items-center gap-1">
              {getStatusIcon(aiStatus)}
              <span className="text-xs text-muted-foreground capitalize">{aiStatus}</span>
            </div>
          </CardTitle>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/ai-assistant')}
            className="text-blue-500 border-blue-500/30 hover:bg-blue-500/10"
          >
            Ver Detalhes
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* AI Insights */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-500" />
            Insights da IA
          </h3>
          
          <div className="space-y-2">
            {insights.slice(0, 2).map((insight) => (
              <div 
                key={insight.id}
                className="border rounded-lg p-3 hover:border-blue-500/30 transition-all cursor-pointer"
                onClick={() => navigate(`/ai-insight/${insight.id}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">
                    {insight.type === 'bullish' ? '📈' : 
                     insight.type === 'bearish' ? '📉' : 
                     insight.type === 'warning' ? '⚠️' : '📊'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{insight.asset}</h4>
                      <Badge variant="outline" className={cn("text-xs", getInsightColor(insight.type))}>
                        {insight.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getConfidenceLabel(insight.confidence).label}
                      </Badge>
                    </div>
                    
                    <p className="text-sm font-medium mb-1">{insight.title}</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className={cn("font-medium", getConfidenceLabel(insight.confidence).color)}>
                        Confiança: {insight.confidence}%
                      </span>
                      <span className="text-muted-foreground">{insight.timeframe}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* AI Signals */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            Sinais Ativos
          </h3>
          
          <div className="space-y-2">
            {signals.slice(0, 1).map((signal) => (
              <div 
                key={signal.id}
                className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{signal.asset}</span>
                    <Badge variant="outline" className={cn("text-xs", getActionColor(signal.action))}>
                      {signal.action.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {signal.confidence}% confiança
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                  <div>
                    <div className="text-muted-foreground">Entrada</div>
                    <div className="font-medium">${signal.entry_price.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Alvo</div>
                    <div className="font-medium text-green-500">${signal.target_price.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Stop</div>
                    <div className="font-medium text-red-500">${signal.stop_loss.toLocaleString()}</div>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {signal.reasoning}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/ai-analysis')}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Análise IA
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/ai-signals')}
          >
            <Target className="h-4 w-4 mr-2" />
            Todos Sinais
          </Button>
        </div>
        
        {insights.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>IA analisando mercados...</p>
            <p className="text-sm">Insights aparecerão em breve!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}