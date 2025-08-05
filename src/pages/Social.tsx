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
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { normalizeAvatarData } from "@/lib/avatar-utils";

interface User {
  id: string;
  nickname: string;
  profile_image_url?: string | null;
  level?: number;
  xp?: number;
  follower_count?: number;
  following_count?: number;
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
          *,
          profile_image_url,
          current_avatar_id,
          avatars!current_avatar_id (
            id, name, image_url
          )
        `)
        .ilike('nickname', `%${query}%`)
        .limit(10);

      if (error) throw error;

      setSearchResults(data || []);
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
          *,
          profile_image_url,
          current_avatar_id,
          avatars!current_avatar_id (
            id, name, image_url
          )
        `)
        .eq('user_id', user.id)
        .single();

      console.log('🔍 Social currentUser query result:', profile);

      if (profile) {
        setCurrentUserId(profile.id);
        setCurrentUser(profile);
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
      
      {/* Layout responsivo estilo Twitter */}
      <div className="max-w-7xl mx-auto flex min-h-screen justify-center">
        {/* Sidebar esquerda - Desktop */}
        <div className="hidden lg:flex w-64 flex-col p-4 space-y-4 sticky top-0 h-screen overflow-y-auto flex-shrink-0">
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              className="justify-start w-full h-12 text-lg hover:bg-muted/40 transition-colors duration-200"
              onClick={() => navigate('/social')}
            >
              <Home className="mr-3 h-6 w-6" />
              {t('social.tabs.feed')}
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start w-full h-12 text-lg hover:bg-muted/40 transition-colors duration-200"
              onClick={() => navigate('/social?tab=search')}
            >
              <Search className="mr-3 h-6 w-6" />
              {t('social.tabs.search')}
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start w-full h-12 text-lg hover:bg-muted/40 transition-colors duration-200"
              onClick={() => navigate('/social?tab=challenges')}
            >
              <Hash className="mr-3 h-6 w-6" />
              {t('social.tabs.challenges')}
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start w-full h-12 text-lg hover:bg-muted/40 transition-colors duration-200"
              onClick={() => navigate('/social?tab=rankings')}
            >
              <Bell className="mr-3 h-6 w-6" />
              {t('social.tabs.ranks')}
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start w-full h-12 text-lg hover:bg-muted/40 transition-colors duration-200"
              onClick={() => navigate('/social?tab=messages')}
            >
              <Mail className="mr-3 h-6 w-6" />
              {t('social.tabs.chat')}
            </Button>
          </div>

          {/* User Profile Mini Card */}
          {currentUser && (
            <div className="mt-auto p-2.5 rounded-xl border border-border/50 bg-card/50 hover:bg-card/70 transition-colors">
              <div className="flex items-center space-x-3">
                <AvatarDisplayUniversal
                  avatarData={normalizeAvatarData(currentUser)}
                  nickname={currentUser.nickname}
                  size="md"
                />
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium text-sm truncate">@{currentUser.nickname}</p>
                  <p className="text-xs text-muted-foreground">{t('common.level')} {currentUser.level}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feed central - Responsivo */}
        <div className="flex-1 max-w-2xl min-w-0 border-x border-border/50 lg:border-x lg:border-border/50 min-h-screen mx-4 lg:mx-0">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 p-3 lg:p-4">
            <h1 className="text-lg lg:text-xl font-bold">{t('social.tabs.feed')}</h1>
          </div>

          {/* Create Post */}
          <div className="border-b border-border/50 p-3 lg:p-4">
            <div className="flex space-x-3">
              {currentUser && (
                <AvatarDisplayUniversal
                  avatarData={normalizeAvatarData(currentUser)}
                  nickname={currentUser.nickname}
                  size="lg"
                />
              )}
              <div className="flex-1">
                <Textarea
                  placeholder={t('social.placeholders.whatThinking')}
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
        <div className="hidden xl:flex w-80 p-4 space-y-4 overflow-y-auto flex-shrink-0 sticky top-0 h-screen">
          {/* Search */}
          <div className="sticky top-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('social.placeholders.searchUsers')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/30"
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
                        className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate(`/user/${user.id}`)}
                      >
                        <AvatarDisplayUniversal
                          avatarData={normalizeAvatarData(user)}
                          nickname={user.nickname}
                          size="md"
                        />
                        <div className="flex-1 overflow-hidden">
                          <p className="font-medium text-sm truncate">@{user.nickname}</p>
                          <p className="text-xs text-muted-foreground">{t('common.level')} {user.level}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground text-sm">
                      {t('social.messages.comingSoon')}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Trending/Suggestions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t('social.messages.comingSoon')}</CardTitle>
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
      <div className="lg:hidden pb-32">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="fixed bottom-20 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50 rounded-none h-12 grid grid-cols-5">
            <TabsTrigger value="feed" className="flex flex-col items-center justify-center h-10 text-xs transition-all duration-200">
              <Home className="h-4 w-4 mb-1" />
              <span>{t('social.tabs.feed')}</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex flex-col items-center justify-center h-10 text-xs transition-all duration-200">
              <Search className="h-4 w-4 mb-1" />
              <span>{t('social.tabs.search')}</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex flex-col items-center justify-center h-10 text-xs transition-all duration-200">
              <Hash className="h-4 w-4 mb-1" />
              <span>{t('social.tabs.challenges')}</span>
            </TabsTrigger>
            <TabsTrigger value="rankings" className="flex flex-col items-center justify-center h-10 text-xs transition-all duration-200">
              <Bell className="h-4 w-4 mb-1" />
              <span>{t('social.tabs.ranks')}</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex flex-col items-center justify-center h-10 text-xs transition-all duration-200">
              <Mail className="h-4 w-4 mb-1" />
              <span>{t('social.tabs.chat')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="pb-32 min-h-screen">
            {/* Mobile Create Post */}
            <div className="border-b border-border/50 p-3">
              <div className="flex space-x-3">
                {currentUser && (
                  <AvatarDisplayUniversal
                    avatarData={normalizeAvatarData(currentUser)}
                    nickname={currentUser.nickname}
                    size="md"
                  />
                )}
                <div className="flex-1">
                  <Textarea
                    placeholder={t('social.placeholders.shareOpinion')}
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-[60px] resize-none border-none shadow-none text-base placeholder:text-base focus-visible:ring-0"
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {newPost.length}/500
                    </span>
                    <Button 
                      onClick={handleCreatePost}
                      disabled={!newPost.trim() || posting}
                      size="sm"
                      className="rounded-full"
                    >
                      {posting ? t('social.buttons.publishing') : t('social.buttons.publish')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <TwitterSocialFeed />
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
