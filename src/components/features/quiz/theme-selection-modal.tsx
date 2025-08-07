import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Brain, TrendingUp, Bitcoin, Briefcase, GraduationCap, Calculator, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTheme: (theme: string) => void;
}

const QUIZ_THEMES = [
  {
    id: "trading",
    name: "Trading & Análise Técnica",
    description: "Gráficos, indicadores e estratégias de trading",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-600",
    textColor: "text-green-600",
    bgColor: "bg-green-50",
    difficulty: "Medium"
  },
  {
    id: "cryptocurrency",
    name: "Criptomoedas & DeFi",
    description: "Bitcoin, Ethereum, DeFi e tecnologia blockchain",
    icon: Bitcoin,
    color: "from-orange-500 to-yellow-600",
    textColor: "text-orange-600",
    bgColor: "bg-orange-50",
    difficulty: "Hard"
  },
  {
    id: "portfolio",
    name: "Gestão de Portfolio",
    description: "Diversificação, asset allocation e estratégias",
    icon: Briefcase,
    color: "from-blue-500 to-cyan-600",
    textColor: "text-blue-600",
    bgColor: "bg-blue-50",
    difficulty: "Medium"
  },
  {
    id: "basic_investments",
    name: "Investimentos Básicos",
    description: "Fundamentos de renda fixa e variável",
    icon: BarChart,
    color: "from-purple-500 to-indigo-600",
    textColor: "text-purple-600",
    bgColor: "bg-purple-50",
    difficulty: "Easy"
  },
  {
    id: "financial_education",
    name: "Educação Financeira",
    description: "Conceitos fundamentais e planejamento",
    icon: GraduationCap,
    color: "from-teal-500 to-cyan-600",
    textColor: "text-teal-600",
    bgColor: "bg-teal-50",
    difficulty: "Easy"
  },
  {
    id: "budgeting",
    name: "Orçamento & Planejamento",
    description: "Controle financeiro pessoal e metas",
    icon: Calculator,
    color: "from-pink-500 to-rose-600",
    textColor: "text-pink-600",
    bgColor: "bg-pink-50",
    difficulty: "Easy"
  },
  {
    id: "economics",
    name: "Economia & Macroeconomia",
    description: "Indicadores econômicos e mercados",
    icon: Brain,
    color: "from-gray-500 to-slate-600",
    textColor: "text-gray-600",
    bgColor: "bg-gray-50",
    difficulty: "Hard"
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {QUIZ_THEMES.map((theme) => {
            const IconComponent = theme.icon;
            const isSelected = selectedTheme === theme.id;
            
            return (
              <Card
                key={theme.id}
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
                  "border-2 hover:border-primary/50",
                  isSelected && "border-primary ring-2 ring-primary/20 scale-[1.02]"
                )}
                onClick={() => handleThemeSelect(theme.id)}
              >
                <CardContent className="p-6">
                  {/* Header with Icon and Difficulty */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "p-3 rounded-lg",
                      theme.bgColor
                    )}>
                      <IconComponent className={cn("h-6 w-6", theme.textColor)} />
                    </div>
                    <Badge className={getDifficultyColor(theme.difficulty)}>
                      {theme.difficulty}
                    </Badge>
                  </div>

                  {/* Theme Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg leading-tight">
                      {theme.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {theme.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>200+ perguntas</span>
                    <span>SRS Adaptativo</span>
                  </div>

                  {/* Gradient Bar */}
                  <div className={cn(
                    "mt-4 h-2 rounded-full bg-gradient-to-r",
                    theme.color,
                    "opacity-70"
                  )} />
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