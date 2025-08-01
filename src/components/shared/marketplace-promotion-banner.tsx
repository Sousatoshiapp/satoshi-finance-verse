import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { BeetzIcon } from "@/components/shared/ui/beetz-icon";
import { X, ShoppingBag, Sparkles, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  originalPrice: number;
  salePrice: number;
  imageUrl: string;
  validUntil: string;
  category: string;
}

export function MarketplacePromotionBanner() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(null);

  useEffect(() => {
    // Check if user should see banner (once per session)
    const hasSeenBanner = sessionStorage.getItem('marketplace_banner_seen');
    
    if (!hasSeenBanner) {
      loadPromotion();
      setIsVisible(true);
      sessionStorage.setItem('marketplace_banner_seen', 'true');
    }
  }, []);

  const loadPromotion = async () => {
    try {
      // Mock promotion data - replace with actual API call
      const mockPromotion: Promotion = {
        id: '1',
        title: 'Super Oferta: Avatar Lendário',
        description: 'O Avatar mais épico da cidade por tempo limitado!',
        discount: 50,
        originalPrice: 2000,
        salePrice: 1000,
        imageUrl: '/placeholder-avatar.jpg',
        validUntil: '2025-01-15T23:59:59Z',
        category: 'avatar'
      };

      setCurrentPromotion(mockPromotion);
    } catch (error) {
      console.error('Error loading promotion:', error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handlePromotionClick = () => {
    if (currentPromotion) {
      navigate(`/store?category=${currentPromotion.category}&promotion=${currentPromotion.id}`);
      setIsVisible(false);
    }
  };

  const getTimeLeft = () => {
    if (!currentPromotion?.validUntil) return '';
    
    const now = new Date();
    const end = new Date(currentPromotion.validUntil);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirado';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (!isVisible || !currentPromotion) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
      <Card className="border-2 border-gradient-primary bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute top-2 right-2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* Promotion Image */}
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-2xl">
              🎁
            </div>
            
            {/* Promotion Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-red-500 text-white">
                  -{currentPromotion.discount}% OFF
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {getTimeLeft()}
                </div>
              </div>
              
              <h3 className="font-bold text-sm mb-1 text-foreground">
                {currentPromotion.title}
              </h3>
              
              <p className="text-xs text-muted-foreground mb-2">
                {currentPromotion.description}
              </p>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg font-bold text-green-500 flex items-center gap-1">
                  {currentPromotion.salePrice} <BeetzIcon size="sm" />
                </span>
                <span className="text-sm text-muted-foreground line-through flex items-center gap-1">
                  {currentPromotion.originalPrice} <BeetzIcon size="xs" />
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handlePromotionClick}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 flex-1"
                >
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  Comprar Agora
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/store')}
                  className="border-purple-500/30 text-purple-500 hover:bg-purple-500/10"
                >
                  <Sparkles className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
