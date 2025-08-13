import { useState } from "react";
import { Button } from "@/components/shared/ui/button";
import { Textarea } from "@/components/shared/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { normalizeAvatarData } from "@/lib/avatar-utils";

interface User {
  id: string;
  nickname: string;
  profile_image_url?: string | null;
  level?: number;
  current_avatar_id?: string | null;
  avatar?: {
    id: string;
    name: string;
    image_url: string;
  } | null;
  avatars?: {
    name: string;
    image_url: string;
  } | null;
}

interface CreatePostCardProps {
  variant: 'desktop' | 'mobile';
  currentUser?: User | null;
  currentUserId?: string | null;
  onPostCreated?: () => void;
}

export function CreatePostCard({ 
  variant, 
  currentUser, 
  currentUserId,
  onPostCreated 
}: CreatePostCardProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);

  const handleCreatePost = async () => {
    if (!newPost.trim() || posting || !currentUserId) return;

    setPosting(true);
    try {
      const { error } = await supabase
        .from('social_posts')
        .insert({
          user_id: currentUserId,
          content: newPost.trim(),
          post_type: 'text'
        });

      if (error) throw error;

      setNewPost("");
      toast({
        title: t('common.success'),
        description: t('social.messages.postCreated')
      });

      // Award challenge progress
      await supabase.functions.invoke('process-social-activity', {
        body: {
          userId: currentUserId,
          activityType: 'create_post'
        }
      });

      // Notify parent component
      onPostCreated?.();

    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: t('common.error'),
        description: t('social.messages.errorPost'),
        variant: "destructive"
      });
    } finally {
      setPosting(false);
    }
  };

  const isDesktop = variant === 'desktop';
  const textareaSize = isDesktop ? 'text-xl placeholder:text-xl' : 'text-lg placeholder:text-lg';
  const minHeight = isDesktop ? 'min-h-[80px]' : 'min-h-[80px]';
  const buttonSize = isDesktop ? undefined : 'default';
  const avatarSize = isDesktop ? 'lg' : 'lg';

  return (
    <div className="border-b border-border/50 lg:p-3 p-4">
      <div className="lg:flex lg:space-x-3 space-y-4 lg:space-y-0">
        {currentUser && (
          <AvatarDisplayUniversal
            avatarData={normalizeAvatarData(currentUser)}
            nickname={currentUser.nickname}
            size={avatarSize}
          />
        )}
        <div className="flex-1">
          <Textarea
            placeholder={t('social.placeholders.shareOpinion')}
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className={`${minHeight} resize-none border-none shadow-none ${textareaSize} focus-visible:ring-0`}
            maxLength={500}
            rows={isDesktop ? 3 : 4}
          />
          <div className={`flex items-center justify-between ${isDesktop ? 'mt-3' : 'mt-4'}`}>
            <span className={`${isDesktop ? 'text-sm' : 'text-sm'} text-muted-foreground font-medium`}>
              {newPost.length}/500
            </span>
            <Button 
              onClick={handleCreatePost}
              disabled={!newPost.trim() || posting}
              size={buttonSize}
              className={`rounded-full px-6 ${!isDesktop ? 'h-11 min-w-[120px] text-base font-medium' : ''}`}
            >
              {posting ? t('social.buttons.publishing') : t('social.buttons.publish')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}