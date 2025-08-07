// Avatar utility functions
export interface AvatarData {
  profile_image_url?: string | null;
  current_avatar_id?: string | null;
  avatars?: {
    name: string;
    image_url: string;
  } | null;
}

export interface ResolvedAvatar {
  imageUrl: string;
  fallbackText: string;
  source: 'profile' | 'avatar' | 'default';
}

/**
 * Standardized query fragment for avatar data
 * Use this in all Supabase queries that need avatar information
 */
export const AVATAR_QUERY_FRAGMENT = `
  profile_image_url,
  current_avatar_id,
  avatars!current_avatar_id (
    name,
    image_url
  )
`;

/**
 * Resolves avatar image URL with proper fallback logic
 * Priority: profile_image_url -> avatars.image_url -> default
 */
export function resolveAvatarImage(data: AvatarData, nickname: string = 'U'): ResolvedAvatar {
  const fallbackText = nickname.charAt(0).toUpperCase();
  
  // Priority 1: User uploaded profile image
  if (data.profile_image_url) {
    return {
      imageUrl: data.profile_image_url,
      fallbackText,
      source: 'profile'
    };
  }
  
  // Priority 2: Selected game avatar
  if (data.avatars?.image_url) {
    return {
      imageUrl: data.avatars.image_url,
      fallbackText,
      source: 'avatar'
    };
  }
  
  // Priority 3: UNIVERSAL DEFAULT - sempre usar o mesmo avatar para todos os usuários sem current_avatar_id
  // Usando 'the-satoshi' como padrão universal
  return {
    imageUrl: '/avatars/the-satoshi.jpg',
    fallbackText,
    source: 'default'
  };
}

/**
 * Builds the complete query fragment for profiles with avatar data
 */
export function buildProfileWithAvatarQuery(additionalFields: string[] = []): string {
  const baseFields = [
    'id',
    'nickname',
    'level',
    'xp',
    AVATAR_QUERY_FRAGMENT
  ];
  
  const allFields = [...baseFields, ...additionalFields];
  return allFields.join(', ');
}

/**
 * Helper to ensure avatar data is properly structured after query
 */
export function normalizeAvatarData(rawData: any): AvatarData {
  return {
    profile_image_url: rawData?.profile_image_url || null,
    current_avatar_id: rawData?.current_avatar_id || null,
    avatars: rawData?.avatars || rawData?.avatar || null
  };
}