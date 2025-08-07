import { Card } from "@/components/shared/ui/card";

interface ComingSoonOverlayProps {
  children: React.ReactNode;
}

export function ComingSoonOverlay({ children }: ComingSoonOverlayProps) {
  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="filter blur-sm opacity-50 pointer-events-none">
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
        <Card className="p-6 text-center border-2 border-dashed border-muted-foreground/30 bg-card/90">
          <div className="text-2xl mb-2">🚧</div>
          <h3 className="text-lg font-bold text-foreground mb-1">Em Breve!</h3>
          <p className="text-sm text-muted-foreground">
            Esta seção está sendo desenvolvida e estará disponível em breve.
          </p>
        </Card>
      </div>
    </div>
  );
}