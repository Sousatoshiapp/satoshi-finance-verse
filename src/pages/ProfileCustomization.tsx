// ============================================
// PERSONALIZAÇÃO EXTREMA - TEMPORARIAMENTE DESABILITADA
// ============================================
// Esta funcionalidade foi temporariamente removida para 
// revisão e melhorias futuras. Será reativada em breve.
// 
// Funcionalidades incluídas:
// - Avatar 2.0 com customização avançada
// - Sistema de pets companions
// - Banners de perfil personalizados  
// - Títulos e badges animados
// - Analytics de visualizações do perfil
// ============================================

/*
import { useState } from "react";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { useNavigate } from "react-router-dom";
import { AvatarEditor } from "@/components/features/avatar-customization/avatar-editor";
import { PetCompanion } from "@/components/features/avatar-customization/pet-companion";
import { ProfileBannerSelector } from "@/components/features/profile-customization/profile-banner-selector";
import { TitleSelector } from "@/components/features/profile-customization/title-selector";
import { ProfileViewsCounter } from "@/components/features/profile-customization/profile-views-counter";
import { useProfile } from "@/hooks/use-profile";
import { Avatar, Settings, Star, Award, BarChart3 } from "lucide-react";

export default function ProfileCustomization() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("avatar");
  const { profile } = useProfile();

  return (
    <div className="min-h-screen bg-background pb-24 pt-16">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="outline" onClick={() => navigate('/profile')}>
              ← Voltar ao Perfil
            </Button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
            Personalização Extrema
          </h1>
          <p className="text-muted-foreground">
            Customize seu avatar, pets, banners e muito mais!
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Opções de Personalização</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="avatar" className="flex items-center gap-2">
                  <Avatar className="w-4 h-4" />
                  Avatar
                </TabsTrigger>
                <TabsTrigger value="pets" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Pets
                </TabsTrigger>
                <TabsTrigger value="banners" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Banners
                </TabsTrigger>
                <TabsTrigger value="titles" className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Títulos
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="avatar" className="mt-6">
                <AvatarEditor />
              </TabsContent>

              <TabsContent value="pets" className="mt-6">
                <PetCompanion />
              </TabsContent>

              <TabsContent value="banners" className="mt-6">
                <ProfileBannerSelector profile={profile} />
              </TabsContent>

              <TabsContent value="titles" className="mt-6">
                <TitleSelector />
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <ProfileViewsCounter profile={profile} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Avatar className="w-12 h-12 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Avatar</h3>
              <p className="text-sm text-muted-foreground">
                Customize aparência, roupas e acessórios
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Settings className="w-12 h-12 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Pets</h3>
              <p className="text-sm text-muted-foreground">
                Companheiros virtuais que evoluem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-12 h-12 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Banners</h3>
              <p className="text-sm text-muted-foreground">
                Fundos especiais para seu perfil
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Award className="w-12 h-12 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Títulos</h3>
              <p className="text-sm text-muted-foreground">
                Badges e títulos especiais
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
*/

// Placeholder component to prevent build errors
export default function ProfileCustomization() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-muted-foreground mb-2">
          Personalização Extrema
        </h1>
        <p className="text-muted-foreground">
          Esta funcionalidade está sendo desenvolvida...
        </p>
      </div>
    </div>
  );
}