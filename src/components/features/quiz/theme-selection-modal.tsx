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

// NOVO SISTEMA: Categorias baseadas nas especificações do usuário
// Sistema SRS/FSRS determina a dificuldade automaticamente
const QUIZ_CATEGORIES = [
  {
    id: "financas_dia_a_dia",
    name: "Modo Sobrevivência",
    description: "Finanças aplicadas ao seu cotidiano",
    category: "Finanças do Dia a Dia",
    icon: "🏠",
    color: "bg-green-500/20 text-green-700 border-green-300"
  },
  {
    id: "abc_financas",
    name: "Treinamento Básico", 
    description: "ABC das finanças",
    category: "ABC das Finanças",
    icon: "📚",
    color: "bg-blue-500/20 text-blue-700 border-blue-300"
  },
  {
    id: "cripto",
    name: "Missão Blockchain",
    description: "Tudo sobre o mundo cripto",
    category: "Cripto",
    icon: "₿",
    color: "bg-orange-500/20 text-orange-700 border-orange-300"
  }
];

export function ThemeSelectionModal({ isOpen, onClose, onSelectTheme }: ThemeSelectionModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategorySelect = (categoryId: string) => {
    const category = QUIZ_CATEGORIES.find(c => c.id === categoryId);
    
    if (!category) return;
    
    setSelectedCategory(categoryId);
    
    // Delay para feedback visual
    setTimeout(() => {
      // Passar categoria real para o sistema novo
      onSelectTheme(category.category);
      onClose();
    }, 200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold text-center">
            Escolha seu Modo de Jogo
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            A dificuldade será ajustada automaticamente pelo sistema SRS
          </p>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          <div className="space-y-4">
            {QUIZ_CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.id;
              
              return (
                <div
                  key={category.id}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer",
                    "hover:shadow-lg hover:scale-[1.02]",
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-md" 
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{category.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground mb-1">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Badge 
                      variant="outline"
                      className={cn("text-xs font-medium", category.color)}
                    >
                      {category.category}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              💡 <strong>Dica:</strong> O sistema SRS monitora seu desempenho e ajusta automaticamente a dificuldade das questões para otimizar seu aprendizado.
            </p>
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