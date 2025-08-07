import React from "react";
import { AuthUserProvider } from "./AuthUserContext";
import { AuthStatusProvider } from "./AuthStatusContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthUserProvider>
      <AuthStatusProvider>
        {children}
      </AuthStatusProvider>
    </AuthUserProvider>
  );
}