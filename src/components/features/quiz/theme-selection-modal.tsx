import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { IconSystem } from "@/components/icons/icon-system";
import { useIsMobile } from "@/hooks/use-mobile";


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
    color: "border-purple-500/30 hover:border-purple-500/60"
  },
  {
    id: "abc_financas",
    name: "Treinamento Básico", 
    description: "ABC das finanças",
    category: "ABC das Finanças",
    icon: "👓",
    color: "border-pink-500/30 hover:border-pink-500/60"
  },
  {
    id: "cripto",
    name: "Missão Blockchain",
    description: "Tudo sobre o mundo cripto",
    category: "Cripto",
    icon: "₿",
    color: "border-yellow-500/30 hover:border-yellow-500/60"
  }
];

export function ThemeSelectionModal({ isOpen, onClose, onSelectTheme }: ThemeSelectionModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const isMobile = useIsMobile();

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
      <DialogContent className={cn(
        "casino-card bg-black/40 backdrop-blur-sm border-purple-500/30",
        isMobile 
          ? "max-w-[95vw] max-h-[75vh] w-full" 
          : "max-w-md max-h-[90vh]"
      )}>
        <DialogHeader className={isMobile ? "pb-1" : "pb-2"}>
          <DialogTitle className={cn(
            "font-bold text-center text-white",
            isMobile ? "text-base" : "text-lg"
          )}>
            Escolha seu jogo
          </DialogTitle>
        </DialogHeader>

        <div className={cn(
          "flex-1",
          isMobile ? "-mx-3 px-3" : "-mx-6 px-6"
        )}>
          <div className={cn(
            isMobile 
              ? "grid grid-cols-2 gap-2" 
              : "space-y-4"
          )}>
            {QUIZ_CATEGORIES.map((category, index) => {
              const isSelected = selectedCategory === category.id;
              const isThirdCard = index === 2;
              
              return (
                <div
                  key={category.id}
                  className={cn(
                    "relative overflow-hidden rounded-lg border transition-all duration-300 cursor-pointer casino-topic-card casino-sweep",
                    "hover:shadow-[0_0_20px_rgba(139,69,255,0.3)] casino-hover",
                    "bg-black/20 backdrop-blur-sm",
                    category.color,
                    isSelected 
                      ? "border-yellow-500/80 shadow-[0_0_25px_rgba(255,215,0,0.4)]" 
                      : "",
                    isMobile && isThirdCard ? "col-span-2" : "",
                    isMobile 
                      ? "h-16 hover:scale-[1.01]" 
                      : "hover:-translate-y-1 hover:scale-[1.02]"
                  )}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  {/* Content */}
                  <div className={cn(
                    "relative z-10 h-full",
                    isMobile ? "p-2" : "p-4"
                  )}>
                    <div className={cn(
                      "flex items-center h-full",
                      isMobile ? "gap-2" : "gap-4"
                    )}>
                      <div className="drop-shadow-lg flex-shrink-0">
                        <IconSystem 
                          emoji={category.icon as "💰" | "👓" | "₿"} 
                          size={isMobile ? "md" : "xl"} 
                          variant="glow" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "font-bold text-white",
                          isMobile ? "text-sm leading-tight" : "text-lg mb-1"
                        )}>
                          {category.name}
                        </h3>
                        {!isMobile && (
                          <p className="text-sm text-gray-300">
                            {category.description}
                          </p>
                        )}
                        {isMobile && (
                          <p className="text-xs text-gray-400 truncate">
                            {category.category}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {!isMobile && (
                      <div className="mt-3">
                        <Badge 
                          variant="outline"
                          className="text-xs font-medium text-white bg-black/20 border-purple-500/30"
                        >
                          {category.category}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!isMobile && (
          <div className="flex justify-center pt-4 border-t border-purple-500/20">
            <Button
              variant="outline"
              onClick={onClose}
              className="min-w-32 casino-button border-purple-500/40 text-white hover:border-purple-500/60 hover:bg-purple-500/10"
            >
              Cancelar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}