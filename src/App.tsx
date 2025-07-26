import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { SponsorThemeProvider } from "@/contexts/SponsorThemeProvider";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { generateRoutes } from "@/components/RouteGenerator";

function App() {
  return (
    <AuthProvider>
      <RealtimeProvider>
        <SponsorThemeProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {generateRoutes()}
                <Route path="*" element={<div>404 - Página não encontrada</div>} />
              </Routes>
            </Suspense>
          </div>
        </SponsorThemeProvider>
      </RealtimeProvider>
    </AuthProvider>
  );
}

export default App;
