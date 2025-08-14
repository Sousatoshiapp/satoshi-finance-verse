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
    path: "/concept-connection",
    component: "ConceptConnection",
    title: "Concept Connection",
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

  // FASE 1: Social Explosion - New social routes
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
    description: "Solo and squad battle royale modes",
    category: "social",
    requiresAuth: true
  },
  {
    path: "/community-feed",
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