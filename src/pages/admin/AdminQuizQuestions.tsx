import React, { useState, useEffect } from "react";
import { AdminAuthProtection } from "@/components/admin-auth-protection";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { JSONQuestionImporter } from "@/components/features/admin/json-question-importer";
import { QuestionApprovalInterface } from "@/components/features/admin/question-approval-interface";

export default function AdminQuizQuestions() {
  const [activeTab, setActiveTab] = useState("import");

  useEffect(() => {
    // Check if we should open approval tab from URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'approval') {
      setActiveTab('approval');
    }
  }, []);

  return (
    <AdminAuthProtection>
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-6">Admin - Perguntas de Quiz</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import">Importar Questões</TabsTrigger>
              <TabsTrigger value="approval">Aprovar Questões</TabsTrigger>
            </TabsList>
            
            <TabsContent value="import">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Perguntas</CardTitle>
                  <CardDescription>Importar e gerenciar perguntas do quiz</CardDescription>
                </CardHeader>
                <CardContent>
                  <JSONQuestionImporter />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="approval">
              <QuestionApprovalInterface />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminAuthProtection>
  );
}