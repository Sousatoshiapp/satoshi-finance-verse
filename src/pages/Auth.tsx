import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/shared/ui/separator";
import { EmailVerificationNotice } from "@/components/auth/email-verification-notice";
import { useTranslation } from "react-i18next";
import logoImage from "@/assets/new-logo.png";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
    } else if (mode === 'login') {
      setIsLogin(true);
    }
  }, [searchParams]);

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
              title: t('auth.messages.loginError'),
              description: t('auth.messages.invalidCredentials'),
              variant: "destructive",
            });
          } else if (error.message.includes("Email not confirmed")) {
            toast({
              title: t('auth.messages.emailNotConfirmed'),
              description: t('auth.messages.emailNotConfirmedDesc'),
              variant: "destructive",
            });
          } else {
            toast({
              title: t('auth.messages.loginError'),
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: t('auth.messages.loginSuccess'),
          description: t('auth.messages.loginSuccessDesc'),
        });
        
        navigate("/dashboard");
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
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
              title: t('auth.messages.userExists'),
              description: t('auth.messages.userExistsDesc'),
              variant: "destructive",
            });
          } else {
            toast({
              title: t('auth.messages.signupError'),
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }

        if (data.user && !data.session) {
          // User needs to verify email
          setRegisteredEmail(email);
          setShowEmailVerification(true);
          toast({
            title: t('auth.messages.signupSuccess'),
            description: t('auth.messages.signupSuccessDesc')
          });
        } else if (data.session) {
          // User is already confirmed
          toast({
            title: t('auth.messages.welcomeNew'),
            description: t('auth.messages.welcomeNewDesc')
          });
          navigate("/dashboard");
        }
      }
    } catch (error) {
      toast({
        title: t('auth.messages.unexpectedError'),
        description: t('auth.messages.unexpectedErrorDesc'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'discord') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/oauth-callback`
        }
      });

      if (error) {
        toast({
          title: t('auth.messages.socialLoginError'),
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t('auth.messages.unexpectedError'),
        description: t('auth.messages.socialLoginErrorDesc'),
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        title: t('auth.messages.emailRequired'),
        description: t('auth.messages.emailRequiredDesc'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Usar a função unificada de email
      const { data, error } = await supabase.functions.invoke('unified-email', {
        body: {
          type: 'password_reset',
          email: resetEmail,
          redirectTo: `${window.location.origin}/password-reset`
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error('Erro ao conectar com o servidor');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro ao enviar email');
      }

      toast({
        title: t('auth.messages.emailSent'),
        description: t('auth.messages.emailSentDesc'),
      });
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: t('errors.passwordResetError'),
        description: error.message || t('auth.messages.unexpectedErrorDesc'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        title: t('auth.messages.emailRequiredResend'),
        description: t('auth.messages.emailRequiredResendDesc'),
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        toast({
          title: t('errors.resendEmailError'),
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t('auth.messages.emailResent'),
          description: t('auth.messages.emailResentDesc'),
        });
      }
    } catch (error) {
      toast({
        title: t('auth.messages.unexpectedError'),
        description: t('auth.messages.unexpectedErrorDesc'),
        variant: "destructive",
      });
    }
  };

  if (showEmailVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <EmailVerificationNotice 
          email={registeredEmail}
          onResend={() => {
            toast({
              title: "Email reenviado",
              description: "Verifique sua caixa de entrada"
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Cyberpunk Background with Grid */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-slate-900 to-background">
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="floating-particle opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${8 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
        
        {/* Scanner Line Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 animate-pulse" 
             style={{ animation: 'scanner 4s ease-in-out infinite' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-start justify-center safe-area-full px-4 pt-1">
        <div className="w-full max-w-xs">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/welcome')}
            className="mb-1 text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {/* Logo */}
          <div className="text-center">
            <div className="flex justify-center">
              <img 
                src="/lovable-uploads/3601a8a7-21e2-403a-aeea-326289b3c5b5.png" 
                alt="Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
          </div>

          {/* Enhanced Auth Card */}
          <Card className="space-card border-primary/30 shadow-glow relative overflow-hidden" style={{height: '80%'}}>
            {/* Card Header with Enhanced Styling */}
            <CardHeader className="text-center px-4 py-3 relative">
              <CardTitle className="text-lg font-bold text-gradient mb-1">
                {isLogin ? t('auth.title.login') : t('auth.title.signup')}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                {isLogin 
                  ? t('auth.description.login')
                  : t('auth.description.signup')
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="px-4 pb-3">
              {showForgotPassword ? (
                // Forgot Password Form
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail" className="text-gray-300">
                      {t('auth.form.resetEmail')}
                    </Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder={t('auth.form.resetEmailPlaceholder')}
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-colors duration-200"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full gradient-primary text-background font-bold py-3 auth-button hover:scale-105 transform transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                        <span>{t('auth.buttons.sending')}</span>
                      </div>
                    ) : (
                      t('auth.buttons.sendResetLink')
                    )}
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setResetEmail("");
                      }}
                      className="text-gray-400 hover:text-[#adff2f]"
                    >
                      {t('auth.buttons.backToLogin')}
                    </Button>
                  </div>

                  <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-[#adff2f]/20">
                    <p className="text-sm text-gray-300 text-center leading-relaxed">
                      {t('auth.messages.resetInstructions')}
                      <br />
                      <span className="text-[#adff2f] font-semibold">{t('auth.messages.checkSpam')}</span>
                    </p>
                  </div>
                </form>
              ) : (
                // Main Auth Form
              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="nickname" className="text-gray-300">
                      {t('auth.form.nickname')}
                    </Label>
                    <Input
                      id="nickname"
                      type="text"
                      placeholder={t('auth.form.nicknamePlaceholder')}
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-colors duration-200"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    {t('auth.form.email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.form.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-colors duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">
                    {t('auth.form.password')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t('auth.form.passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-colors duration-200 pr-10"
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
                      {t('auth.form.passwordMinLength')}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full text-primary-foreground font-bold py-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                      <span>{t('auth.buttons.processing')}</span>
                    </div>
                  ) : (
                    isLogin ? t('auth.buttons.login') : t('auth.buttons.signup')
                  )}
                </Button>

                {/* Forgot Password Link */}
                {isLogin && !showForgotPassword && (
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {t('auth.buttons.forgotPassword')}
                    </Button>
                  </div>
                )}

                {/* Resend Confirmation Button */}
                {isLogin && email && (
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={handleResendConfirmation}
                      className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200"
                    >
                      {t('auth.buttons.resendConfirmation')}
                    </Button>
                  </div>
                )}

                {/* Social Login Separator */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full bg-slate-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-800 px-2 text-gray-400">{t('auth.buttons.socialSeparator')}</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuth('google')}
                    className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 hover:border-slate-500"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuth('discord')}
                    className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 hover:border-slate-500"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z"/>
                    </svg>
                    Discord
                  </Button>
                </div>

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
                        {t('auth.buttons.toggleSignup')}
                      </>
                    ) : (
                      <>
                        {t('auth.buttons.toggleLogin')}
                      </>
                    )}
                  </Button>
                </div>

              </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
