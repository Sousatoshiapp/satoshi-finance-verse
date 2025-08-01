import React from "react";
import { IconShowcase } from "@/components/shared/icon-showcase";

function Icons() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Ícones Personalizados
          </h1>
          <p className="text-muted-foreground">
            Visualização completa dos novos ícones cyberpunk/tech
          </p>
        </div>
        
        <IconShowcase />
      </div>
    </div>
  );
}

export default Icons;
