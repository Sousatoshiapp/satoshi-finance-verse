import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { Button } from "@/components/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { Badge } from "@/components/shared/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/shared/ui/avatar";
import { ScrollArea } from "@/components/shared/ui/scroll-area";
import { UserCard } from "@/components/features/social/user-card";
import { ConversationsList } from "@/components/features/social/conversations-list";
import { ChatWindow } from "@/components/features/social/chat-window";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, MessageCircle, Send } from "lucide-react";
import { Textarea } from "@/components/shared/ui/textarea";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { SocialFeed } from "@/components/features/social/social-feed";
import { SocialChallenges } from "@/components/features/social/social-challenges";
import { SocialLeaderboard } from "@/components/features/social/social-leaderboard";
import { useI18n } from "@/hooks/use-i18n";

interface User {
  id: string;
  nickname: string;
  profile_image_url?: string;
  level?: number;
  xp?: number;
  follower_count?: number;
  following_count?: number;
  avatar?: {
    id: string;
    name: string;
    image_url: string;
  };
}

export default function Social() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          nickname, 
          profile_image_url, 
          level, 
          xp,
          avatar:user_avatars (
            avatars(id, name, image_url)
          )
        `)
        .ilike('nickname', `%${query}%`)
        .limit(10);

      if (error) throw error;
      // Transform the nested avatar data
      const transformedData = data?.map(user => ({
        ...user,
        avatar: user.avatar?.[0]?.avatars || null
      })) || [];
      setSearchResults(transformedData);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFollowing = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data: followsInfo, error } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', profile.id);

      if (error) throw error;
      
      if (followsInfo && followsInfo.length > 0) {
        const followingIds = followsInfo.map(f => f.following_id);
        
        const { data: followingUsers, error: usersError } = await supabase
          .from('profiles')
          .select(`
            id, 
            nickname, 
            profile_image_url, 
            level, 
            xp,
            avatar:user_avatars (
              avatars(id, name, image_url)
            )
          `)
          .in('id', followingIds);

        if (usersError) throw usersError;
        // Transform the nested avatar data
        const transformedData = followingUsers?.map(user => ({
          ...user,
          avatar: user.avatar?.[0]?.avatars || null
        })) || [];
        setFollowing(transformedData);
      } else {
        setFollowing([]);
      }
    } catch (error) {
      console.error('Error loading following:', error);
    }
  };

  const loadFollowers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data: followersInfo, error } = await supabase
        .from('user_follows')
        .select('follower_id')
        .eq('following_id', profile.id);

      if (error) throw error;
      
      if (followersInfo && followersInfo.length > 0) {
        const followerIds = followersInfo.map(f => f.follower_id);
        
        const { data: followerUsers, error: usersError } = await supabase
          .from('profiles')
          .select(`
            id, 
            nickname, 
            profile_image_url, 
            level, 
            xp,
            avatar:user_avatars (
              avatars(id, name, image_url)
            )
          `)
          .in('id', followerIds);

        if (usersError) throw usersError;
        // Transform the nested avatar data
        const transformedData = followerUsers?.map(user => ({
          ...user,
          avatar: user.avatar?.[0]?.avatars || null
        })) || [];
        setFollowers(transformedData);
      } else {
        setFollowers([]);
      }
    } catch (error) {
      console.error('Error loading followers:', error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    loadFollowing();
    loadFollowers();
    loadCurrentUser();
  }, []);

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

  if (selectedConversationId) {
    return (
      <ChatWindow 
        conversationId={selectedConversationId}
        onBack={() => setSelectedConversationId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <FloatingNavbar />
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              Social
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="feed" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1 overflow-x-auto">
                <TabsTrigger value="feed" className="text-xs px-1 py-1 min-w-0 flex-shrink-0">{t('social.tabs.feed')}</TabsTrigger>
                <TabsTrigger value="discover" className="text-xs px-1 py-1 min-w-0 flex-shrink-0">{t('social.tabs.search')}</TabsTrigger>
                <TabsTrigger value="challenges" className="text-xs px-1 py-1 min-w-0 flex-shrink-0">{t('social.tabs.challenges')}</TabsTrigger>
                <TabsTrigger value="rankings" className="text-xs px-1 py-1 min-w-0 flex-shrink-0">{t('social.tabs.ranks')}</TabsTrigger>
                <TabsTrigger value="following" className="text-xs px-1 py-1 min-w-0 flex-shrink-0">{t('social.tabs.following')}</TabsTrigger>
                <TabsTrigger value="messages" className="text-xs px-1 py-1 min-w-0 flex-shrink-0">{t('social.tabs.chat')}</TabsTrigger>
              </TabsList>

              {/* Desktop: Create Post Card */}
              <div className="hidden sm:block mt-4 mb-4">
                <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <Textarea
                        placeholder={t('social.placeholders.shareOpinion')}
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="min-h-[80px] resize-none"
                        maxLength={500}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {newPost.length}/500
                        </span>
                        <Button 
                          onClick={handleCreatePost}
                          disabled={!newPost.trim() || posting}
                          size="sm"
                        >
                          {posting ? t('social.buttons.publishing') : t('social.buttons.publish')}
                          <Send className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <TabsContent value="feed" className="space-y-4">
                {/* Mobile: Create Post Card - compact version */}
                <div className="block sm:hidden">
                  <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <Textarea
                          placeholder={t('social.placeholders.shareOpinion')}
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          className="min-h-[60px] resize-none text-sm"
                          maxLength={500}
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {newPost.length}/500
                          </span>
                          <Button 
                            onClick={handleCreatePost}
                            disabled={!newPost.trim() || posting}
                            size="sm"
                            className="h-7 text-xs px-2"
                          >
                            {posting ? "..." : t('social.buttons.publish')}
                            <Send className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <SocialFeed />
              </TabsContent>

              <TabsContent value="challenges" className="space-y-4">
                <SocialChallenges />
              </TabsContent>

              <TabsContent value="rankings" className="space-y-4">
                <SocialLeaderboard />
              </TabsContent>

              <TabsContent value="discover" className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('social.placeholders.searchUsers')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {loading ? (
                      <div className="text-center text-muted-foreground">
                        {t('social.messages.searchingUsers')}
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((user) => (
                        <UserCard 
                          key={user.id} 
                          user={user}
                          showSocialStats={false}
                          onStartConversation={(userId) => {
                            // TODO: Implement start conversation
                            toast({
                              title: t('social.messages.comingSoon'),
                              description: t('social.messages.comingSoon')
                            });
                          }}
                          onClick={(userId) => {
                            navigate(`/user/${userId}`);
                          }}
                        />
                      ))
                    ) : searchQuery ? (
                      <div className="text-center text-muted-foreground">
                        {t('social.messages.comingSoon')}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        {t('social.placeholders.searchUsers')}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="following">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {following.length > 0 ? (
                      following.map((user) => (
                        <UserCard 
                          key={user.id} 
                          user={user}
                          compact
                          onClick={(userId) => {
                            navigate(`/user/${userId}`);
                          }}
                        />
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground">
                        {t('social.messages.comingSoon')}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="followers">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {followers.length > 0 ? (
                      followers.map((user) => (
                        <UserCard 
                          key={user.id} 
                          user={user}
                          compact
                          onClick={(userId) => {
                            navigate(`/user/${userId}`);
                          }}
                        />
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground">
                        {t('social.messages.comingSoon')}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="messages">
                <ConversationsList 
                  onSelectConversation={setSelectedConversationId}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
