import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { memo, useMemo, useState, useEffect } from "react";
import { loadAvatarImage } from "@/utils/lazy-imports";

interface Avatar {
  id: string;
  name: string;
  description: string;
  image_url: string;
  avatar_class: string;
  district_theme: string;
  rarity: string;
  evolution_level?: number;
}

interface AvatarDisplayProps {
  avatar: Avatar;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  evolutionLevel?: number;
}

const rarityColors = {
  common: 'bg-gray-500',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-gradient-to-r from-yellow-400 to-orange-500',
};

const AvatarDisplayOptimized = memo(function AvatarDisplayOptimized({ 
  avatar, 
  size = 'md', 
  showBadge = true, 
  evolutionLevel = 1 
}: AvatarDisplayProps) {
  const [avatarImage, setAvatarImage] = useState<string>(avatar.image_url);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Memoize the avatar loading logic
  useEffect(() => {
    // Reset states when avatar changes
    setImageLoaded(false);
    setImageError(false);
    
    // Start with the original URL immediately for faster loading
    setAvatarImage(avatar.image_url);
    
    // Only try lazy loading if it's a local asset reference
    if (avatar.image_url.startsWith('/assets/') || avatar.image_url.includes('avatars/')) {
      const loadImage = async () => {
        const key = avatar.name.toLowerCase().replace(/\s+/g, '-');
        try {
          const loadedImage = await loadAvatarImage(key);
          if (loadedImage && loadedImage !== avatar.image_url) {
            setAvatarImage(loadedImage);
          }
        } catch (error) {
          // Keep using the original URL
          console.debug('Lazy loading failed for avatar:', key, error);
        }
      };

      loadImage();
    }
  }, [avatar.name, avatar.image_url]);

  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm': return 'w-12 h-12';
      case 'lg': return 'w-24 h-24';
      case 'xl': return 'w-48 h-48';
      default: return 'w-16 h-16';
    }
  }, [size]);

  const rarityColor = useMemo(() => {
    return rarityColors[avatar.rarity as keyof typeof rarityColors] || rarityColors.common;
  }, [avatar.rarity]);

  return (
    <div className="relative">
      <div className={`${sizeClasses} rounded-full overflow-hidden border-2 border-primary/50 shadow-lg`}>
        <img 
          src={avatarImage}
          alt={avatar.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(false);
            // Fallback to a default avatar or simple color background
            if (avatarImage !== '/placeholder-avatar.png') {
              setAvatarImage('/placeholder-avatar.png');
            }
          }}
        />
        {(!imageLoaded || imageError) && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse flex items-center justify-center">
            <span className="text-xl font-bold text-primary">
              {avatar.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      
      {showBadge && (
        <div className="absolute -top-1 -right-1">
          <Badge className={`${rarityColor} text-white flex items-center gap-1 text-xs px-1`}>
            <Sparkles className="h-3 w-3" />
            {evolutionLevel}
          </Badge>
        </div>
      )}
      
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-30 -z-10 animate-pulse"
        style={{
          boxShadow: `0 0 20px var(--primary)`,
        }}
      />
    </div>
  );
});

export { AvatarDisplayOptimized };