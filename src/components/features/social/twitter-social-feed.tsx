import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Textarea } from "@/components/shared/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/shared/ui/avatar";
import { Badge } from "@/components/shared/ui/badge";
import { Separator } from "@/components/shared/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { SocialButton } from "@/components/features/social/social-button";
import { formatDistanceToNow } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import { useNavigate } from "react-router-dom";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { normalizeAvatarData } from "@/lib/avatar-utils";
import { ProfileStyleLoader } from "@/components/shared/ui/profile-style-loader";

interface SocialPost {
  id: string;
  content: string;
  post_type: string;
  media_url?: string;
  trade_data?: any;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  profiles: {
    id: string;
    nickname: string;
    profile_image_url?: string;
    current_avatar_id?: string | null;
    level?: number;
    xp?: number;
    avatars?: {
      name: string;
      image_url: string;
    };
  };
  user_liked?: boolean;
  is_following?: boolean;
}

interface PostComment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    nickname: string;
    profile_image_url?: string;
    current_avatar_id?: string | null;
    avatars?: {
      name: string;
      image_url: string;
    };
  };
}

export function TwitterSocialFeed() {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, PostComment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadPosts();
      const cleanup = setupRealtimeSubscription();
      return cleanup;
    }
  }, [currentUserId]);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setCurrentUserId(profile.id);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadPosts = async () => {
    if (!currentUserId) return;
    try {
      // First, get posts from users that current user follows
      const { data: followingData } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', currentUserId);

      const followingIds = followingData?.map(f => f.following_id) || [];

      // Get all posts but prioritize followed users
      const { data: postsData, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          profiles:user_id (
            id,
            nickname,
            profile_image_url,
            level,
            xp,
            current_avatar_id,
            avatars!current_avatar_id (
              name, 
              image_url
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Check which posts current user has liked
      if (currentUserId && postsData) {
        const postIds = postsData.map(p => p.id);
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', currentUserId)
          .in('post_id', postIds);

        const likedPostIds = new Set(likes?.map(l => l.post_id) || []);
        
        // Sort posts: followed users first, then others
        const postsWithLikes = postsData
          .map(post => ({
            ...post,
            user_liked: likedPostIds.has(post.id),
            is_following: followingIds.includes(post.user_id)
          }))
          .sort((a, b) => {
            // Prioritize posts from followed users
            if (a.is_following && !b.is_following) return -1;
            if (!a.is_following && b.is_following) return 1;
            // Then sort by date
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }) as unknown as SocialPost[];

        setPosts(postsWithLikes);
      } else {
        setPosts((postsData || []) as unknown as SocialPost[]);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: t('common.error'),
        description: t('social.messages.errorPost'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('social-feed-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_posts'
        },
        () => {
          loadPosts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes'
        },
        () => {
          loadPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleLikePost = async (postId: string, isLiked: boolean) => {
    if (!currentUserId) return;

    try {
      if (isLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId);
      } else {
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: currentUserId
          });
      }

      // Update local state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            user_liked: !isLiked,
            likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1
          };
        }
        return post;
      }));

    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const { data: commentsData, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          profiles:user_id (
            nickname,
            profile_image_url,
            current_avatar_id,
            avatars!current_avatar_id (
              name,
              image_url
            )
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setComments(prev => ({
        ...prev,
        [postId]: commentsData as unknown as PostComment[]
      }));
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    const commentText = newComment[postId];
    if (!commentText?.trim() || !currentUserId) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: currentUserId,
          content: commentText.trim()
        });

      if (error) throw error;

      setNewComment(prev => ({ ...prev, [postId]: "" }));
      setExpandedPost(null);
      loadComments(postId);

      // Award challenge progress
      await supabase.functions.invoke('process-social-activity', {
        body: {
          userId: currentUserId,
          activityType: 'create_comment'
        }
      });

    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: t('common.error'),
        description: t('social.messages.errorComment'),
        variant: "destructive"
      });
    }
  };

  const toggleComments = (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      if (!comments[postId]) {
        loadComments(postId);
      }
    }
  };

  const getDateLocale = () => {
    switch (language) {
      case 'pt-BR':
        return ptBR;
      default:
        return enUS;
    }
  };

  const formatPostDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return t('social.stats.now');
    }

    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: getDateLocale() 
    });
  };

  const handleUserClick = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  if (loading) {
    return <ProfileStyleLoader size="lg" />;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MessageCircle className="mx-auto h-16 w-16 mb-6 opacity-30" />
        <h3 className="text-xl font-medium mb-2">{t('social.messages.emptyFeed')}</h3>
        <p className="text-sm mb-4">
          {t('social.messages.emptyFeedDescription')}
        </p>
        <p className="text-xs opacity-75">
          {t('social.messages.followUsersToSeeContent')}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/50">
      {posts.map((post) => (
        <article 
          key={post.id} 
          data-post-id={post.id}
          className="lg:p-2 p-4 hover:bg-muted/30 transition-colors duration-200"
        >
          <div className="flex lg:space-x-1.5 space-x-3">
            {/* Avatar */}
            <AvatarDisplayUniversal
              avatarData={normalizeAvatarData(post.profiles)}
              nickname={post.profiles.nickname}
              size="md"
              className="lg:w-6 lg:h-6"
              onClick={() => handleUserClick(post.profiles.id)}
            />

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center lg:space-x-1.5 space-x-3 mb-2">
                <span 
                  className="font-bold hover:underline cursor-pointer lg:text-[9px] text-sm"
                  onClick={() => handleUserClick(post.profiles.id)}
                >
                  @{post.profiles.nickname}
                </span>
                <Badge variant="secondary" className="lg:text-[8px] text-xs lg:px-1.5 px-2 lg:py-0.5 py-1">
                  Nv.{post.profiles.level}
                </Badge>
                {post.is_following && (
                  <Badge variant="outline" className="lg:text-[8px] text-xs lg:px-1.5 px-2 lg:py-0.5 py-1">
                    Seguindo
                  </Badge>
                )}
                <span className="lg:text-[9px] text-xs text-muted-foreground">·</span>
                <span className="lg:text-[9px] text-xs text-muted-foreground">
                  {formatPostDate(post.created_at)}
                </span>
                <Button variant="ghost" size="sm" className="ml-auto lg:p-1 p-2 h-auto">
                  <MoreHorizontal className="lg:h-3 lg:w-3 h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="lg:mb-1.5 mb-3">
                <p className="lg:text-[10px] text-sm lg:leading-[13px] leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
                
                {post.trade_data && (
                  <Card className="mt-2 border-l-2 border-l-primary">
                    <CardContent className="p-2">
                      <div className="flex items-center space-x-1.5 text-[9px]">
                        <Badge variant="outline">Trade</Badge>
                        <span className="text-muted-foreground">
                          {post.trade_data.symbol} - {post.trade_data.action}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center lg:space-x-1 space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:bg-muted/50 hover:text-primary lg:p-1 p-2 lg:h-auto h-11 transition-colors duration-150 min-w-[44px]"
                  onClick={() => toggleComments(post.id)}
                >
                  <MessageCircle className="lg:h-4 lg:w-4 h-5 w-5 lg:mr-1 mr-2" />
                  <span className="lg:text-[10px] text-sm">{post.comments_count}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-muted-foreground hover:bg-muted/50 hover:text-red-500 lg:p-1 p-2 lg:h-auto h-11 transition-colors duration-150 min-w-[44px]",
                    post.user_liked && "text-red-500"
                  )}
                  onClick={() => handleLikePost(post.id, !!post.user_liked)}
                >
                  <Heart className={cn("lg:h-4 lg:w-4 h-5 w-5 lg:mr-1 mr-2", post.user_liked && "fill-current")} />
                  <span className="lg:text-[10px] text-sm">{post.likes_count}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:bg-muted/50 hover:text-primary lg:p-1 p-2 lg:h-auto h-11 transition-colors duration-150 min-w-[44px]"
                >
                  <Share2 className="lg:h-4 lg:w-4 h-5 w-5" />
                </Button>

                {/* Follow Button - only show if not following */}
                {!post.is_following && post.user_id !== currentUserId && (
                  <SocialButton
                    targetType="profile"
                    targetId={post.user_id}
                    targetUserId={post.user_id}
                    targetUserNickname={post.profiles.nickname}
                    actionType="follow"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:bg-muted/50 hover:text-primary lg:p-1 p-2 lg:h-auto h-11 transition-colors duration-150 min-w-[44px]"
                    showCount={false}
                  />
                )}
              </div>

              {/* Comments Section */}
              {expandedPost === post.id && (
                <div className="mt-2 space-y-1">
                  <Separator />
                  
                  {/* Add Comment */}
                  <div className="flex items-start space-x-2 p-2 bg-muted/30 rounded-lg">
                    <AvatarDisplayUniversal
                      avatarData={{ profile_image_url: null, current_avatar_id: null, avatars: null }}
                      nickname="U"
                      size="xs-plus"
                    />
                    <div className="flex-1 flex items-center space-x-1.5">
                      <input
                        type="text"
                        placeholder={t('social.placeholders.addComment')}
                        value={newComment[post.id] || ""}
                        onChange={(e) => setNewComment(prev => ({ 
                          ...prev, 
                          [post.id]: e.target.value 
                        }))}
                        className="flex-1 bg-transparent border-0 outline-none text-[10px] placeholder:text-muted-foreground"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newComment[post.id]?.trim()) {
                            handleAddComment(post.id);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(post.id)}
                        disabled={!newComment[post.id]?.trim()}
                        variant="ghost"
                        className="text-primary hover:text-primary/80 text-[10px] p-1"
                      >
                        {t('social.buttons.comment')}
                      </Button>
                    </div>
                  </div>

                  {/* Comments List */}
                  {comments[post.id] && comments[post.id].map((comment) => (
                    <div key={comment.id} className="flex space-x-1.5">
                      <AvatarDisplayUniversal
                        avatarData={normalizeAvatarData(comment.profiles)}
                        nickname={comment.profiles.nickname}
                        size="xs-plus"
                      />
                      <div className="flex-1">
                        <div className="bg-muted/50 rounded-lg p-2">
                          <div className="font-medium text-[8px] mb-1">
                            @{comment.profiles.nickname}
                          </div>
                          <p className="text-[10px]">{comment.content}</p>
                        </div>
                        <div className="text-[8px] text-muted-foreground mt-1 px-2">
                          {formatPostDate(comment.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
