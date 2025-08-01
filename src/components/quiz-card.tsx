import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';

interface QuizCardProps {
  title: string;
  description?: string;
  onStart: () => void;
  className?: string;
}

export function QuizCard({ title, description, onStart, className }: QuizCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {description && <p className="text-muted-foreground mb-4">{description}</p>}
        <Button onClick={onStart} className="w-full">
          Iniciar Quiz
        </Button>
      </CardContent>
    </Card>
  );
}