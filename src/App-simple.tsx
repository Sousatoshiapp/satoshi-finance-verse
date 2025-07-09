import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Import direct components
import Welcome from "@/pages/Welcome";
import Auth from "@/pages/Auth";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<div>404 - Página não encontrada</div>} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;