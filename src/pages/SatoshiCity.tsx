// ============ SATOSHI CITY - TEMPORARIAMENTE DESABILITADO ============
// Todo o sistema de distritos 3D foi comentado temporariamente
// Para reativar: descomentar todo o código original e restaurar as funcionalidades

import React from "react";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { VideoTeaser } from "@/components/3d/VideoTeaser";

export default function SatoshiCity() {
  return (
    <div className="relative">
      <VideoTeaser />
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <FloatingNavbar />
      </div>
    </div>
  );
}

// ============ CÓDIGO ORIGINAL COMPLETO COMENTADO ============
// Para reativar a Satoshi City completa, substitua todo este arquivo pelo código original
// que inclui: sistema de distritos, mapas 3D, residências, batalhas, XP, etc.