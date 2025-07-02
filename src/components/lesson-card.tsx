import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

interface LessonCardProps {
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  isLocked?: boolean;
  difficulty: "Básico" | "Intermediário" | "Avançado";
  icon: string;
  onClick?: () => void;
  className?: string;
}

export function LessonCard({
  title,
  description,
  progress,
  totalLessons,
  isLocked = false,
  difficulty,
  icon,
  onClick,
  className
}: LessonCardProps) {
  const isCompleted = progress >= totalLessons;
  
  const difficultyColors = {
    "Básico": "bg-success text-success-foreground",
    "Intermediário": "bg-warning text-warning-foreground", 
    "Avançado": "bg-destructive text-destructive-foreground"
  };

  return (
    <Card className={cn(
      "p-6 hover-lift cursor-pointer transition-all duration-300",
      isLocked && "opacity-50 cursor-not-allowed",
      isCompleted && "border-primary border-2",
      className
    )} onClick={!isLocked ? onClick : undefined}>
      
      <div className="flex items-start gap-4">
        <div className="text-4xl">{icon}</div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-lg text-foreground truncate">{title}</h3>
            {isCompleted && <span className="text-primary">✓</span>}
            {isLocked && <span className="text-muted-foreground">🔒</span>}
          </div>
          
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {description}
          </p>
          
          <div className="flex items-center justify-between mb-3">
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-semibold",
              difficultyColors[difficulty]
            )}>
              {difficulty}
            </span>
            
            <span className="text-xs text-muted-foreground">
              {progress}/{totalLessons} lições
            </span>
          </div>
          
          <ProgressBar 
            value={progress} 
            max={totalLessons} 
            className="mb-4"
          />
          
          <Button 
            className="w-full" 
            disabled={isLocked}
            variant={isCompleted ? "secondary" : "default"}
          >
            {isLocked ? "Bloqueado" : isCompleted ? "Revisar" : "Continuar"}
          </Button>
        </div>
      </div>
    </Card>
  );
}