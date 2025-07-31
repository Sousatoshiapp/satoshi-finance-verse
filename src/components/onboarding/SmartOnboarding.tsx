import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { supabase } from "@/integrations/supabase/client";
import { 
  Brain, 
  Target, 
  Clock, 
  BookOpen, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  icon: React.ReactNode;
}

interface UserProfile {
  experience_level: string;
  study_goals: string[];
  available_time: number;
  preferred_difficulty: string;
  learning_style: string;
  motivation_factors: string[];
}

export function SmartOnboarding({ onComplete }: { onComplete: () => void }) {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    experience_level: '',
    study_goals: [],
    available_time: 30,
    preferred_difficulty: '',
    learning_style: '',
    motivation_factors: []
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: 'study_goals' | 'motivation_factors', value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao BeetzQuiz!',
      description: 'Vamos personalizar sua experiência de aprendizado',
      icon: <Sparkles className="h-6 w-6" />,
      component: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-32 h-32 bg-gradient-to-br from-primary to-primary/50 rounded-full flex items-center justify-center">
            <Brain className="h-16 w-16 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-4">Vamos começar sua jornada!</h3>
            <p className="text-muted-foreground">
              Responda algumas perguntas rápidas para que possamos criar um plano 
              de estudos personalizado especialmente para você.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Metas Personalizadas</p>
            </div>
            <div className="text-center">
              <Brain className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">IA Adaptativa</p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Progresso Acelerado</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'experience',
      title: 'Qual seu nível de experiência?',
      description: 'Isso nos ajuda a calibrar a dificuldade inicial',
      icon: <BookOpen className="h-6 w-6" />,
      component: (
        <RadioGroup 
          value={profile.experience_level} 
          onValueChange={(value) => updateProfile('experience_level', value)}
          className="space-y-4"
        >
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
            <RadioGroupItem value="beginner" id="beginner" />
            <Label htmlFor="beginner" className="flex-1 cursor-pointer">
              <div>
                <div className="font-medium">Iniciante</div>
                <div className="text-sm text-muted-foreground">
                  Pouco ou nenhum conhecimento sobre investimentos
                </div>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
            <RadioGroupItem value="intermediate" id="intermediate" />
            <Label htmlFor="intermediate" className="flex-1 cursor-pointer">
              <div>
                <div className="font-medium">Intermediário</div>
                <div className="text-sm text-muted-foreground">
                  Tenho alguns conhecimentos básicos sobre finanças
                </div>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
            <RadioGroupItem value="advanced" id="advanced" />
            <Label htmlFor="advanced" className="flex-1 cursor-pointer">
              <div>
                <div className="font-medium">Avançado</div>
                <div className="text-sm text-muted-foreground">
                  Já invisto e quero aprofundar meus conhecimentos
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      )
    },
    {
      id: 'goals',
      title: 'Quais são seus objetivos?',
      description: 'Selecione todos que se aplicam',
      icon: <Target className="h-6 w-6" />,
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Preparar para certificações',
            'Melhorar conhecimento em renda fixa',
            'Aprender sobre renda variável',
            'Entender derivativos',
            'Planejamento financeiro pessoal',
            'Análise de investimentos',
            'Gestão de riscos',
            'Economia e mercados'
          ].map((goal) => (
            <Button
              key={goal}
              variant={profile.study_goals.includes(goal) ? "default" : "outline"}
              onClick={() => toggleArrayValue('study_goals', goal)}
              className="h-auto p-4 text-left justify-start"
            >
              <div className="flex items-center gap-3">
                {profile.study_goals.includes(goal) && (
                  <CheckCircle className="h-4 w-4" />
                )}
                <span className="text-sm">{goal}</span>
              </div>
            </Button>
          ))}
        </div>
      )
    },
    {
      id: 'time',
      title: 'Quanto tempo você tem para estudar?',
      description: 'Por dia, em média',
      icon: <Clock className="h-6 w-6" />,
      component: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {profile.available_time} minutos
            </div>
            <p className="text-sm text-muted-foreground">por dia</p>
          </div>
          <Slider
            value={[profile.available_time]}
            onValueChange={(value) => updateProfile('available_time', value[0])}
            max={120}
            min={10}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10 min</span>
            <span>60 min</span>
            <span>120 min</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className={profile.available_time <= 30 ? 'border-primary' : ''}>
              <CardContent className="p-4 text-center">
                <h4 className="font-medium">Rápido</h4>
                <p className="text-sm text-muted-foreground">10-30 min</p>
                <p className="text-xs mt-2">Micro-learning focado</p>
              </CardContent>
            </Card>
            <Card className={profile.available_time > 30 && profile.available_time <= 60 ? 'border-primary' : ''}>
              <CardContent className="p-4 text-center">
                <h4 className="font-medium">Moderado</h4>
                <p className="text-sm text-muted-foreground">30-60 min</p>
                <p className="text-xs mt-2">Sessões completas</p>
              </CardContent>
            </Card>
            <Card className={profile.available_time > 60 ? 'border-primary' : ''}>
              <CardContent className="p-4 text-center">
                <h4 className="font-medium">Intensivo</h4>
                <p className="text-sm text-muted-foreground">60+ min</p>
                <p className="text-xs mt-2">Estudo aprofundado</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'learning_style',
      title: 'Como você aprende melhor?',
      description: 'Escolha seu estilo de aprendizado preferido',
      icon: <Brain className="h-6 w-6" />,
      component: (
        <RadioGroup 
          value={profile.learning_style} 
          onValueChange={(value) => updateProfile('learning_style', value)}
          className="space-y-4"
        >
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
            <RadioGroupItem value="visual" id="visual" />
            <Label htmlFor="visual" className="flex-1 cursor-pointer">
              <div>
                <div className="font-medium">Visual</div>
                <div className="text-sm text-muted-foreground">
                  Gráficos, diagramas e conteúdo visual
                </div>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
            <RadioGroupItem value="practical" id="practical" />
            <Label htmlFor="practical" className="flex-1 cursor-pointer">
              <div>
                <div className="font-medium">Prático</div>
                <div className="text-sm text-muted-foreground">
                  Exercícios, quizzes e aplicação direta
                </div>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
            <RadioGroupItem value="theoretical" id="theoretical" />
            <Label htmlFor="theoretical" className="flex-1 cursor-pointer">
              <div>
                <div className="font-medium">Teórico</div>
                <div className="text-sm text-muted-foreground">
                  Conceitos, explicações detalhadas e fundamentos
                </div>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
            <RadioGroupItem value="mixed" id="mixed" />
            <Label htmlFor="mixed" className="flex-1 cursor-pointer">
              <div>
                <div className="font-medium">Misto</div>
                <div className="text-sm text-muted-foreground">
                  Combinação de todas as abordagens
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      )
    },
    {
      id: 'motivation',
      title: 'O que te motiva a estudar?',
      description: 'Selecione todos que se aplicam',
      icon: <TrendingUp className="h-6 w-6" />,
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Crescimento profissional',
            'Segurança financeira',
            'Conhecimento pessoal',
            'Competição e rankings',
            'Conquistas e badges',
            'Ajudar outras pessoas',
            'Curiosidade intelectual',
            'Objetivos de carreira'
          ].map((factor) => (
            <Button
              key={factor}
              variant={profile.motivation_factors.includes(factor) ? "default" : "outline"}
              onClick={() => toggleArrayValue('motivation_factors', factor)}
              className="h-auto p-4 text-left justify-start"
            >
              <div className="flex items-center gap-3">
                {profile.motivation_factors.includes(factor) && (
                  <CheckCircle className="h-4 w-4" />
                )}
                <span className="text-sm">{factor}</span>
              </div>
            </Button>
          ))}
        </div>
      )
    }
  ];

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!userProfile) return;

      // Save onboarding profile
      const { error } = await supabase
        .from('user_onboarding_profiles')
        .upsert({
          user_id: userProfile.id,
          experience_level: profile.experience_level,
          study_goals: profile.study_goals,
          available_time_minutes: profile.available_time,
          preferred_difficulty: profile.preferred_difficulty,
          learning_style: profile.learning_style,
          motivation_factors: profile.motivation_factors,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Generate initial AI recommendations based on profile
      await supabase.rpc('generate_ai_recommendations', {
        p_user_id: userProfile.id
      });

      toast({
        title: "🎉 Perfil configurado com sucesso!",
        description: "Sua experiência de aprendizado foi personalizada",
      });

      onComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: t('errors.error'),
        description: "Tente novamente ou continue para configurar depois",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true; // Welcome step
      case 1: return profile.experience_level !== '';
      case 2: return profile.study_goals.length > 0;
      case 3: return profile.available_time > 0;
      case 4: return profile.learning_style !== '';
      case 5: return profile.motivation_factors.length > 0;
      default: return false;
    }
  };

  const currentStepData = steps[currentStep];
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Passo {currentStep + 1} de {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              {currentStepData.icon}
            </div>
            <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
            <p className="text-muted-foreground">{currentStepData.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStepData.component}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={saveProfile}
              disabled={!canProceed() || loading}
              className="min-w-32"
            >
              {loading ? t('admin.saving') : 'Finalizar'}
              <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
            >
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Skip Option */}
        <div className="text-center mt-4">
          <Button
            variant="ghost"
            onClick={onComplete}
            className="text-sm text-muted-foreground"
          >
            Pular configuração (pode configurar depois)
          </Button>
        </div>
      </div>
    </div>
  );
}
