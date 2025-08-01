import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Brain, Clock, TrendingUp } from 'lucide-react';

interface SRSQuizCardProps {
  concept: string;
  mastery: number;
  nextReview: Date;
  onStart: () => void;
  className?: string;
}

export function SRSQuizCard({ concept, mastery, nextReview, onStart, className }: SRSQuizCardProps) {
  const masteryColor = mastery >= 0.8 ? 'bg-green-500' : mastery >= 0.5 ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {concept}
          </CardTitle>
          <Badge variant="outline">
            {Math.round(mastery * 100)}% dominado
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Próxima revisão: {nextReview.toLocaleDateString()}
          </div>
          
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${masteryColor}`}
              style={{ width: `${mastery * 100}%` }}
            />
          </div>
          
          <Button onClick={onStart} className="w-full">
            <TrendingUp className="h-4 w-4 mr-2" />
            Revisar Conceito
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}