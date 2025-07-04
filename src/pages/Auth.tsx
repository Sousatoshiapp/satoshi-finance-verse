import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import authBackground from "@/assets/auth-background.jpg";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Erro de Login",
              description: "Email ou senha incorretos. Verifique suas credenciais.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erro de Login",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta à Satoshi City.",
        });
        
        navigate("/satoshi-city");
      } else {
        // Sign up
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/satoshi-city`,
            data: {
              nickname: nickname || email.split('@')[0]
            }
          },
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              title: "Usuário já existe",
              description: "Esta conta já está cadastrada. Faça login ou use outro email.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erro no Cadastro",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: "Cadastro realizado!",
          description: "Bem-vindo à Satoshi City! Você já pode começar a explorar.",
        });
        
        navigate("/satoshi-city");
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cyberpunk Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${authBackground})`,
          filter: 'brightness(0.3) contrast(1.2)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/60 to-slate-900/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/welcome')}
            className="mb-6 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          {/* Auth Card */}
          <Card className="bg-slate-800/90 backdrop-blur-sm border-2 border-cyan-400/30 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {isLogin ? 'Acesso à Cidade' : 'Cadastro Cidadão'}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {isLogin 
                  ? 'Entre na Satoshi City e continue sua jornada'
                  : 'Torne-se um cidadão da cidade do futuro financeiro'
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="nickname" className="text-gray-300">
                      Nome de Usuário
                    </Label>
                    <Input
                      id="nickname"
                      type="text"
                      placeholder="Como você quer ser conhecido?"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-cyan-400 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {!isLogin && (
                    <p className="text-xs text-gray-400">
                      Mínimo de 6 caracteres
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold py-3 transition-all duration-300"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processando...</span>
                    </div>
                  ) : (
                    isLogin ? 'Entrar na Cidade' : 'Tornar-se Cidadão'
                  )}
                </Button>

                {/* Toggle Button */}
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setEmail("");
                      setPassword("");
                      setNickname("");
                    }}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    {isLogin ? (
                      <>
                        Novo na cidade? <span className="underline ml-1">Crie sua conta</span>
                      </>
                    ) : (
                      <>
                        Já é cidadão? <span className="underline ml-1">Faça login</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Narrative Text */}
                <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-cyan-400/20">
                  <p className="text-sm text-gray-300 text-center leading-relaxed">
                    {isLogin ? (
                      <>
                        <span className="text-cyan-400 font-semibold">Satoshi City</span> aguarda seu retorno.
                        <br />
                        Seus distritos e conquistas estão preservados.
                      </>
                    ) : (
                      <>
                        Bem-vindo ao futuro das finanças em <span className="text-purple-400 font-semibold">Satoshi City</span>.
                        <br />
                        Explore distritos, ganhe XP e domine o conhecimento financeiro.
                      </>
                    )}
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}