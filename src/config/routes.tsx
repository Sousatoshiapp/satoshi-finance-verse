// FASE 1: Social Explosion - Enhanced route configuration
export interface RouteConfig {
  path: string;
  component: string;
  title: string;
  description?: string;
  category?: 'main' | 'gamification' | 'social' | 'admin';
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  preload?: boolean;
}

export const routeConfigs: RouteConfig[] = [
  // Public routes
  {
    path: "/welcome",
    component: "Welcome",
    title: "Welcome",
    description: "Welcome page for new users",
    category: "main",
    requiresAuth: false
  },
  {
    path: "/auth",
    component: "Auth",
    title: "Authentication",
    description: "Login and signup page",
    category: "main",
    requiresAuth: false
  },
  // Main routes
  {
    path: "/",
    component: "Dashboard",
    title: "Dashboard",
    description: "Main dashboard with gamification features",
    category: "main",
    requiresAuth: true,
    preload: true
  },
  {
    path: "/dashboard",
    component: "Dashboard", 
    title: "Dashboard",
    description: "Main dashboard with gamification features",
    category: "main",
    requiresAuth: true,
    preload: true
  },
  {
    path: "/quiz",
    component: "Quiz",
    title: "Quiz",
    description: "Interactive quiz system",
    category: "main",
    requiresAuth: true,
    preload: true
  },
  {
    path: "/leaderboard",
    component: "Leaderboard",
    title: "Leaderboard",
    description: "Global rankings and competitions",
    category: "gamification",
    requiresAuth: true
  },
  {
    path: "/profile",
    component: "Profile",
    title: "Profile",
    description: "User profile and statistics",
    category: "main",
    requiresAuth: true
  },
  {
    path: "/user/:userId",
    component: "UserProfile",
    title: "User Profile",
    description: "View other users' profiles",
    category: "main",
    requiresAuth: true
  },
  {
    path: "/messages",
    component: "Messages",
    title: "Messages",
    description: "Direct messages and conversations",
    category: "main",
    requiresAuth: true
  },
  {
    path: "/chat/:conversationId",
    component: "DirectChatWrapper",
    title: "Chat",
    description: "Direct chat conversation",
    category: "main",
    requiresAuth: true
  },
  {
    path: "/store",
    component: "Store",
    title: "Store",
    description: "Avatar and power-up store",
    category: "gamification",
    requiresAuth: true
  },
  {
    path: "/settings",
    component: "Settings",
    title: "Settings",
    description: "App settings and preferences",
    category: "main",
    requiresAuth: true
  },
  {
    path: "/lessons",
    component: "Lessons",
    title: "Lessons",
    description: "Educational content and lessons",
    category: "main",
    requiresAuth: true
  },
  {
    path: "/simulator",
    component: "Simulator",
    title: "Simulator",
    description: "Financial simulation games",
    category: "gamification",
    requiresAuth: true
  },
  // ============================================
  // PERSONALIZAÇÃO EXTREMA - ROTAS TEMPORARIAMENTE DESABILITADAS
  // ============================================
  // FASE 2: Avatar 2.0 & Profile Flexing routes - COMENTADO
  /*
  {
    path: "/profile-customization",
    component: "ProfileCustomization",
    title: "Personalização Extrema",
    description: "Avatar 2.0 e personalização de perfil",
    category: "main",
    requiresAuth: true
  },
  {
    path: "/hall-of-fame",
    component: "HallOfFame",
    title: "Hall da Fama",
    description: "Rankings e destaques da plataforma",
    category: "main",
    requiresAuth: true
  },
  {
    path: "/avatar-collection",
    component: "AvatarCollection",
    title: "Coleção de Avatares",
    description: "Visualizar e gerenciar avatares coletados",
    category: "main",
    requiresAuth: true
  },
  {
    path: "/avatar-editor",
    component: "AvatarEditor", 
    title: "Editor de Avatar",
    description: "Editor completo de avatar estilo Bitmoji",
    category: "main",
    requiresAuth: true
  },
  */
  {
    path: "/beetz-info",
    component: "BeetzInfo",
    title: "Beetz Info",
    description: "Information about Beetz currency",
    category: "main",
    requiresAuth: true
  },
  {
    path: "/subscription-plans",
    component: "SubscriptionPlans",
    title: "Subscription Plans",
    description: "Premium subscription options",
    category: "main",
    requiresAuth: true
  },
  {
    path: "/success",
    component: "Success",
    title: "Success",
    description: "Payment success page",
    category: "main",
    requiresAuth: true
  },
  {
    path: "/cancel",
    component: "Cancel",
    title: "Cancel",
    description: "Payment cancellation page",
    category: "main",
    requiresAuth: true
  },
  {
    path: "/gamification",
    component: "GamificationDashboard",
    title: "Gamification",
    description: "Gamification features and achievements",
    category: "gamification",
    requiresAuth: true
  },
  {
    path: "/concept-connections",
    component: "ConceptConnectionsPage",
    title: "Concept Connections",
    description: "Connect related financial concepts",
    category: "gamification",
    requiresAuth: true
  },
  {
    path: "/duels",
    component: "Duels",
    title: "Duels",
    description: "Player vs player competitions",
    category: "gamification",
    requiresAuth: true
  },
  {
    path: "/tournaments",
    component: "Tournaments",
    title: "Tournaments",
    description: "Competitive tournaments",
    category: "gamification",
    requiresAuth: true
  },
  {
    path: "/satoshi-city",
    component: "SatoshiCity",
    title: "Satoshi City",
    description: "Explore the virtual city and districts",
    category: "main",
    requiresAuth: true
  },
  {
    path: "/game-mode",
    component: "GameMode",
    title: "Game Mode",
    description: "Select your game mode",
    category: "main",
    requiresAuth: true
  },
  {
    path: "/casino-duels",
    component: "NewFindOpponent",
    title: "Casino Duels",
    description: "Find opponents for casino-style duels",
    category: "gamification",
    requiresAuth: true
  },
  {
    path: "/casino-duel",
    component: "SelectOpponentScreen",
    title: "Casino Duel",
    description: "Start a casino-style duel",
    category: "gamification",
    requiresAuth: true
  },
  {
    path: "/casino-duel/:duelId",
    component: "CasinoDuelScreen",
    title: "Casino Duel",
    description: "Participate in a casino-style duel",
    category: "gamification",
    requiresAuth: true
  },
  {
    path: "/find-opponent",
    component: "FindOpponent",
    title: "Find Opponent",
    description: "Find opponents for duels",
    category: "gamification",
    requiresAuth: true
  },
  {
    path: "/select-opponent",
    component: "SelectOpponentScreen",
    title: "Select Opponent",
    description: "Choose your duel opponent",
    category: "gamification",
    requiresAuth: true
  },
  {
    path: "/quiz/solo",
    component: "SoloQuiz",
    title: "Solo Quiz",
    description: "Practice quiz mode",
    category: "main",
    requiresAuth: true
  },
  {
    path: "/dopamine-hits",
    component: "DopamineHitsShowcase",
    title: "Dopamine Hits",
    description: "FASE 3: Sistema de micro-recompensas",
    category: "gamification",
    requiresAuth: true
  },
  {
    path: "/influencer-program",
    component: "InfluencerProgram",
    title: "Programa de Influenciadores",
    description: "FASE 4: Monetize seu conhecimento",
    category: "social",
    requiresAuth: true
  },
  {
    path: "/guild-wars",
    component: "GuildWars",
    title: "Guild Wars",
    description: "FASE 4: Competições entre guilds",
    category: "gamification",
    requiresAuth: true
  },
  {
    path: "/viral-challenges",
    component: "ViralChallenges",
    title: "Desafios Virais",
    description: "FASE 5: Challenges sazonais virais",
    category: "social",
    requiresAuth: true
  },
  {
    path: "/meme-economy",
    component: "MemeEconomy",
    title: "Economia de Memes",
    description: "FASE 5: Colecione memes crypto exclusivos",
    category: "gamification",
    requiresAuth: true
  },

  // FASE 1: Social Explosion - New social routes
  {
    path: "/social",
    component: "Social",
    title: "Social",
    description: "Social network with posts, messaging and interactions",
    category: "social",
    requiresAuth: true
  },
  {
    path: "/social-hub",
    component: "SocialHub", 
    title: "Social Hub",
    description: "Central hub for all social features",
    category: "social",
    requiresAuth: true
  },
  {
    path: "/stories",
    component: "AchievementStoriesPage",
    title: "Achievement Stories",
    description: "Share and view achievement stories",
    category: "social",
    requiresAuth: true
  },
  {
    path: "/battle-royale",
    component: "BattleRoyalePage", 
    title: "Battle Royale",
    description: "Arena de batalha com até 100 jogadores",
    category: "social",
    requiresAuth: true
  },
  {
    path: "/social/community-feed",
    component: "CommunityFeedPage",
    title: "Community Feed",
    description: "Recent wins and community activity",
    category: "social",
    requiresAuth: true
  },
  {
    path: "/social-tournaments",
    component: "TournamentsPage",
    title: "Social Tournaments",
    description: "Weekly tournaments and competitions",
    category: "social",
    requiresAuth: true
  },

  // Admin routes
  {
    path: "/admin",
    component: "Admin",
    title: "Admin",
    description: "Administrative dashboard",
    category: "admin",
    requiresAuth: true,
    requiresAdmin: true
  },
  {
    path: "/admin/settings",
    component: "AdminSettings",
    title: "Admin Settings",
    description: "System configuration and settings",
    category: "admin",
    requiresAuth: true,
    requiresAdmin: true
  },
  {
    path: "/admin/analytics/realtime",
    component: "RealtimeAnalyticsPage",
    title: "Real-Time Analytics",
    description: "Advanced real-time analytics dashboard",
    category: "admin",
    requiresAuth: true,
    requiresAdmin: true
  },
  {
    path: "/admin/quiz/questions",
    component: "AdminQuizQuestions",
    title: "Admin Quiz Questions",
    description: "Manage quiz questions and import CSV data",
    category: "admin",
    requiresAuth: true,
    requiresAdmin: true
  },
  // Duel System Testing
  {
    path: "/duel-test",
    component: "DuelSystemTest",
    title: "Duel System Test",
    description: "Test interface for comparing old vs new duel systems",
    category: "main",
    requiresAuth: true
  },
  {
    path: "/unified-duel/:duelId",
    component: "UnifiedCasinoDuelScreen",
    title: "Unified Duel",
    description: "New unified duel system",
    category: "main", 
    requiresAuth: true
  }
];

// Route categories for navigation
export const routeCategories = {
  main: routeConfigs.filter(r => r.category === 'main'),
  gamification: routeConfigs.filter(r => r.category === 'gamification'),
  social: routeConfigs.filter(r => r.category === 'social'),
  admin: routeConfigs.filter(r => r.category === 'admin')
};

// Get routes that should be preloaded
export const preloadRoutes = routeConfigs.filter(r => r.preload);

// Get social routes for Social Hub
export const socialRoutes = routeConfigs.filter(r => r.category === 'social');