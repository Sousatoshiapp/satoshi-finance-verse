import React from "react";
import { AdminAuthProtection } from "@/components/admin-auth-protection";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";

export default function AdminFinanceReports() {
  return (
    <AdminAuthProtection>
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">Admin - Relatórios Financeiros</h1>
          <Card>
            <CardHeader>
              <CardTitle>Relatórios & Analytics</CardTitle>
              <CardDescription>Relatórios financeiros detalhados e métricas</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Painel administrativo em desenvolvimento...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminAuthProtection>
  );
}