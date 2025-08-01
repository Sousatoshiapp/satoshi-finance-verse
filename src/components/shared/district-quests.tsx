import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import { Progress } from "@/components/shared/ui/progress";
import { CheckCircle, Clock, Zap, Trophy, Target, TrendingUp, BookOpen, Bitcoin, Banknote, Home, Globe, Cpu } from "lucide-react";

interface Quest {
  id: string;
  quest_name: string;
  quest_description: string;
  quest_type: string;
  target_value: number;
  xp_reward: number;
  points_reward: number;
}

interface QuestProgress {
  quest_id: string;
  current_progress: number;
  completed: boolean;
  completed_at: string | null;
}

interface DistrictQuestsProps {
  districtId: string;
  districtTheme: string;
  districtColor: string;
}

const questTypeIcons = {
  trading_simulation: TrendingUp,
  lesson_completion: BookOpen,
  crypto_mining: Bitcoin,
  banking_operations: Banknote,
  investment_analysis: Home,
  international_trading: Globe,
  feature_testing: Cpu,
};

export function DistrictQuests({ districtId, districtTheme, districtColor }: DistrictQuestsProps) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [questProgress, setQuestProgress] = useState<QuestProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuests();
    loadQuestProgress();
  }, [districtId]);

  const loadQuests = async () => {
    try {
      const { data, error } = await supabase
        .from('district_daily_quests')
        .select('*')
        .eq('district_id', districtId)
        .eq('is_active', true);

      if (error) throw error;
      setQuests(data || []);
    } catch (error) {
      console.error('Error loading quests:', error);
    }
  };

  const loadQuestProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('user_quest_progress')
        .select('*')
        .eq('user_id', profile.id);

      if (error) throw error;
      setQuestProgress(data || []);
    } catch (error) {
      console.error('Error loading quest progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuestProgress = (questId: string) => {
    return questProgress.find(qp => qp.quest_id === questId);
  };

  const handleStartQuest = async (questId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { error } = await supabase
        .from('user_quest_progress')
        .insert({
          user_id: profile.id,
          quest_id: questId,
          current_progress: 1
        });

      if (error && error.code !== '23505') { // Ignore duplicate key error
        throw error;
      }

      loadQuestProgress();
    } catch (error) {
      console.error('Error starting quest:', error);
    }
  };

  const getDistrictSpecialFeatures = () => {
    switch (districtTheme) {
      case 'renda_variavel':
        return {
          title: 'Trading Simulator',
          description: 'Pratique trading com dados reais do mercado',
          features: ['Simulador de ações', 'Análise técnica', 'Portfólio virtual', 'Competições de trading'],
          links: [
            { text: 'Abra sua Conta', url: 'https://www.xpi.com.br/cadastro/', primary: true },
            { text: 'Logar na XP Investimentos', url: 'https://www.xpi.com.br/login/', primary: false }
          ]
        };
      case 'educacao_financeira':
        return {
          title: 'Academia Financeira',
          description: 'Cursos e workshops interativos',
          features: ['Lessons gamificadas', 'Calculadoras financeiras', 'Planos de investimento', 'Mentoria IA'],
          links: [
            { text: 'Acessar o Portal Anima', url: 'https://portal.anima.edu.br/', primary: true },
            { text: 'Matricule-se aqui', url: 'https://www.anima.edu.br/graduacao/', primary: false }
          ]
        };
      case 'criptomoedas':
        return {
          title: 'Crypto Lab',
          description: 'Laboratório de criptomoedas e blockchain',
          features: ['Mining virtual', 'DeFi simulator', 'NFT marketplace', 'Yield farming']
        };
      case 'sistema_bancario':
        return {
          title: 'Banking Hub',
          description: 'Simulações do sistema bancário',
          features: ['Operações bancárias', 'Credit scoring', 'Risk management', 'Compliance training']
        };
      case 'fundos_imobiliarios':
        return {
          title: 'Real Estate Center',
          description: 'Análise e simulação de FIIs',
          features: ['Análise de FIIs', 'Calculadora de renda', 'Market tracker', 'Portfolio builder']
        };
      case 'mercado_internacional':
        return {
          title: 'Global Markets',
          description: 'Trading internacional e câmbio',
          features: ['Forex simulator', 'International stocks', 'Currency tracker', 'Global news feed']
        };
      case 'fintech':
        return {
          title: 'Innovation Lab',
          description: 'Últimas inovações em fintech',
          features: ['API testing', 'Open banking', 'Payment solutions', 'Startup incubator']
        };
      default:
        return {
          title: 'District Features',
          description: 'Recursos especiais do distrito',
          features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4']
        };
    }
  };

  const specialFeatures = getDistrictSpecialFeatures();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: districtColor }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Special Features */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-2" style={{ borderColor: districtColor }}>
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Zap className="mr-2 h-5 w-5" style={{ color: districtColor }} />
            {specialFeatures.title}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {specialFeatures.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {specialFeatures.features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center space-x-2 p-2 rounded-lg bg-slate-700/50"
              >
                <Target className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: districtColor }} />
                <span className="text-xs sm:text-sm text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
          
          {/* District-specific links or generic button */}
          {specialFeatures.links ? (
            <div className="space-y-3">
              {specialFeatures.links.map((link, index) => (
                <Button 
                  key={index}
                  className={`w-full font-bold ${link.primary ? 'text-black' : 'text-white border-2'}`}
                  style={{ 
                    backgroundColor: link.primary ? districtColor : 'transparent',
                    borderColor: link.primary ? districtColor : districtColor
                  }}
                  onClick={() => window.open(link.url, '_blank')}
                >
                  {link.text}
                </Button>
              ))}
            </div>
          ) : (
            <Button 
              className="w-full mt-4 font-bold text-black"
              style={{ backgroundColor: districtColor }}
            >
              Acessar {specialFeatures.title}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Daily Quests */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Trophy className="mr-2 h-5 w-5" style={{ color: districtColor }} />
          Daily Quests
        </h3>
        
        {quests.map((quest) => {
          const progress = getQuestProgress(quest.id);
          const IconComponent = questTypeIcons[quest.quest_type as keyof typeof questTypeIcons] || Target;
          const progressPercent = progress ? (progress.current_progress / quest.target_value) * 100 : 0;
          
          return (
            <Card key={quest.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-600">
              <CardHeader className="pb-3 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                  <div className="flex-1">
                    <CardTitle className="text-base sm:text-lg text-white flex items-center">
                      <IconComponent className="mr-2 h-4 w-4 sm:h-5 sm:w-5" style={{ color: districtColor }} />
                      <span className="truncate">{quest.quest_name}</span>
                      {progress?.completed && (
                        <CheckCircle className="ml-2 h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-gray-300 mt-1 text-sm">
                      {quest.quest_description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-row sm:flex-col sm:space-x-0 space-x-2 sm:space-y-2">
                    <Badge variant="outline" className="text-xs" style={{ borderColor: districtColor, color: districtColor }}>
                      +{quest.xp_reward} XP
                    </Badge>
                    <Badge variant="outline" className="border-yellow-400 text-yellow-400 text-xs">
                      +{quest.points_reward} pts
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-400">
                      Progress: {progress?.current_progress || 0}/{quest.target_value}
                    </span>
                    <span className="text-gray-400">
                      {Math.round(progressPercent)}% completo
                    </span>
                  </div>
                  <Progress 
                    value={progressPercent} 
                    className="h-2"
                  />
                  {!progress?.completed && (
                    <Button
                      onClick={() => handleStartQuest(quest.id)}
                      size="sm"
                      variant="outline"
                      style={{ borderColor: districtColor, color: districtColor }}
                      className="w-full text-xs sm:text-sm"
                    >
                      {progress ? 'Continuar Quest' : 'Iniciar Quest'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {quests.length === 0 && (
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600">
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Novas quests serão adicionadas em breve</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
