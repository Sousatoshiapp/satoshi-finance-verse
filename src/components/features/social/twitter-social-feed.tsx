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
import { formatDistanceToNow } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import { useNavigate } from "react-router-dom";

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
    level?: number;
    xp?: number;
    user_avatars?: {
      avatars: {
        name: string;
        image_url: string;
      };
    }[];
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
            avatars:current_avatar_id (
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
            profile_image_url
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
      loadComments(postId);

      toast({
        title: t('common.success'),
        description: t('social.messages.commentAdded')
      });

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
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border-b border-border/50 p-4 animate-pulse">
            <div className="flex space-x-3">
              <div className="w-12 h-12 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-32" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">{t('common.beFirstToPost')}</p>
        <p className="text-sm mt-2">Comece seguindo outros usuários para ver posts no seu feed</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/50">
      {posts.map((post) => (
        <article key={post.id} className="p-4 hover:bg-muted/30 transition-colors">
          <div className="flex space-x-3">
            {/* Avatar */}
            <Avatar 
              className="w-12 h-12 cursor-pointer hover:opacity-80"
              onClick={() => handleUserClick(post.profiles.id)}
            >
              <AvatarImage 
                src={post.profiles.user_avatars?.[0]?.avatars?.image_url || post.profiles.profile_image_url} 
                alt={post.profiles.nickname} 
              />
              <AvatarFallback>
                {post.profiles.nickname.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center space-x-2 mb-1">
                <span 
                  className="font-bold hover:underline cursor-pointer"
                  onClick={() => handleUserClick(post.profiles.id)}
                >
                  {post.profiles.nickname}
                </span>
                <Badge variant="secondary" className="text-xs">
                  Nv.{post.profiles.level}
                </Badge>
                {post.is_following && (
                  <Badge variant="outline" className="text-xs">
                    Seguindo
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">
                  {formatPostDate(post.created_at)}
                </span>
                <Button variant="ghost" size="sm" className="ml-auto p-1 h-auto">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="mb-3">
                <p className="text-base leading-normal whitespace-pre-wrap">
                  {post.content}
                </p>
                
                {post.trade_data && (
                  <Card className="mt-3 border-l-4 border-l-primary">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2 text-sm">
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
              <div className="flex items-center justify-between max-w-md">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary p-2 h-auto"
                  onClick={() => toggleComments(post.id)}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  <span className="text-sm">{post.comments_count}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-muted-foreground hover:text-red-500 p-2 h-auto",
                    post.user_liked && "text-red-500"
                  )}
                  onClick={() => handleLikePost(post.id, !!post.user_liked)}
                >
                  <Heart className={cn("h-5 w-5 mr-2", post.user_liked && "fill-current")} />
                  <span className="text-sm">{post.likes_count}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary p-2 h-auto"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Comments Section */}
              {expandedPost === post.id && (
                <div className="mt-4 space-y-3">
                  <Separator />
                  
                  {/* Add Comment */}
                  <div className="flex space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex space-x-2">
                      <Textarea
                        placeholder={t('social.placeholders.addComment')}
                        value={newComment[post.id] || ""}
                        onChange={(e) => setNewComment(prev => ({ 
                          ...prev, 
                          [post.id]: e.target.value 
                        }))}
                        className="resize-none text-sm border-0 shadow-none focus-visible:ring-1"
                        rows={1}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(post.id)}
                        disabled={!newComment[post.id]?.trim()}
                      >
                        {t('social.buttons.comment')}
                      </Button>
                    </div>
                  </div>

                  {/* Comments List */}
                  {comments[post.id] && comments[post.id].map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.profiles.profile_image_url} />
                        <AvatarFallback className="text-xs">
                          {comment.profiles.nickname.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-muted rounded-lg p-3">
                          <div className="font-medium text-sm mb-1">
                            {comment.profiles.nickname}
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 px-3">
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