import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import { 
  Trophy, 
  Zap, 
  Target, 
  Calendar,
  Brain,
  BookOpen,
  TrendingUp,
  Gamepad2,
  Store,
  Palette,
  Users,
  Wallet,
  Settings,
  Sparkles,
  ArrowLeft
} from "lucide-react";

export default function TestingHub() {
  const navigate = useNavigate();

  const gamificationFeatures = [
    {
      title: "Gamificação Dashboard",
      description: "Central de gamificação com conquistas e estatísticas",
      path: "/gamification",
      icon: Gamepad2,
      status: "beta",
      color: "bg-gradient-to-r from-purple-500 to-pink-500"
    },
    {
      title: "Sistema de Conquistas",
      description: "Visualize e gerencie conquistas e badges",
      path: "/achievements",
      icon: Trophy,
      status: "novo",
      color: "bg-gradient-to-r from-yellow-500 to-orange-500"
    },
    {
      title: "Ligas e Rankings",
      description: "Sistema de ligas competitivas e rankings",
      path: "/leagues",
      icon: TrendingUp,
      status: "beta",
      color: "bg-gradient-to-r from-blue-500 to-cyan-500"
    },
    {
      title: "Power-ups",
      description: "Loja e gerenciamento de power-ups",
      path: "/powerups",
      icon: Zap,
      status: "novo",
      color: "bg-gradient-to-r from-green-500 to-emerald-500"
    },
    {
      title: "Desafios Diários",
      description: "Missões e desafios diários",
      path: "/daily-challenges",
      icon: Target,
      status: "beta",
      color: "bg-gradient-to-r from-red-500 to-pink-500"
    }
  ];

  const aiContentFeatures = [
    {
      title: "Tutor de IA",
      description: "Interface do tutor de IA personalizado",
      path: "/ai-tutor",
      icon: Brain,
      status: "novo",
      color: "bg-gradient-to-r from-indigo-500 to-purple-500"
    },
    {
      title: "Trilhas de Aprendizado",
      description: "Caminhos de aprendizado personalizados",
      path: "/learning-path",
      icon: BookOpen,
      status: "beta",
      color: "bg-gradient-to-r from-teal-500 to-green-500"
    },
    {
      title: "Gerador de Conteúdo",
      description: "Criação de conteúdo com IA",
      path: "/content-generator",
      icon: Sparkles,
      status: "novo",
      color: "bg-gradient-to-r from-violet-500 to-purple-500"
    },
    {
      title: "Simulador de IA",
      description: "Simuladores dinâmicos e adaptativos",
      path: "/ai-simulator",
      icon: Settings,
      status: "beta",
      color: "bg-gradient-to-r from-orange-500 to-red-500"
    }
  ];

  const monetizationFeatures = [
    {
      title: "Dashboard de Monetização",
      description: "Central de economia virtual e monetização",
      path: "/monetization",
      icon: TrendingUp,
      status: "novo",
      color: "bg-gradient-to-r from-emerald-500 to-teal-500"
    },
    {
      title: "Loja Virtual Expandida",
      description: "Loja virtual com novos produtos",
      path: "/virtual-store",
      icon: Store,
      status: "beta",
      color: "bg-gradient-to-r from-blue-500 to-indigo-500"
    },
    {
      title: "Marketplace NFT",
      description: "Marketplace de NFTs e colecionáveis",
      path: "/nft-marketplace",
      icon: Palette,
      status: "novo",
      color: "bg-gradient-to-r from-pink-500 to-rose-500"
    },
    {
      title: "Programa de Afiliados",
      description: "Sistema de referência e comissões",
      path: "/affiliate-program",
      icon: Users,
      status: "beta",
      color: "bg-gradient-to-r from-cyan-500 to-blue-500"
    },
    {
      title: "Carteira Virtual",
      description: "Gestão de Beetz e transações",
      path: "/wallet",
      icon: Wallet,
      status: "novo",
      color: "bg-gradient-to-r from-amber-500 to-orange-500"
    }
  ];

  const FeatureCard = ({ feature }: { feature: any }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-lg ${feature.color} text-white shadow-lg`}>
            <feature.icon className="w-6 h-6" />
          </div>
          <Badge variant={feature.status === 'novo' ? 'default' : 'secondary'}>
            {feature.status}
          </Badge>
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors">
          {feature.title}
        </CardTitle>
        <CardDescription className="text-sm">
          {feature.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          className="w-full" 
          onClick={() => navigate(feature.path)}
          variant="outline"
        >
          Testar Funcionalidade
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              🧪 Hub de Testes
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Teste todas as novas funcionalidades implementadas nas Fases 3, 4 e 5
            </p>
          </div>
        </div>

        {/* Gamificação */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Fase 3: Gamificação</h2>
              <p className="text-muted-foreground">Sistema de conquistas, ligas e recompensas</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gamificationFeatures.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </section>

        {/* Conteúdo e IA */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Fase 4: Conteúdo & IA</h2>
              <p className="text-muted-foreground">Tutores inteligentes e conteúdo personalizado</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {aiContentFeatures.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </section>

        {/* Monetização */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Fase 5: Monetização & Economia</h2>
              <p className="text-muted-foreground">Economia virtual, NFTs e programa de afiliados</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monetizationFeatures.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </section>

        {/* Rodapé */}
        <div className="text-center py-8 border-t">
          <p className="text-muted-foreground">
            💡 <strong>Dica:</strong> Use o botão "🧪" na barra de navegação para acessar rapidamente este hub
          </p>
        </div>
      </div>
    </div>
  );
}
