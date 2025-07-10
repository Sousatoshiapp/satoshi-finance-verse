import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Palette, Gamepad2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Marketplace() {
  const navigate = useNavigate();

  const marketplaceCategories = [
    {
      id: "lives",
      title: "💖 Loja de Vidas",
      description: "Compre vidas para manter sua sequência em quizzes",
      icon: Heart,
      path: "/marketplace/lives",
      gradient: "from-red-500/20 to-pink-500/20",
      border: "border-red-500/30"
    },
    {
      id: "nft",
      title: "🎨 NFT Marketplace",
      description: "Colecionáveis digitais únicos",
      icon: Palette,
      path: "/nft-marketplace",
      gradient: "from-purple-500/20 to-violet-500/20",
      border: "border-purple-500/30"
    },
    {
      id: "powerups",
      title: "⚡ Power-ups",
      description: "Itens especiais para melhorar sua gameplay",
      icon: Gamepad2,
      path: "/store",
      gradient: "from-blue-500/20 to-cyan-500/20",
      border: "border-blue-500/30"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">🛒 Marketplace</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Descubra itens incríveis para melhorar sua experiência de jogo
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Banner promocional */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">🎉 Ofertas Especiais</h2>
            <p className="text-muted-foreground mb-4">
              Aproveite descontos exclusivos em pacotes de vidas!
            </p>
            <Button 
              onClick={() => navigate('/marketplace/lives')}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              Ver Ofertas
            </Button>
          </CardContent>
        </Card>

        {/* Categorias do marketplace */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {marketplaceCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`h-full cursor-pointer transition-all hover:shadow-lg hover:scale-105 bg-gradient-to-br ${category.gradient} ${category.border}`}
                onClick={() => navigate(category.path)}
              >
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-3">
                    <category.icon className="h-12 w-12 text-primary" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{category.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full group"
                    size="sm"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Explorar
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Status de desenvolvimento */}
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🚧</div>
              <div>
                <h3 className="font-semibold text-amber-700 dark:text-amber-300 mb-1">
                  Mais categorias em breve!
                </h3>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Estamos trabalhando para trazer mais opções como avatares exclusivos, 
                  efeitos especiais e muito mais.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}