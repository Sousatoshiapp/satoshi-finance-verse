import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/tabs';
import { ArrowLeft, Palette, Crown, Star, Heart, Eye } from 'lucide-react';
import { AvatarEditor } from '@/components/features/avatar-customization/avatar-editor';
import { PetCompanion } from '@/components/features/avatar-customization/pet-companion';
import { ProfileBannerSelector } from '@/components/features/profile-customization/profile-banner-selector';
import { TitleSelector } from '@/components/features/profile-customization/title-selector';
import { ProfileViewsCounter } from '@/components/features/profile-customization/profile-views-counter';

export default function ProfileCustomization() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('avatar');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Perfil
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Personalização Extrema</h1>
              <p className="text-muted-foreground">Customize seu perfil e avatar</p>
            </div>
          </div>
        </div>

        {/* Tabs de Personalização */}
        <Card>
          <CardHeader>
            <CardTitle>Centro de Customização</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="avatar" className="gap-2">
                  <Palette className="h-4 w-4" />
                  Avatar
                </TabsTrigger>
                <TabsTrigger value="pets" className="gap-2">
                  <Heart className="h-4 w-4" />
                  Pets
                </TabsTrigger>
                <TabsTrigger value="banners" className="gap-2">
                  <Star className="h-4 w-4" />
                  Banners
                </TabsTrigger>
                <TabsTrigger value="titles" className="gap-2">
                  <Crown className="h-4 w-4" />
                  Títulos
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Estatísticas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="avatar" className="mt-6">
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold mb-2">Editor de Avatar 2.0</h2>
                    <p className="text-muted-foreground">
                      Crie um avatar único com roupas, acessórios e personalizações desbloqueáveis
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Button 
                      onClick={() => navigate('/avatar-editor')}
                      size="lg"
                      className="gap-2"
                    >
                      <Palette className="h-5 w-5" />
                      Abrir Editor Completo
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pets" className="mt-6">
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold mb-2">Companheiros Virtuais</h2>
                    <p className="text-muted-foreground">
                      Pets que evoluem com sua jornada e te acompanham nos estudos
                    </p>
                  </div>
                  <PetCompanion />
                </div>
              </TabsContent>

              <TabsContent value="banners" className="mt-6">
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold mb-2">Banners de Perfil</h2>
                    <p className="text-muted-foreground">
                      Personalize o fundo do seu perfil com banners únicos
                    </p>
                  </div>
                  <ProfileBannerSelector />
                </div>
              </TabsContent>

              <TabsContent value="titles" className="mt-6">
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold mb-2">Títulos de Conquista</h2>
                    <p className="text-muted-foreground">
                      Mostre suas conquistas com títulos dinâmicos e animados
                    </p>
                  </div>
                  <TitleSelector />
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold mb-2">Estatísticas do Perfil</h2>
                    <p className="text-muted-foreground">
                      Veja quem visitou seu perfil e suas estatísticas de engajamento
                    </p>
                  </div>
                  <ProfileViewsCounter />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Cards de Recursos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200">
            <CardContent className="p-4 text-center">
              <Palette className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-medium mb-1">Avatar 2.0</h3>
              <p className="text-xs text-muted-foreground">
                Editor estilo Bitmoji com customizações desbloqueáveis
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200">
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium mb-1">Pets Evolutivos</h3>
              <p className="text-xs text-muted-foreground">
                Companheiros que crescem com seu streak de estudos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200">
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium mb-1">Banners Únicos</h3>
              <p className="text-xs text-muted-foreground">
                Personalize o fundo do seu perfil com conquistas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-200">
            <CardContent className="p-4 text-center">
              <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <h3 className="font-medium mb-1">Títulos Animados</h3>
              <p className="text-xs text-muted-foreground">
                Mostre suas conquistas com títulos dinâmicos
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}