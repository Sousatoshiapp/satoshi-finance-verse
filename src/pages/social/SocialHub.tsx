import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Trophy, Zap, Target } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import { FloatingNavbar } from "@/components/shared/floating-navbar";

export default function SocialHub() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const isMobile = useIsMobile();

  const socialFeatures = [
    {
      title: "Stories",
      description: "Compartilhe suas conquistas",
      icon: Trophy,
      path: "/stories",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500/10 border-yellow-500/30"
    },
    {
      title: "Battle Royale",
      description: "Batalhas em tempo real",
      icon: Target,
      path: "/battle-royale",
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-500/10 border-red-500/30"
    },
    {
      title: "Community Feed",
      description: "Vitórias recentes da comunidade",
      icon: Users,
      path: "/community-feed",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10 border-blue-500/30"
    },
    {
      title: "Tournaments",
      description: "Torneios semanais",
      icon: Zap,
      path: "/social-tournaments",
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-500/10 border-purple-500/30"
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5 ${isMobile ? 'pb-24' : ''}`}>
      {/* Header */}
      <motion.div 
        className={`flex items-center justify-between ${isMobile ? 'p-4' : 'p-6'}`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="border-border/50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Social Hub
            </h1>
            <p className="text-sm text-muted-foreground">
              Conecte-se com a comunidade
            </p>
          </div>
        </div>
      </motion.div>

      {/* Social Features Grid */}
      <div className={`${isMobile ? 'px-4' : 'px-6'} max-w-4xl mx-auto`}>
        <motion.div 
          className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-6'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {socialFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${feature.bgColor} backdrop-blur-sm`}
                  onClick={() => navigate(feature.path)}
                >
                  <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-lg`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {feature.description}
                        </p>
                        <motion.div
                          className="mt-3 text-primary text-sm font-medium"
                          whileHover={{ x: 5 }}
                        >
                          Explorar →
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="mt-8 grid grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">42</div>
              <div className="text-sm text-muted-foreground">Online</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">128</div>
              <div className="text-sm text-muted-foreground">Batalhas</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">7</div>
              <div className="text-sm text-muted-foreground">Torneios</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {isMobile && <FloatingNavbar />}
    </div>
  );
}