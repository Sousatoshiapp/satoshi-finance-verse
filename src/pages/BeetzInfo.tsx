import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Coins, ShoppingCart, Gamepad2, Users, Zap, Trophy, TrendingUp } from "lucide-react";

export default function BeetzInfo() {
  const navigate = useNavigate();

  const useCases = [
    {
      icon: ShoppingCart,
      title: "Loja Digital",
      description: "Compre avatares, skins, acessórios e temas exclusivos",
      color: "text-blue-500"
    },
    {
      icon: Zap,
      title: "Boosts & Power-ups",
      description: "Multiplicadores de XP, proteção de streak e vantagens",
      color: "text-yellow-500"
    },
    {
      icon: Gamepad2,
      title: "Playground Trading",
      description: "Funcionalidades premium de investimento virtual",
      color: "text-green-500"
    },
    {
      icon: Users,
      title: "Competições",
      description: "Taxa de inscrição em torneios e duelos premium",
      color: "text-purple-500"
    },
    {
      icon: Trophy,
      title: "Assinaturas",
      description: "Planos mensais com benefícios exclusivos",
      color: "text-orange-500"
    },
    {
      icon: TrendingUp,
      title: "Staking & Rewards",
      description: "Ganhe recompensas passivas apostando seus Beetz",
      color: "text-cyan-500"
    }
  ];

  const howToEarn = [
    "🎯 Complete quizzes e lições",
    "🔥 Mantenha seu streak de estudos",
    "🏆 Participe de competições",
    "🎁 Colete recompensas diárias",
    "👥 Interaja socialmente",
    "📈 Use o playground de investimentos"
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-beetz rounded-full flex items-center justify-center">
              <span className="text-2xl">🥕</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Beetz</h1>
              <p className="text-sm text-muted-foreground">A moeda do ecossistema Satoshi</p>
            </div>
          </div>
        </div>

        {/* Main Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-beetz" />
              O que são os Beetz?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Os <strong className="text-beetz">Beetz</strong> são a criptomoeda oficial da Satoshi Finance Game. 
              Inspirados na beterraba, símbolo de crescimento e sustentabilidade, os Beetz representam 
              o valor que você cria através do aprendizado e engajamento na nossa plataforma.
            </p>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-foreground font-medium mb-2">💡 Por que "Beetz"?</p>
              <p className="text-sm text-muted-foreground">
                As beterrabas crescem underground, assim como o conhecimento financeiro cresce 
                discretamente mas com fundações sólidas. Elas também são nutritivas e sustentáveis - 
                exatamente como queremos que seja sua educação financeira!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Use Cases */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Como usar seus Beetz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {useCases.map((useCase, index) => {
                const IconComponent = useCase.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <IconComponent className={`h-5 w-5 ${useCase.color} mt-0.5`} />
                    <div>
                      <h4 className="font-medium text-foreground">{useCase.title}</h4>
                      <p className="text-sm text-muted-foreground">{useCase.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* How to Earn */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Como ganhar Beetz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {howToEarn.map((method, index) => (
                <div key={index} className="flex items-center gap-2 p-2">
                  <span className="text-sm">{method}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-foreground font-medium mb-1">🎁 Dica:</p>
              <p className="text-sm text-muted-foreground">
                Mantenha seu streak diário ativo para ganhar multiplicadores de Beetz em todas as atividades!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Economy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Economia Sustentável</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-beetz">♻️</p>
                <p className="text-xs text-muted-foreground mt-1">Economia Circular</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-beetz">📊</p>
                <p className="text-xs text-muted-foreground mt-1">Valor Real</p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Os Beetz têm valor real dentro do ecossistema e são distribuídos de forma justa 
              baseada no mérito e engajamento. Quanto mais você aprende e participa, mais Beetz você ganha!
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/store')}
            className="w-full"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Explorar Loja
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="w-full"
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}