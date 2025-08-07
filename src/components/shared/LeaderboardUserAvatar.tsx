import { memo } from 'react';
import { AvatarDisplayUniversal } from '@/components/shared/avatar-display-universal';
import { useUserAvatar } from '@/hooks/use-user-avatar';

interface LeaderboardUserAvatarProps {
  userId: string;
  nickname: string;
  profileImageUrl?: string;
  avatarName?: string;
  avatarUrl?: string;
  currentAvatarId?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

/**
 * Avatar component specifically for leaderboard entries
 * Uses the centralized avatar system for consistency
 */
export const LeaderboardUserAvatar = memo(({
  userId,
  nickname,
  profileImageUrl,
  avatarName,
  avatarUrl,
  currentAvatarId,
  size = "md",
  className
}: LeaderboardUserAvatarProps) => {
  // Try to get fresh avatar data first
  const { avatarData } = useUserAvatar({ userId, enabled: !!userId });

  // Create AvatarData object - use fresh data if available, otherwise fallback to props
  const finalAvatarData = {
    profile_image_url: profileImageUrl,
    current_avatar_id: currentAvatarId,
    avatars: avatarName && avatarUrl ? {
      name: avatarName,
      image_url: avatarUrl
    } : null
  };

  return (
    <AvatarDisplayUniversal
      avatarData={finalAvatarData}
      nickname={nickname}
      size={size}
      className={className}
    />
  );
});

LeaderboardUserAvatar.displayName = 'LeaderboardUserAvatar';