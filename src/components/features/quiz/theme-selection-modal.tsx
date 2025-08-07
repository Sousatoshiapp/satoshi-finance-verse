import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { GraduationCap, TrendingUp, Bitcoin, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTheme: (theme: string) => void;
}

const QUIZ_THEMES = [
  {
    id: "basic_finance",
    name: "Finanças Básicas",
    description: "Fundamentos financeiros, controle de gastos e primeiros investimentos",
    icon: GraduationCap,
    difficulty: "Fácil",
    difficultyLevel: 1,
    questionCount: "150+ perguntas",
    consolidatedThemes: ["financial_education", "budgeting", "basic_investments"],
    gradient: "from-emerald-500 to-green-600",
    textColor: "text-emerald-600",
    bgGradient: "from-emerald-50 to-green-50"
  },
  {
    id: "intermediate_finance", 
    name: "Finanças Intermediária",
    description: "Diversificação, estratégias de trading e análise de mercado",
    icon: TrendingUp,
    difficulty: "Médio",
    difficultyLevel: 2,
    questionCount: "120+ perguntas",
    consolidatedThemes: ["portfolio", "trading"],
    gradient: "from-blue-500 to-cyan-600",
    textColor: "text-blue-600",
    bgGradient: "from-blue-50 to-cyan-50"
  },
  {
    id: "cryptocurrency",
    name: "Cripto",
    description: "Bitcoin, Ethereum, DeFi e tecnologia blockchain",
    icon: Bitcoin,
    difficulty: "Difícil", 
    difficultyLevel: 3,
    questionCount: "90+ perguntas",
    consolidatedThemes: ["cryptocurrency"],
    gradient: "from-orange-500 to-amber-600",
    textColor: "text-orange-600",
    bgGradient: "from-orange-50 to-amber-50"
  },
  {
    id: "economics",
    name: "Finanças Hard Core",
    description: "Indicadores econômicos, política monetária e macroeconomia",
    icon: Brain,
    difficulty: "Muito Difícil",
    difficultyLevel: 4,
    questionCount: "80+ perguntas", 
    consolidatedThemes: ["economics"],
    gradient: "from-slate-600 to-gray-700",
    textColor: "text-slate-600",
    bgGradient: "from-slate-50 to-gray-50"
  }
];

export function ThemeSelectionModal({ isOpen, onClose, onSelectTheme }: ThemeSelectionModalProps) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    // Small delay for visual feedback
    setTimeout(() => {
      onSelectTheme(themeId);
      onClose();
    }, 200);
  };

  const getDifficultyColor = (difficultyLevel: number) => {
    switch (difficultyLevel) {
      case 1: return "bg-success/10 text-success border-success/20";
      case 2: return "bg-warning/10 text-warning border-warning/20";
      case 3: return "bg-destructive/10 text-destructive border-destructive/20";
      case 4: return "bg-slate-500/10 text-slate-600 border-slate-500/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            Escolha seu Tema de Quiz
          </DialogTitle>
          <p className="text-muted-foreground text-center">
            Selecione um tema para iniciar seu quiz adaptativo com SRS inteligente
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {QUIZ_THEMES.map((theme) => {
            const IconComponent = theme.icon;
            const isSelected = selectedTheme === theme.id;
            
            return (
              <Card
                key={theme.id}
                className={cn(
                  "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/10",
                  "border-2 hover:border-primary/30 hover:-translate-y-1",
                  "relative overflow-hidden",
                  isSelected && "border-primary ring-4 ring-primary/20 scale-[1.02] shadow-xl shadow-primary/20"
                )}
                onClick={() => handleThemeSelect(theme.id)}
              >
                {/* Background Gradient */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity",
                  theme.bgGradient
                )} />
                
                <CardContent className="relative p-6">
                  {/* Header with Icon and Difficulty */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "p-4 rounded-xl bg-gradient-to-br shadow-lg",
                      theme.bgGradient,
                      "group-hover:scale-110 transition-transform duration-300"
                    )}>
                      <IconComponent className={cn("h-7 w-7", theme.textColor)} />
                    </div>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "font-semibold px-3 py-1 text-xs",
                        getDifficultyColor(theme.difficultyLevel)
                      )}
                    >
                      {theme.difficulty}
                    </Badge>
                  </div>

                  {/* Theme Info */}
                  <div className="space-y-3 mb-4">
                    <h3 className="font-bold text-xl leading-tight text-foreground group-hover:text-primary transition-colors">
                      {theme.name}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                      {theme.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span className="font-medium">{theme.questionCount}</span>
                    <span className="font-medium">SRS Adaptativo</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-r rounded-full",
                      theme.gradient,
                      "transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"
                    )} />
                  </div>
                  
                  {/* Difficulty Level Indicators */}
                  <div className="flex items-center justify-center mt-4 space-x-1">
                    {Array.from({ length: 4 }, (_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-2 w-2 rounded-full transition-colors",
                          i < theme.difficultyLevel ? "bg-primary" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="min-w-32"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}