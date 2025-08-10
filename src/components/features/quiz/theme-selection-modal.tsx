import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { IconSystem } from "@/components/icons/icon-system";

// Import background images
import survivalBg from "@/assets/survival-mode-bg.jpg";
import trainingBg from "@/assets/training-mode-bg.jpg";
import blockchainBg from "@/assets/blockchain-mode-bg.jpg";

interface ThemeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTheme: (theme: string) => void;
}

// NOVO SISTEMA: Categorias baseadas nas especificações do usuário
// Sistema SRS/FSRS determina a dificuldade automaticamente
const QUIZ_CATEGORIES = [
  {
    id: "financas_dia_a_dia",
    name: "Modo Sobrevivência",
    description: "Finanças aplicadas ao seu cotidiano",
    category: "Finanças do Dia a Dia",
    icon: "💰",
    color: "bg-green-500/20 text-green-700 border-green-300",
    backgroundImage: survivalBg
  },
  {
    id: "abc_financas",
    name: "Treinamento Básico", 
    description: "ABC das finanças",
    category: "ABC das Finanças",
    icon: "👓",
    color: "bg-blue-500/20 text-blue-700 border-blue-300",
    backgroundImage: trainingBg
  },
  {
    id: "cripto",
    name: "Missão Blockchain",
    description: "Tudo sobre o mundo cripto",
    category: "Cripto",
    icon: "₿",
    color: "bg-orange-500/20 text-orange-700 border-orange-300",
    backgroundImage: blockchainBg
  }
];

export function ThemeSelectionModal({ isOpen, onClose, onSelectTheme }: ThemeSelectionModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategorySelect = (categoryId: string) => {
    console.log('🎯 Categoria clicada:', categoryId);
    const category = QUIZ_CATEGORIES.find(c => c.id === categoryId);
    
    if (!category) {
      console.error('❌ Categoria não encontrada:', categoryId);
      return;
    }
    
    console.log('✅ Categoria encontrada:', category);
    setSelectedCategory(categoryId);
    
    // Delay para feedback visual
    setTimeout(() => {
      console.log('🎭 Enviando categoria:', category.category);
      // Passar categoria real para o sistema novo
      onSelectTheme(category.category);
      console.log('🚪 Fechando modal...');
      onClose();
    }, 200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-bold text-center">
            Escolha seu jogo
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          <div className="space-y-4">
            {QUIZ_CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.id;
              
              return (
                <div
                  key={category.id}
                  className={cn(
                    "relative overflow-hidden rounded-lg border-2 transition-all duration-200 cursor-pointer",
                    "hover:shadow-lg hover:scale-[1.02]",
                    isSelected 
                      ? "border-primary shadow-md" 
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => handleCategorySelect(category.id)}
                  style={{
                    backgroundImage: `url(${category.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '100px'
                  }}
                >
                  {/* Overlay with 50% transparency */}
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px]"></div>
                  
                  {/* Content over image */}
                  <div className="relative z-10 p-3">
                    <div className="flex items-center gap-4">
                      <div className="drop-shadow-lg">
                        <IconSystem emoji={category.icon as "💰" | "👓" | "₿"} size="xl" variant="glow" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-foreground mb-1 drop-shadow-md">
                          {category.name}
                        </h3>
                        <p className="text-sm text-foreground/90 drop-shadow-sm">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Badge 
                        variant="outline"
                        className={cn(
                          "text-xs font-medium backdrop-blur-sm text-white",
                          "bg-background/80 border-foreground/20",
                          category.color
                        )}
                      >
                        {category.category}
                      </Badge>
                    </div>
                  </div>
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