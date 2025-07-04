import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, BookOpen, Trophy, Users } from "lucide-react";
import welcomeBackground from "@/assets/welcome-background.jpg";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cyberpunk Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${welcomeBackground})`,
          filter: 'brightness(0.4) contrast(1.2)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/60 to-slate-900/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="container mx-auto max-w-4xl text-center">
          {/* Main Title */}
          <div className="mb-12">
            <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
              SATOSHI CITY
            </h1>
            <p className="text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
              O futuro das finanças chegou. Entre na cidade cyberpunk onde conhecimento é poder.
            </p>
            <div className="flex justify-center space-x-4 mb-8">
              <Badge variant="outline" className="border-cyan-400 text-cyan-400 px-4 py-2">
                Sistema Neural Ativo
              </Badge>
              <Badge variant="outline" className="border-purple-400 text-purple-400 px-4 py-2">
                7 Distritos Disponíveis
              </Badge>
              <Badge variant="outline" className="border-pink-400 text-pink-400 px-4 py-2">
                Multiplayer Ativo
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <Card className="bg-slate-800/70 backdrop-blur-sm border-2 border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <CardTitle className="text-cyan-400 text-2xl">Entrar na Cidade</CardTitle>
                <CardDescription className="text-gray-300">
                  Continue sua jornada nos distritos financeiros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-4 text-lg transition-all duration-300"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Fazer Login
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/70 backdrop-blur-sm border-2 border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <CardTitle className="text-purple-400 text-2xl">Tornar-se Cidadão</CardTitle>
                <CardDescription className="text-gray-300">
                  Crie sua conta e explore o futuro das finanças
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/auth')}
                  variant="outline"
                  className="w-full border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black font-bold py-4 text-lg transition-all duration-300"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Criar Conta
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                <CardTitle className="text-white">Conhecimento Neural</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Sistema de aprendizado adaptativo com IA que evolui com seu progresso
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
              <CardHeader>
                <Trophy className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <CardTitle className="text-white">Conquistas & Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Compete com outros cidadãos e suba no ranking dos distritos
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
              <CardHeader>
                <Users className="h-12 w-12 text-pink-400 mx-auto mb-4" />
                <CardTitle className="text-white">Alianças & Duelos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Forme equipes, desafie outros jogadores e domine os distritos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Story Section */}
          <div className="mt-16">
            <Card className="bg-slate-800/40 backdrop-blur-sm border border-cyan-400/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-cyan-400 mb-4">A História</h3>
                <p className="text-gray-300 leading-relaxed max-w-3xl mx-auto">
                  No ano 2089, Satoshi City emergiu como o epicentro do conhecimento financeiro global. 
                  Dividida em 7 distritos especializados, a cidade utiliza um sistema neural avançado 
                  para treinar cidadãos nas mais complexas estratégias de investimento e criptomoedas. 
                  <br /><br />
                  Cada distrito oferece desafios únicos: desde as torres corporativas de XP Investimentos 
                  até os laboratórios de mineração do Cripto Valley. Sua missão? Dominar todos os distritos 
                  e se tornar o Ultimate Trader da cidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}