import { memo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/shared/ui/avatar";
import { resolveAvatarImage, type AvatarData } from "@/lib/avatar-utils";

interface AvatarDisplayUniversalProps {
  avatarName?: string;
  avatarUrl?: string;
  profileImageUrl?: string;
  nickname: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  // New prop to accept normalized avatar data
  avatarData?: AvatarData;
  // Add onClick support
  onClick?: () => void;
}

const sizeClasses = {
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
  const getResolvedAvatar = () => {
    // If avatarData is provided, use the new resolution logic
    if (avatarData) {
      return resolveAvatarImage(avatarData, nickname);
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

    return resolveAvatarImage(legacyData, nickname);
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
          console.log('Avatar image failed to load:', e.currentTarget.src);
          e.currentTarget.src = '/avatars/default-avatar.jpg';
        }}
      />
      <AvatarFallback>
        {resolved.fallbackText}
      </AvatarFallback>
    </Avatar>
  );
});

AvatarDisplayUniversal.displayName = 'AvatarDisplayUniversal';
