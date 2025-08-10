import { useState, useEffect } from "react";
import { Button } from "@/components/shared/ui/button";
import { Heart, UserPlus, UserMinus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { globalRateLimiter } from "@/lib/validation";
import { SecurityLogger } from "@/lib/security-logger";

interface SocialButtonProps {
  targetType: 'profile' | 'portfolio';
  targetId: string;
  targetUserId?: string;
  targetUserNickname?: string;
  actionType: 'like' | 'follow';
  size?: 'sm' | 'lg' | 'default';
  variant?: 'default' | 'ghost' | 'outline';
  showCount?: boolean;
  className?: string;
}

export function SocialButton({
  targetType,
  targetId,
  targetUserId,
  targetUserNickname,
  actionType,
  size = 'sm',
  variant = 'ghost',
  showCount = false,
  className
}: SocialButtonProps) {
  const [isActive, setIsActive] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkStatus();
    loadCount();
  }, [targetId, actionType]);

  const checkStatus = async () => {
    try {
      console.log('🔍 SocialButton checkStatus called:', { actionType, targetType, targetId, targetUserId });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No authenticated user found');
        return;
      }

      console.log('👤 Authenticated user:', user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        console.log('❌ No profile found for user');
        return;
      }

      console.log('👤 User profile ID:', profile.id);

      if (actionType === 'like') {
        console.log('💝 Checking like status...');
        const { data, error } = await supabase
          .from('user_likes')
          .select('id')
          .eq('user_id', profile.id)
          .eq('target_type', targetType)
          .eq('target_id', targetId)
          .maybeSingle();

        if (error) {
          console.error('❌ Error checking like status:', error);
          return;
        }

        console.log('💝 Like status result:', !!data);
        setIsActive(!!data);
      } else if (actionType === 'follow' && targetUserId) {
        console.log('👥 Checking follow status...', { follower_id: profile.id, following_id: targetUserId });
        
        const { data, error } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', profile.id)
          .eq('following_id', targetUserId)
          .maybeSingle();

        if (error) {
          console.error('❌ Error checking follow status:', error);
          return;
        }

        const isFollowing = !!data;
        console.log('👥 Follow status result:', isFollowing);
        setIsActive(isFollowing);
      } else {
        console.log('⚠️ Missing targetUserId for follow action');
      }
    } catch (error) {
      console.error('❌ Error in checkStatus:', error);
      // Retry once after a delay
      setTimeout(() => {
        console.log('🔄 Retrying checkStatus...');
        checkStatus();
      }, 1000);
    }
  };

  const loadCount = async () => {
    if (!showCount) return;

    try {
      if (actionType === 'like') {
        const { count } = await supabase
          .from('user_likes')
          .select('*', { count: 'exact', head: true })
          .eq('target_type', targetType)
          .eq('target_id', targetId);

        setCount(count || 0);
      } else if (actionType === 'follow' && targetUserId) {
        const { count } = await supabase
          .from('user_follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', targetUserId);

        setCount(count || 0);
      }
    } catch (error) {
      console.error('Error loading count:', error);
    }
  };

  const handleAction = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Login necessário",
          description: "Faça login para interagir com outros usuários",
          variant: "destructive"
        });
        return;
      }

      // Rate limiting
      const rateLimitKey = `${actionType}_${targetType}`;
      if (!globalRateLimiter.canPerformAction(user.id, rateLimitKey, 30)) {
        toast({
          title: "Muitas ações",
          description: "Aguarde um momento antes de tentar novamente",
          variant: "destructive"
        });
        return;
      }

      // Validate target
      if (!targetId || (actionType === 'follow' && !targetUserId)) {
        toast({
          title: "Erro",
          description: "Dados de destino inválidos",
          variant: "destructive"
        });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      if (actionType === 'like') {
        if (isActive) {
          // Unlike
          await supabase
            .from('user_likes')
            .delete()
            .eq('user_id', profile.id)
            .eq('target_type', targetType)
            .eq('target_id', targetId);
        } else {
          // Like
          await supabase
            .from('user_likes')
            .insert({
              user_id: profile.id,
              target_type: targetType,
              target_id: targetId
            });

          // Create activity
          await supabase
            .from('activity_feed')
            .insert({
              user_id: profile.id,
              activity_type: 'like',
              activity_data: {
                target_type: targetType,
                target_id: targetId
              },
              target_user_id: targetUserId
            });
        }
      } else if (actionType === 'follow' && targetUserId) {
        if (isActive) {
          // Unfollow
          await supabase
            .from('user_follows')
            .delete()
            .eq('follower_id', profile.id)
            .eq('following_id', targetUserId);
        } else {
          // Follow
          await supabase
            .from('user_follows')
            .insert({
              follower_id: profile.id,
              following_id: targetUserId
            });

          // Create activity
          await supabase
            .from('activity_feed')
            .insert({
              user_id: profile.id,
              activity_type: 'follow',
              target_user_id: targetUserId
            });
        }
      }

      setIsActive(!isActive);
      setCount(prev => isActive ? prev - 1 : prev + 1);

      // Security logging
      await SecurityLogger.logSocialAction(
        isActive ? `un${actionType}` : actionType, 
        targetId, 
        targetType
      );

      toast({
        title: isActive ? "Removido" : "Adicionado",
        description: isActive 
          ? `${actionType === 'like' ? 'Curtida removida' : targetUserNickname ? `Você deixou de seguir @${targetUserNickname}` : 'Deixou de seguir'}`
          : `${actionType === 'like' ? 'Curtido!' : targetUserNickname ? `Você começou a seguir @${targetUserNickname}` : 'Seguindo!'}`,
      });

    } catch (error) {
      console.error('Error handling action:', error);
      toast({
        title: "Erro",
        description: "Não foi possível completar a ação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    if (actionType === 'like') {
      return <Heart className={cn("h-4 w-4", isActive && "fill-current text-red-500")} />;
    } else {
      return isActive ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    if (actionType === 'like') {
      return showCount ? count : '';
    } else {
      return isActive ? 'Seguindo' : 'Seguir';
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleAction}
      disabled={loading}
      className={cn(
        "flex items-center gap-1",
        isActive && actionType === 'like' && "text-red-500",
        isActive && actionType === 'follow' && "bg-muted",
        className
      )}
    >
      {getIcon()}
      {getLabel() && <span className="text-xs">{getLabel()}</span>}
    </Button>
  );
}
