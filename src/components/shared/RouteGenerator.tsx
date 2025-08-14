import { lazy } from "react";
import { Route } from "react-router-dom";
import { routeConfigs } from "@/config/routes";

// Lazy load all page components
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Quiz = lazy(() => import("@/pages/Quiz"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const Profile = lazy(() => import("@/pages/Profile"));
const Store = lazy(() => import("@/pages/Store"));
const Settings = lazy(() => import("@/pages/Settings"));
const BeetzInfo = lazy(() => import("@/pages/BeetzInfo"));
const SubscriptionPlans = lazy(() => import("@/pages/SubscriptionPlans"));
const GamificationDashboard = lazy(() => import("@/pages/GamificationDashboard"));
const Duels = lazy(() => import("@/pages/Duels"));
const Tournaments = lazy(() => import("@/pages/Tournaments"));
const GameMode = lazy(() => import("@/pages/GameMode"));
const NewFindOpponent = lazy(() => import("@/pages/NewFindOpponent"));

// FASE 1: Social Explosion - Lazy load social pages
const AchievementStoriesPage = lazy(() => import("@/pages/social/AchievementStoriesPage"));
const BattleRoyalePage = lazy(() => import("@/pages/social/BattleRoyalePage"));
const CommunityFeedPage = lazy(() => import("@/pages/social/CommunityFeedPage"));
const TournamentsPage = lazy(() => import("@/pages/social/TournamentsPage"));

// Component mapping
const componentMap = {
  Dashboard,
  Quiz,
  Leaderboard,
  Profile,
  Store,
  Settings,
  BeetzInfo,
  SubscriptionPlans,
  GamificationDashboard,
  Duels,
  Tournaments,
  GameMode,
  NewFindOpponent,
  // FASE 1: Social pages
  AchievementStoriesPage,
  BattleRoyalePage,
  CommunityFeedPage,
  TournamentsPage,
};

export function generateRoutes() {
  return routeConfigs.map((config) => {
    const Component = componentMap[config.component as keyof typeof componentMap];
    
    if (!Component) {
      console.warn(`Component ${config.component} not found in componentMap`);
      return null;
    }

    return (
      <Route
        key={config.path}
        path={config.path}
        element={<Component />}
      />
    );
  }).filter(Boolean);
}