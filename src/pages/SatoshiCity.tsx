// ============ SATOSHI CITY - TEMPORARIAMENTE DESABILITADO ============
// Todo o sistema de distritos 3D foi comentado temporariamente
// Para reativar: descomentar todo o código original e restaurar as funcionalidades

import React from "react";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { VideoTeaser } from "@/components/3d/VideoTeaser";

export default function SatoshiCity() {
  return (
    <div className="relative">
      <FloatingNavbar />
      <VideoTeaser 
        title="Satoshi City - Em Breve"
        description="Uma experiência imersiva em desenvolvimento. Em breve você poderá explorar os distritos financeiros de Satoshi City em 3D!"
      />
    </div>
  );
}

// ============ CÓDIGO ORIGINAL COMPLETO COMENTADO ============
// Para reativar a Satoshi City completa, substitua todo este arquivo pelo código original
// que inclui: sistema de distritos, mapas 3D, residências, batalhas, XP, etc.