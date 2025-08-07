import BTZEconomics from "./BTZEconomics";
import { BTZAchievements } from "@/components/btz-achievements";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";

export default function BTZEconomicsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="analytics" className="w-full">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
          <div className="max-w-7xl mx-auto px-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="achievements">Conquistas</TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="analytics" className="mt-0">
          <BTZEconomics />
        </TabsContent>
        
        <TabsContent value="achievements" className="mt-0">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Conquistas BTZ</h1>
              <p className="text-muted-foreground">Desbloqueie recompensas especiais baseadas em suas atividades</p>
            </div>
            <BTZAchievements />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
