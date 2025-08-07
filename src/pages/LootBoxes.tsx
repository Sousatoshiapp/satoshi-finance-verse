import React from "react";
import { useNavigate } from "react-router-dom";

export default function LootBoxes() {
  const navigate = useNavigate();
  
  // Loot boxes temporariamente desabilitadas - redirecionar para manutenção
  React.useEffect(() => {
    console.log('[MAINTENANCE] Loot boxes access attempt blocked - redirecting to maintenance');
    navigate('/loot-boxes-maintenance');
  }, [navigate]);

  // Mostrar mensagem de carregamento enquanto redireciona
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecionando...</p>
      </div>
    </div>
  );
}