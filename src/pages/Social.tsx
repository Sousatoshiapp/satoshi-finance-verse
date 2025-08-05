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
import { Search, MessageCircle, Send, Home, Compass, Hash, Bell, Mail, Bookmark, User, MoreHorizontal } from "lucide-react";
import { Textarea } from "@/components/shared/ui/textarea";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { TwitterSocialFeed } from "@/components/features/social/twitter-social-feed";
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
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
          current_avatar_id
        `)
        .ilike('nickname', `%${query}%`)
        .limit(10);

      if (error) throw error;

      // Get avatars for users
      const usersWithAvatars = await Promise.all(
        (data || []).map(async (user) => {
          if (user.current_avatar_id) {
            const { data: avatarData } = await supabase
              .from('avatars')
              .select('id, name, image_url')
              .eq('id', user.current_avatar_id)
              .single();
            return { ...user, avatar: avatarData };
          }
          return { ...user, avatar: null };
        })
      );
      
      setSearchResults(usersWithAvatars);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Erro na busca",
        description: t('social.messages.errorPost'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          id,
          nickname,
          profile_image_url,
          level,
          xp,
          current_avatar_id
        `)
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setCurrentUserId(profile.id);
        
        // Get avatar if available
        if (profile.current_avatar_id) {
          const { data: avatarData } = await supabase
            .from('avatars')
            .select('id, name, image_url')
            .eq('id', profile.current_avatar_id)
            .single();
          setCurrentUser({ ...profile, avatar: avatarData });
        } else {
          setCurrentUser(profile);
        }
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

  if (selectedConversationId) {
    return (
      <ChatWindow 
        conversationId={selectedConversationId}
        onBack={() => setSelectedConversationId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FloatingNavbar />
      
      {/* Layout estilo Twitter */}
      <div className="max-w-6xl mx-auto flex">
        {/* Sidebar esquerda - Desktop */}
        <div className="hidden lg:flex w-64 flex-col p-4 space-y-4 sticky top-0 h-screen">
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              className="justify-start w-full h-12 text-lg"
              onClick={() => navigate('/social')}
            >
              <Home className="mr-3 h-6 w-6" />
              {t('social.tabs.feed')}
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start w-full h-12 text-lg"
              onClick={() => navigate('/social?tab=search')}
            >
              <Search className="mr-3 h-6 w-6" />
              {t('social.tabs.search')}
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start w-full h-12 text-lg"
              onClick={() => navigate('/social?tab=challenges')}
            >
              <Hash className="mr-3 h-6 w-6" />
              {t('social.tabs.challenges')}
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start w-full h-12 text-lg"
              onClick={() => navigate('/social?tab=rankings')}
            >
              <Bell className="mr-3 h-6 w-6" />
              {t('social.tabs.ranks')}
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start w-full h-12 text-lg"
              onClick={() => navigate('/social?tab=messages')}
            >
              <Mail className="mr-3 h-6 w-6" />
              {t('social.tabs.chat')}
            </Button>
          </div>

          {/* User Profile Mini Card */}
          {currentUser && (
            <div className="mt-auto p-3 rounded-lg border border-border/50 bg-card/50">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={currentUser.avatar?.image_url || currentUser.profile_image_url} 
                    alt={currentUser.nickname} 
                  />
                  <AvatarFallback>{currentUser.nickname.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium text-sm truncate">{currentUser.nickname}</p>
                  <p className="text-xs text-muted-foreground">Nível {currentUser.level}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feed central */}
        <div className="flex-1 max-w-2xl border-x border-border/50">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 p-4">
            <h1 className="text-xl font-bold">{t('social.tabs.feed')}</h1>
          </div>

          {/* Create Post */}
          <div className="border-b border-border/50 p-4">
            <div className="flex space-x-3">
              {currentUser && (
                <Avatar className="w-12 h-12">
                  <AvatarImage 
                    src={currentUser.avatar?.image_url || currentUser.profile_image_url} 
                    alt={currentUser.nickname} 
                  />
                  <AvatarFallback>{currentUser.nickname.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1">
                <Textarea
                  placeholder={t('social.placeholders.shareOpinion')}
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[80px] resize-none border-none shadow-none text-xl placeholder:text-xl focus-visible:ring-0"
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-muted-foreground">
                    {newPost.length}/500
                  </span>
                  <Button 
                    onClick={handleCreatePost}
                    disabled={!newPost.trim() || posting}
                    className="rounded-full px-6"
                  >
                    {posting ? t('social.buttons.publishing') : t('social.buttons.publish')}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Feed de posts */}
          <TwitterSocialFeed />
        </div>

        {/* Sidebar direita - Desktop */}
        <div className="hidden lg:flex w-80 p-4 space-y-4">
          {/* Search */}
          <div className="sticky top-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('social.placeholders.searchUsers')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50"
              />
            </div>

            {/* Search Results */}
            {searchQuery && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{t('social.tabs.search')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    <div className="text-center text-muted-foreground">
                      {t('social.messages.searchingUsers')}
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((user) => (
                      <div 
                        key={user.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate(`/user/${user.id}`)}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage 
                            src={user.avatar?.image_url || user.profile_image_url} 
                            alt={user.nickname} 
                          />
                          <AvatarFallback>{user.nickname.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-medium text-sm truncate">{user.nickname}</p>
                          <p className="text-xs text-muted-foreground">Nível {user.level}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground text-sm">
                      {t('social.messages.noResults')}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Trending/Suggestions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Trending</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  {t('social.messages.comingSoon')}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="lg:hidden">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="fixed bottom-20 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border/50 rounded-none h-16">
            <TabsTrigger value="feed" className="flex-1 h-12">
              <Home className="h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger value="search" className="flex-1 h-12">
              <Search className="h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex-1 h-12">
              <Hash className="h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger value="rankings" className="flex-1 h-12">
              <Bell className="h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex-1 h-12">
              <Mail className="h-5 w-5" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="pb-32">
            <div className="p-4">
              <TwitterSocialFeed />
            </div>
          </TabsContent>

          <TabsContent value="search" className="pb-32">
            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('social.placeholders.searchUsers')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

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
                      onClick={(userId) => navigate(`/user/${userId}`)}
                    />
                  ))
                ) : searchQuery ? (
                  <div className="text-center text-muted-foreground">
                    {t('social.messages.noResults')}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    {t('social.placeholders.searchUsers')}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="pb-32">
            <div className="p-4">
              <SocialChallenges />
            </div>
          </TabsContent>

          <TabsContent value="rankings" className="pb-32">
            <div className="p-4">
              <SocialLeaderboard />
            </div>
          </TabsContent>

          <TabsContent value="messages" className="pb-32">
            <div className="p-4">
              <ConversationsList 
                onSelectConversation={setSelectedConversationId}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}