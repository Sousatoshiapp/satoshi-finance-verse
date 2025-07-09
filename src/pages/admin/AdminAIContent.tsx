import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAIContent() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin - Conteúdo IA</h1>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Conteúdo de IA</CardTitle>
          <CardDescription>Configure tutores e geração de conteúdo</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Painel administrativo em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  );
}