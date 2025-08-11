import React from "react";
import { AdminAuthProtection } from "@/components/admin-auth-protection";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { QuestionImportTool } from "@/components/features/admin/question-import-tool";

export default function AdminQuizQuestions() {
  return (
    <AdminAuthProtection>
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">Admin - Perguntas de Quiz</h1>
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Perguntas</CardTitle>
              <CardDescription>Importar e gerenciar perguntas do quiz</CardDescription>
            </CardHeader>
            <CardContent>
              <QuestionImportTool />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminAuthProtection>
  );
}