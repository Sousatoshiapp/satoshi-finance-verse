
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { ForgotPasswordForm } from "./forgot-password-form";
import { useState } from "react";

export function AuthTabs() {
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'forgot'>('login');

  if (currentView === 'forgot') {
    return (
      <div className="w-full max-w-md mx-auto">
        <ForgotPasswordForm onBack={() => setCurrentView('login')} />
      </div>
    );
  }

  return (
    <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as 'login' | 'signup')} className="w-full max-w-md mx-auto">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Entrar</TabsTrigger>
        <TabsTrigger value="signup">Cadastrar</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login" className="space-y-4">
        <LoginForm onForgotPassword={() => setCurrentView('forgot')} />
      </TabsContent>
      
      <TabsContent value="signup" className="space-y-4">
        <SignupForm />
      </TabsContent>
    </Tabs>
  );
}
