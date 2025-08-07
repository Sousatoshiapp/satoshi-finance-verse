import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
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
    difficulty: "Fácil",
    difficultyLevel: 1,
    consolidatedThemes: ["financial_education", "budgeting", "basic_investments"]
  },
  {
    id: "intermediate_finance", 
    name: "Finanças Intermediária",
    difficulty: "Médio",
    difficultyLevel: 2,
    consolidatedThemes: ["portfolio", "trading"]
  },
  {
    id: "cryptocurrency",
    name: "Cripto",
    difficulty: "Difícil", 
    difficultyLevel: 3,
    consolidatedThemes: ["cryptocurrency"]
  },
  {
    id: "economics",
    name: "Finanças Hard Core",
    difficulty: "Muito Difícil",
    difficultyLevel: 4,
    consolidatedThemes: ["economics"]
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

  const getDifficultyBadge = (difficultyLevel: number, difficulty: string) => {
    switch (difficultyLevel) {
      case 1: return "bg-success/20 text-success border-success/30";
      case 2: return "bg-warning/20 text-warning border-warning/30";
      case 3: return "bg-destructive/20 text-destructive border-destructive/30";
      case 4: return "bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white border-none animate-pulse shadow-lg shadow-orange-500/50";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold text-center">
            Escolha seu Tema de Quiz
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          <div className="space-y-3">
            {QUIZ_THEMES.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              
              return (
                <div
                  key={theme.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-200",
                    "hover:bg-accent/50 hover:shadow-md",
                    "border border-border",
                    isSelected && "bg-primary/10 border-primary ring-2 ring-primary/20"
                  )}
                  onClick={() => handleThemeSelect(theme.id)}
                >
                  <h3 className="font-semibold text-base text-foreground">
                    {theme.name}
                  </h3>
                  
                  <Badge 
                    variant="outline"
                    className={cn(
                      "font-medium text-xs px-3 py-1",
                      getDifficultyBadge(theme.difficultyLevel, theme.difficulty)
                    )}
                  >
                    {theme.difficulty}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center pt-4 border-t border-border">
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