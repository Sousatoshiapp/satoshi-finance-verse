import { memo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/shared/ui/avatar";
import { resolveAvatarImage, type AvatarData } from "@/lib/avatar-utils";

// Import from centralized avatar images utility
import { avatarImages, getAvatarImage } from "@/utils/avatar-images";

interface AvatarDisplayUniversalProps {
  avatarName?: string;
  avatarUrl?: string;
  profileImageUrl?: string;
  nickname: string;
  className?: string;
  size?: "xs" | "xs-plus" | "sm" | "md" | "lg" | "xl";
  // New prop to accept normalized avatar data
  avatarData?: AvatarData;
  // Add onClick support
  onClick?: () => void;
}

const sizeClasses = {
  xs: "h-5 w-5",
  "xs-plus": "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10", 
  lg: "h-16 w-16",
  xl: "h-24 w-24"
};

export const AvatarDisplayUniversal = memo(({ 
  avatarName, 
  avatarUrl, 
  profileImageUrl, 
  nickname,
  className = "",
  size = "md",
  avatarData,
  onClick
}: AvatarDisplayUniversalProps) => {
  // Function to resolve avatar URLs to actual imported images
  const resolveAvatarUrl = (url: string): string => {
    // If it's already a full URL (starts with http/https), return as is
    if (url.startsWith('http')) {
      return url;
    }
    
    // If it's a /avatars/ path, convert to the actual imported image
    if (url.startsWith('/avatars/')) {
      // Use the centralized getAvatarImage function
      return getAvatarImage(url);
    }
    
    return url;
  };

  const getResolvedAvatar = () => {
    // If avatarData is provided, use the new resolution logic
    if (avatarData) {
      const resolved = resolveAvatarImage(avatarData, nickname);
      return {
        ...resolved,
        imageUrl: resolveAvatarUrl(resolved.imageUrl)
      };
    }

    // Legacy support for existing props - PRIORITIZE profile_image_url first!
    const legacyData: AvatarData = {
      profile_image_url: profileImageUrl,
      current_avatar_id: null,
      avatars: avatarName ? {
        name: avatarName,
        image_url: avatarUrl || ''
      } : undefined
    };

    const resolved = resolveAvatarImage(legacyData, nickname);
    return {
      ...resolved,
      imageUrl: resolveAvatarUrl(resolved.imageUrl)
    };
  };

  const resolved = getResolvedAvatar();

  return (
    <Avatar 
      className={`${sizeClasses[size]} ${className} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={onClick}
    >
      <AvatarImage 
        src={resolved.imageUrl} 
        alt={nickname}
        onError={(e) => {
          // UNIVERSAL fallback - sempre o mesmo avatar para todos
          e.currentTarget.src = avatarImages['the-satoshi'];
        }}
      />
      <AvatarFallback>
        {resolved.fallbackText}
      </AvatarFallback>
    </Avatar>
  );
});

AvatarDisplayUniversal.displayName = 'AvatarDisplayUniversal';
