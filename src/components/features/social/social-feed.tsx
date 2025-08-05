import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Textarea } from "@/components/shared/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/shared/ui/avatar";
import { Badge } from "@/components/shared/ui/badge";
import { ScrollArea } from "@/components/shared/ui/scroll-area";
import { Separator } from "@/components/shared/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Share2, Send, TrendingUp, Award, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";

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

export function SocialFeed() {
  const { t } = useI18n();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
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
            user_avatars!inner (
              avatars (
                name,
                image_url
              )
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

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
        
        const postsWithLikes = postsData.map(post => ({
          ...post,
          user_liked: likedPostIds.has(post.id)
        }));

        setPosts(postsWithLikes);
      } else {
        setPosts(postsData || []);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o feed",
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
        title: "Sucesso",
        description: "Post criado com sucesso!"
      });

      // Award challenge progress
      await supabase.functions.invoke('process-social-activity', {
        body: {
          userId: currentUserId,
          activityType: 'create_post'
        }
      });

    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o post",
        variant: "destructive"
      });
    } finally {
      setPosting(false);
    }
  };

  const handleLikePost = async (postId: string, isLiked: boolean) => {
    if (!currentUserId) return;

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: currentUserId
          });

        if (error) throw error;

        // Award challenge progress
        await supabase.functions.invoke('process-social-activity', {
          body: {
            userId: currentUserId,
            activityType: 'like_posts'
          }
        });
      }

      // Update local state immediately
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1,
                user_liked: !isLiked
              }
            : post
        )
      );

    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Erro",
        description: "Não foi possível curtir o post",
        variant: "destructive"
      });
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
        [postId]: commentsData || []
      }));
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = newComment[postId]?.trim();
    if (!content || !currentUserId) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: currentUserId,
          content: content
        });

      if (error) throw error;

      setNewComment(prev => ({
        ...prev,
        [postId]: ""
      }));

      loadComments(postId);

      // Award challenge progress
      await supabase.functions.invoke('process-social-activity', {
        body: {
          userId: currentUserId,
          activityType: 'comment_posts'
        }
      });

    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar comentário",
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-24 mb-1" />
                  <div className="h-3 bg-muted rounded w-16" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">


      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="space-y-3">
                <Award className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="font-semibold">{t('social.messages.beFirstToPost')}</h3>
                <p className="text-muted-foreground">
                  {t('social.shareOpinion')}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {/* Post Header */}
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.profiles?.user_avatars?.[0]?.avatars?.image_url || post.profiles?.profile_image_url} />
                    <AvatarFallback>
                      {post.profiles?.nickname.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{post.profiles?.nickname}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {t('common.level')} {post.profiles?.level || 1}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </p>
                  </div>
                  {post.profiles?.xp && (
                    <div className="flex items-center gap-1 text-orange-500">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-xs font-medium">{post.profiles.xp} XP</span>
                    </div>
                  )}
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="whitespace-pre-wrap">{post.content}</p>
                  {post.trade_data && (
                    <div className="mt-3 p-3 bg-muted rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="font-medium">{t('social.buttons.share')}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {/* Trade data visualization would go here */}
                        <span>Dados do trade: {JSON.stringify(post.trade_data)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-4 mb-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "gap-2 hover:bg-red-50 hover:text-red-600",
                      post.user_liked && "text-red-600 bg-red-50"
                    )}
                    onClick={() => handleLikePost(post.id, post.user_liked || false)}
                  >
                    <Heart className={cn("h-4 w-4", post.user_liked && "fill-current")} />
                    {post.likes_count}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => toggleComments(post.id)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    {post.comments_count}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-green-50 hover:text-green-600">
                    <Share2 className="h-4 w-4" />
                    {t('social.buttons.share')}
                  </Button>
                </div>

                {/* Comments Section */}
                {expandedPost === post.id && (
                  <>
                    <Separator className="mb-4" />
                    <div className="space-y-3">
                      {/* Add Comment */}
                      <div className="flex gap-2">
                        <Input
                          placeholder={t('social.chat.typeMessage')}
                          value={newComment[post.id] || ""}
                          onChange={(e) => setNewComment(prev => ({
                            ...prev,
                            [post.id]: e.target.value
                          }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(post.id)}
                          disabled={!newComment[post.id]?.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-3">
                        {comments[post.id]?.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={comment.profiles?.profile_image_url} />
                              <AvatarFallback>
                                {comment.profiles?.nickname.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-muted rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">
                                    {comment.profiles?.nickname}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(comment.created_at), {
                                      addSuffix: true,
                                      locale: ptBR
                                    })}
                                  </span>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

    </div>
  );
}
