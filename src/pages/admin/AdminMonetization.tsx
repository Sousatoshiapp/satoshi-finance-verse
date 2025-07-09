import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminMonetization() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin - Monetização</h1>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Economia Virtual</CardTitle>
          <CardDescription>Configure preços, comissões e transações</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Painel administrativo em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  );
}