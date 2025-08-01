import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';

interface EnhancedQuizCardProps {
  title: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  questionsCount?: number;
  onStart: () => void;
  className?: string;
}

export function EnhancedQuizCard({ 
  title, 
  description, 
  difficulty, 
  category, 
  questionsCount,
  onStart, 
  className 
}: EnhancedQuizCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          {difficulty && (
            <Badge variant={difficulty === 'hard' ? 'destructive' : difficulty === 'medium' ? 'secondary' : 'default'}>
              {difficulty}
            </Badge>
          )}
        </div>
        {category && <p className="text-sm text-muted-foreground">{category}</p>}
      </CardHeader>
      <CardContent>
        {description && <p className="text-muted-foreground mb-4">{description}</p>}
        {questionsCount && (
          <p className="text-sm text-muted-foreground mb-4">{questionsCount} questões</p>
        )}
        <Button onClick={onStart} className="w-full">
          Iniciar Quiz
        </Button>
      </CardContent>
    </Card>
  );
}