import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { AdminAuthProtection } from "@/components/admin-auth-protection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { Search, Eye, MessageSquare, Heart, Trash2, Flag, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SocialPost {
  id: string;
  content: string;
  post_type: string;
  media_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  is_flagged?: boolean;
  is_approved?: boolean;
  profiles: {
    nickname: string;
    profile_image_url?: string;
    level?: number;
  };
}

export default function AdminSocialPosts() {
  const { t } = useI18n();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<'all' | 'flagged' | 'pending'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadPosts();
  }, [filter, searchTerm]);

  const loadPosts = async () => {
    try {
      let query = supabase
        .from('social_posts')
        .select(`
          *,
          profiles:user_id (
            nickname,
            profile_image_url,
            level
          )
        `)
        .order('created_at', { ascending: false });

      if (filter === 'flagged') {
        query = query.eq('is_flagged', true);
      } else if (filter === 'pending') {
        query = query.is('is_approved', null);
      }

      if (searchTerm) {
        query = query.ilike('content', `%${searchTerm}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('social_posts')
        .update({ is_approved: true, is_flagged: false })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Post aprovado com sucesso"
      });
      
      loadPosts();
    } catch (error) {
      console.error('Error approving post:', error);
      toast({
        title: t('errors.error'),
        description: t('errors.errorApprovingPost'),
        variant: "destructive"
      });
    }
  };

  const handleRejectPost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('social_posts')
        .update({ is_approved: false, is_flagged: true })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Post rejeitado"
      });
      
      loadPosts();
    } catch (error) {
      console.error('Error rejecting post:', error);
      toast({
        title: t('errors.error'),
        description: t('errors.errorRejectingPost'),
        variant: "destructive"
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Tem certeza que deseja deletar este post?')) return;

    try {
      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Post deletado com sucesso"
      });
      
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: t('errors.error'),
        description: t('errors.errorDeletingPost'),
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (post: SocialPost) => {
    if (post.is_flagged) {
      return <Badge variant="destructive">Reportado</Badge>;
    }
    if (post.is_approved === null) {
      return <Badge variant="secondary">Pendente</Badge>;
    }
    if (post.is_approved) {
      return <Badge variant="default">Aprovado</Badge>;
    }
    return <Badge variant="destructive">Rejeitado</Badge>;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-32 mb-1" />
                    <div className="h-3 bg-muted rounded w-24" />
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
      </div>
    );
  }

  return (
    <AdminAuthProtection>
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Gerenciar Posts Sociais
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  size="sm"
                >
                  Todos
                </Button>
                <Button
                  variant={filter === 'flagged' ? 'default' : 'outline'}
                  onClick={() => setFilter('flagged')}
                  size="sm"
                >
                  Reportados
                </Button>
                <Button
                  variant={filter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setFilter('pending')}
                  size="sm"
                >
                  Pendentes
                </Button>
              </div>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-semibold mb-2">Nenhum post encontrado</h3>
                  <p className="text-muted-foreground">
                    Não há posts que correspondam aos filtros selecionados.
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      {/* Post Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={post.profiles?.profile_image_url} />
                            <AvatarFallback>
                              {post.profiles?.nickname.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{post.profiles?.nickname}</h4>
                              <Badge variant="secondary" className="text-xs">
                                Nível {post.profiles?.level || 1}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(post.created_at), {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(post)}
                      </div>

                      {/* Post Content */}
                      <div className="mb-4">
                        <p className="whitespace-pre-wrap text-sm">{post.content}</p>
                        {post.media_url && (
                          <div className="mt-3">
                            <img
                              src={post.media_url}
                              alt="Post media"
                              className="max-w-full h-auto rounded-lg border"
                            />
                          </div>
                        )}
                      </div>

                      {/* Post Stats */}
                      <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likes_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {post.comments_count}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprovePost(post.id)}
                          disabled={post.is_approved === true}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectPost(post.id)}
                          disabled={post.is_approved === false}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Deletar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminAuthProtection>
  );
}
