import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { Button } from "@/components/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { ConversationsList } from "@/components/features/social/conversations-list";
import { ChatWindow } from "@/components/features/social/chat-window";
import { CreatePostCard } from "@/components/features/social/create-post-card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, MessageCircle, Home, Hash, Bell, Mail, ArrowLeft } from "lucide-react";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { TwitterSocialFeed } from "@/components/features/social/twitter-social-feed";
import { SocialChallenges } from "@/components/features/social/social-challenges";
import { SocialLeaderboard } from "@/components/features/social/social-leaderboard";
import { useI18n } from "@/hooks/use-i18n";
import { useSocialNavigation } from "@/hooks/use-social-navigation";
import { useSocialLoadingState } from "@/hooks/use-social-loading-state";
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
  const { activeTab, navigateToTab } = useSocialNavigation();
  const { loading, setLoading, isMainLoading } = useSocialLoadingState();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Optimized search with better debouncing
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setLoading('search', false);
      return;
    }

    setLoading('search', true);
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
      setLoading('search', false);
    }
  }, [setLoading, toast, t]);

  // Debounced search effect - optimized to 500ms
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    setLoading('userProfile', true);
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

      if (profile) {
        setCurrentUserId(profile.id);
        setCurrentUser(profile);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    } finally {
      setLoading('userProfile', false);
      setLoading('main', false);
    }
  };

  // Handle post creation callback
  const handlePostCreated = useCallback(() => {
    // This will trigger a refresh of the social feed
    // The TwitterSocialFeed component handles its own real-time subscriptions
  }, []);

  if (selectedConversationId) {
    return (
      <ChatWindow 
        conversationId={selectedConversationId}
        onBack={() => setSelectedConversationId(null)}
      />
    );
  }

  // Show loading skeleton while main data loads
  if (isMainLoading) {
    return (
      <div className="min-h-screen bg-background" style={{ paddingTop: '50px' }}>
        {/* Botão de voltar acima da imagem do perfil - Mobile Loading */}
        <div className="lg:hidden absolute top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-full p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="max-w-7xl mx-auto flex min-h-screen justify-center">
          <div className="flex-1 max-w-2xl min-w-0 border-x border-border/50 min-h-screen">
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 p-4">
              <div className="h-6 bg-muted rounded w-32 animate-pulse" />
            </div>
            <div className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border-b border-border/50 pb-4 animate-pulse">
                  <div className="flex space-x-3">
                    <div className="w-12 h-12 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-32" />
                      <div className="h-4 bg-muted rounded w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: '50px' }}>
      {/* Content sem header fixo */}
        {/* Simplified responsive layout */}
      <div className="max-w-7xl mx-auto flex min-h-screen">
        {/* Left Sidebar - Desktop only */}
        <div className="hidden lg:flex w-64 flex-col p-4 space-y-4 sticky top-0 h-screen overflow-y-auto">
          <nav className="space-y-1">
            <Button 
              variant={activeTab === 'feed' ? 'secondary' : 'ghost'}
              className="justify-start w-full h-12 text-lg"
              onClick={() => navigateToTab('feed')}
            >
              <Home className="mr-3 h-6 w-6" />
              {t('social.tabs.feed')}
            </Button>
            <Button 
              variant={activeTab === 'search' ? 'secondary' : 'ghost'}
              className="justify-start w-full h-12 text-lg"
              onClick={() => navigateToTab('search')}
            >
              <Search className="mr-3 h-6 w-6" />
              {t('social.tabs.search')}
            </Button>
            <Button 
              variant={activeTab === 'challenges' ? 'secondary' : 'ghost'}
              className="justify-start w-full h-12 text-lg"
              onClick={() => navigateToTab('challenges')}
            >
              <Hash className="mr-3 h-6 w-6" />
              {t('social.tabs.challenges')}
            </Button>
            <Button 
              variant={activeTab === 'rankings' ? 'secondary' : 'ghost'}
              className="justify-start w-full h-12 text-lg"
              onClick={() => navigateToTab('rankings')}
            >
              <Bell className="mr-3 h-6 w-6" />
              {t('social.tabs.ranks')}
            </Button>
            <Button 
              variant={activeTab === 'messages' ? 'secondary' : 'ghost'}
              className="justify-start w-full h-12 text-lg"
              onClick={() => navigateToTab('messages')}
            >
              <Mail className="mr-3 h-6 w-6" />
              {t('social.tabs.chat')}
            </Button>
          </nav>

          {/* User Profile Card */}
          {currentUser && (
            <div className="mt-auto p-3 rounded-xl border bg-card/50">
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

        {/* Main Content - Responsive */}
        <div className="flex-1 max-w-2xl min-w-0 border-x border-border/50 min-h-screen mx-auto lg:mx-0">
          {/* Desktop Content */}
          <div className="hidden lg:block">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 p-4">
              <h1 className="text-xl font-bold">
                {activeTab === 'feed' && t('social.tabs.feed')}
                {activeTab === 'search' && t('social.tabs.search')}
                {activeTab === 'challenges' && t('social.tabs.challenges')}
                {activeTab === 'rankings' && t('social.tabs.ranks')}
                {activeTab === 'messages' && t('social.tabs.chat')}
              </h1>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'feed' && (
              <>
                <CreatePostCard 
                  variant="desktop"
                  currentUser={currentUser}
                  currentUserId={currentUserId}
                  onPostCreated={handlePostCreated}
                />
                <TwitterSocialFeed />
              </>
            )}

            {activeTab === 'search' && (
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
                  {loading.search ? (
                    <div className="text-center text-muted-foreground">
                      {t('social.messages.searchingUsers')}
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((user) => (
                      <div 
                        key={user.id}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer border"
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
            )}

            {activeTab === 'challenges' && (
              <div className="p-4">
                <SocialChallenges />
              </div>
            )}

            {activeTab === 'rankings' && (
              <div className="p-4">
                <SocialLeaderboard />
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="p-4">
                <ConversationsList onSelectConversation={setSelectedConversationId} />
              </div>
            )}
          </div>

          {/* Mobile Content with Tabs */}
          <div className="lg:hidden">
            <Tabs value={activeTab} onValueChange={(value) => navigateToTab(value as any)} className="w-full">
              <TabsList className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 bg-background/50 backdrop-blur-md border-t border-border/50 rounded-lg h-12 w-64 grid grid-cols-3">
                <TabsTrigger value="feed" className="flex flex-col items-center justify-center h-10 text-xs">
                  <Home className="h-4 w-4 mb-1" />
                  <span>{t('social.tabs.feed')}</span>
                </TabsTrigger>
                <TabsTrigger value="search" className="flex flex-col items-center justify-center h-10 text-xs">
                  <Search className="h-4 w-4 mb-1" />
                  <span>{t('social.tabs.search')}</span>
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex flex-col items-center justify-center h-10 text-xs">
                  <Mail className="h-4 w-4 mb-1" />
                  <span>{t('social.tabs.chat')}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="pb-16 min-h-screen">
                <CreatePostCard 
                  variant="mobile"
                  currentUser={currentUser}
                  currentUserId={currentUserId}
                  onPostCreated={handlePostCreated}
                />
                <TwitterSocialFeed />
              </TabsContent>

              <TabsContent value="search" className="pb-16">
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
                    {loading.search ? (
                      <div className="text-center text-muted-foreground">
                        {t('social.messages.searchingUsers')}
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((user) => (
                        <div 
                          key={user.id}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer border"
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


              <TabsContent value="messages" className="pb-16">
                <div className="p-4">
                  <ConversationsList onSelectConversation={setSelectedConversationId} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Sidebar - Desktop only */}
        <div className="hidden xl:flex w-80 p-4 space-y-4 overflow-y-auto sticky top-0 h-screen">
          <div className="space-y-4">
            {/* Quick Search Widget */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t('social.tabs.search')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('social.placeholders.searchUsers')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-muted/30"
                  />
                </div>

                {searchQuery && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {loading.search ? (
                      <div className="text-center text-muted-foreground text-sm">
                        {t('social.messages.searchingUsers')}
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.slice(0, 5).map((user) => (
                        <div 
                          key={user.id}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => navigate(`/user/${user.id}`)}
                        >
                          <AvatarDisplayUniversal
                            avatarData={normalizeAvatarData(user)}
                            nickname={user.nickname}
                            size="sm"
                          />
                          <div className="flex-1 overflow-hidden">
                            <p className="font-medium text-xs truncate">@{user.nickname}</p>
                            <p className="text-xs text-muted-foreground">{t('common.level')} {user.level}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground text-sm">
                        {t('social.messages.noResults')}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trending/Suggestions placeholder */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t('social.messages.comingSoon')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {t('social.messages.comingSoon')}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Botão de voltar acima da imagem do perfil - Mobile */}
      <div className="lg:hidden absolute top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-full p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      
      <FloatingNavbar />
    </div>
  );
}
