import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";

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
    requiredLevel: 1,
    consolidatedThemes: ["financial_education", "budgeting", "basic_investments"]
  },
  {
    id: "intermediate_finance", 
    name: "Finanças Intermediária",
    difficulty: "Médio",
    difficultyLevel: 2,
    requiredLevel: 5,
    consolidatedThemes: ["portfolio", "trading"]
  },
  {
    id: "cryptocurrency",
    name: "Cripto",
    difficulty: "Difícil", 
    difficultyLevel: 3,
    requiredLevel: 10,
    consolidatedThemes: ["cryptocurrency"]
  },
  {
    id: "economics",
    name: "Finanças Hard Core",
    difficulty: "Muito Difícil",
    difficultyLevel: 4,
    requiredLevel: 20,
    consolidatedThemes: ["economics"]
  }
];

export function ThemeSelectionModal({ isOpen, onClose, onSelectTheme }: ThemeSelectionModalProps) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const { profile, loading } = useProfile();

  const handleThemeSelect = (themeId: string) => {
    const theme = QUIZ_THEMES.find(t => t.id === themeId);
    const userLevel = profile?.level || 1;
    
    // Verificar se o tema está desbloqueado
    if (theme && userLevel < theme.requiredLevel) {
      return; // Bloquear seleção
    }
    
    setSelectedTheme(themeId);
    // Small delay for visual feedback
    setTimeout(() => {
      onSelectTheme(themeId);
      onClose();
    }, 200);
  };

  const isThemeLocked = (requiredLevel: number) => {
    const userLevel = profile?.level || 1;
    return userLevel < requiredLevel;
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
            Níveis
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          <div className="space-y-3">
            {QUIZ_THEMES.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              const locked = isThemeLocked(theme.requiredLevel);
              
              return (
                <div
                  key={theme.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg transition-all duration-200",
                    "border border-border",
                    !locked && "cursor-pointer hover:bg-accent/50 hover:shadow-md",
                    locked && "opacity-50 cursor-not-allowed",
                    isSelected && !locked && "bg-primary/10 border-primary ring-2 ring-primary/20"
                  )}
                  onClick={() => !locked && handleThemeSelect(theme.id)}
                >
                  <div className="flex items-center gap-3">
                    {locked && <Lock className="w-4 h-4 text-muted-foreground" />}
                    <div>
                      <h3 className="font-semibold text-base text-foreground">
                        {theme.name}
                      </h3>
                      {locked && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Desbloqueie no nível {theme.requiredLevel}
                        </p>
                      )}
                    </div>
                  </div>
                  
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