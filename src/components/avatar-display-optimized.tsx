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

  // Lazy load avatar image
  useEffect(() => {
    const loadImage = async () => {
      const key = avatar.name.toLowerCase().replace(' ', '-');
      try {
        const loadedImage = await loadAvatarImage(key);
        if (loadedImage) {
          setAvatarImage(loadedImage);
        }
      } catch (error) {
        // Fallback to original URL
        setAvatarImage(avatar.image_url);
      }
    };

    loadImage();
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
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
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