import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminGamification() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin - Gamificação</h1>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Sistema de Gamificação</CardTitle>
          <CardDescription>Configure conquistas, power-ups e desafios</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Painel administrativo em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  );
}