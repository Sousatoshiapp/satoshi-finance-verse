import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Trophy, Users, Gamepad2, Shield } from "lucide-react";
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
        <div className="container mx-auto max-w-md">
          {/* App Logo/Title */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/85640d9f-9c11-41ee-a94b-960e0cf9a946.png" 
                alt="Satoshi City Logo" 
                className="h-32 w-auto animate-pulse"
              />
            </div>
            <p className="text-xl text-gray-300 mb-6 leading-relaxed">
              O futuro das finanças chegou
            </p>
            <div className="flex justify-center space-x-2 mb-8">
              <Badge variant="outline" className="border-cyan-400 text-cyan-400 text-xs px-3 py-1">
                Sistema Neural
              </Badge>
              <Badge variant="outline" className="border-purple-400 text-purple-400 text-xs px-3 py-1">
                7 Distritos
              </Badge>
              <Badge variant="outline" className="border-pink-400 text-pink-400 text-xs px-3 py-1">
                Multiplayer
              </Badge>
            </div>
          </div>

          {/* Auth Options */}
          <div className="space-y-4 mb-8">
            <Card className="bg-slate-800/70 backdrop-blur-sm border-2 border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-300">
              <CardContent className="p-6">
                <Button 
                  onClick={() => navigate('/auth?mode=login')}
                  className="w-full font-bold py-4 text-lg transition-all duration-300"
                  style={{ backgroundColor: '#adff2f', color: '#000000' }}
                >
                  <Shield className="mr-2 h-5 w-5" />
                  Entrar na Cidade
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/70 backdrop-blur-sm border-2 border-purple-400/30 hover:border-purple-400/60 transition-all duration-300">
              <CardContent className="p-6">
                <Button 
                  onClick={() => navigate('/auth?mode=signup')}
                  variant="outline"
                  className="w-full font-bold py-4 text-lg transition-all duration-300"
                  style={{ borderColor: '#adff2f', color: '#adff2f' }}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Tornar-se Cidadão
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-600/50">
              <CardContent className="p-4 text-center">
                <BookOpen className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-sm text-gray-300">Conhecimento Neural</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-600/50">
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="text-sm text-gray-300">Rankings</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-600/50">
              <CardContent className="p-4 text-center">
                <Gamepad2 className="h-8 w-8 text-pink-400 mx-auto mb-2" />
                <p className="text-sm text-gray-300">Duelos</p>
              </CardContent>
            </Card>
          </div>

          {/* Story Section */}
          <div className="mt-8">
            <Card className="bg-slate-800/30 backdrop-blur-sm border border-cyan-400/20">
              <CardContent className="p-6">
                <p className="text-sm text-gray-300 leading-relaxed text-center">
                  No ano 2089, <span className="text-cyan-400 font-semibold">Satoshi City</span> emergiu como o epicentro do conhecimento financeiro global. 
                  <br /><br />
                  Domine todos os distritos e se torne o <span className="text-purple-400 font-semibold">Ultimate Trader</span> da cidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}