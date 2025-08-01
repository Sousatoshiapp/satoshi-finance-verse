import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Button } from '@/components/shared/ui/button';
import { Progress } from '@/components/shared/ui/progress';
import { Book, Clock, Users, Star } from 'lucide-react';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  progress: number;
  enrolledCount: number;
  rating: number;
  topics: string[];
}

interface LearningModulesGridProps {
  modules?: LearningModule[];
  onModuleSelect: (moduleId: string) => void;
}

export function LearningModulesGrid({ 
  modules = [], 
  onModuleSelect 
}: LearningModulesGridProps) {
  const defaultModules: LearningModule[] = [
    {
      id: '1',
      title: 'Fundamentos de Investimento',
      description: 'Aprenda os conceitos básicos de investimento e como começar.',
      difficulty: 'beginner',
      duration: '2h 30min',
      progress: 65,
      enrolledCount: 1200,
      rating: 4.8,
      topics: ['Ações', 'Renda Fixa', 'Diversificação']
    },
    {
      id: '2',
      title: 'Análise Técnica Avançada',
      description: 'Domine as técnicas de análise gráfica e indicadores.',
      difficulty: 'advanced',
      duration: '4h 15min',
      progress: 25,
      enrolledCount: 800,
      rating: 4.9,
      topics: ['Candlesticks', 'Suporte/Resistência', 'Médias Móveis']
    },
    {
      id: '3',
      title: 'Planejamento Financeiro Pessoal',
      description: 'Organize suas finanças e planeje seu futuro financeiro.',
      difficulty: 'intermediate',
      duration: '3h 45min',
      progress: 0,
      enrolledCount: 950,
      rating: 4.7,
      topics: ['Orçamento', 'Reserva de Emergência', 'Metas Financeiras']
    }
  ];

  const displayModules = modules.length > 0 ? modules : defaultModules;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return 'Iniciante';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayModules.map((module) => (
        <Card key={module.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg line-clamp-2">{module.title}</CardTitle>
              <Badge className={getDifficultyColor(module.difficulty)}>
                {getDifficultyLabel(module.difficulty)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {module.description}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {module.duration}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {module.enrolledCount}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {module.rating}
              </div>
            </div>

            {module.progress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{module.progress}%</span>
                </div>
                <Progress value={module.progress} />
              </div>
            )}

            <div className="flex flex-wrap gap-1">
              {module.topics.map((topic) => (
                <Badge key={topic} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>

            <Button 
              className="w-full" 
              onClick={() => onModuleSelect(module.id)}
            >
              <Book className="h-4 w-4 mr-2" />
              {module.progress > 0 ? 'Continuar' : 'Começar'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}