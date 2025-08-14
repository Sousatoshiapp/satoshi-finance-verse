import { lazy } from "react";
import { Route } from "react-router-dom";
import { routeConfigs } from "@/config/routes";

// Lazy load all page components
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Quiz = lazy(() => import("@/pages/Quiz"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const Profile = lazy(() => import("@/pages/Profile"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const Store = lazy(() => import("@/pages/Store"));
const Messages = lazy(() => import("@/pages/Messages"));
const DirectChatWrapper = lazy(() => import("@/pages/DirectChatWrapper"));
const Settings = lazy(() => import("@/pages/Settings"));
const BeetzInfo = lazy(() => import("@/pages/BeetzInfo"));
const SubscriptionPlans = lazy(() => import("@/pages/SubscriptionPlans"));
const GamificationDashboard = lazy(() => import("@/pages/GamificationDashboard"));
const Duels = lazy(() => import("@/pages/Duels"));
const Tournaments = lazy(() => import("@/pages/Tournaments"));
const SatoshiCity = lazy(() => import("@/pages/SatoshiCity"));
const GameMode = lazy(() => import("@/pages/GameMode"));
const NewFindOpponent = lazy(() => import("@/pages/NewFindOpponent"));

// FASE 1: Social Explosion - Lazy load social pages
const Social = lazy(() => import("@/pages/Social"));
const SocialHub = lazy(() => import("@/pages/social/SocialHub"));
const AchievementStoriesPage = lazy(() => import("@/pages/social/AchievementStoriesPage"));
const BattleRoyalePage = lazy(() => import("@/pages/social/BattleRoyalePage"));
const CommunityFeedPage = lazy(() => import("@/pages/social/CommunityFeedPage"));
const TournamentsPage = lazy(() => import("@/pages/social/TournamentsPage"));

// FASE 2: Avatar 2.0 & Profile Flexing pages
const ProfileCustomization = lazy(() => import("@/pages/ProfileCustomization"));
const HallOfFame = lazy(() => import("@/pages/HallOfFame"));
const AvatarEditor = lazy(() => import("@/pages/AvatarEditor"));
const AvatarCollection = lazy(() => import("@/pages/AvatarCollection"));

// FASE 3: Dopamine Hits pages
const SoloQuiz = lazy(() => import("@/pages/quiz/SoloQuiz"));
const FindOpponent = lazy(() => import("@/pages/FindOpponent"));
const DopamineHitsShowcase = lazy(() => import("@/pages/gamification/DopamineHitsShowcase"));
const ConceptConnectionsPage = lazy(() => import("@/pages/ConceptConnectionsPage"));

// Duels
const SelectOpponentScreen = lazy(() => import("@/pages/SelectOpponentScreen"));

// FASE 4 & 5: New features
const InfluencerProgram = lazy(() => import("@/pages/InfluencerProgram"));
const GuildWars = lazy(() => import("@/pages/GuildWars"));
const ViralChallenges = lazy(() => import("@/pages/ViralChallenges"));
const MemeEconomy = lazy(() => import("@/pages/MemeEconomy"));

// Component mapping
const componentMap = {
  Dashboard,
  Quiz,
  Leaderboard,
  Profile,
  UserProfile,
  Store,
  Messages,
  DirectChatWrapper,
  Settings,
  BeetzInfo,
  SubscriptionPlans,
  GamificationDashboard,
  Duels,
  Tournaments,
  SatoshiCity,
  GameMode,
  NewFindOpponent,
  // FASE 1: Social pages
  Social,
  SocialHub,
  AchievementStoriesPage,
  BattleRoyalePage,
  CommunityFeedPage,
  TournamentsPage,
  // FASE 2: Avatar 2.0 & Profile Flexing
  ProfileCustomization,
  HallOfFame,
  AvatarEditor,
  AvatarCollection,
  // FASE 3: Dopamine Hits
  SoloQuiz,
  FindOpponent,
  DopamineHitsShowcase,
  ConceptConnectionsPage,
  // Duels
  SelectOpponentScreen,
  // FASE 4 & 5: New features
  InfluencerProgram,
  GuildWars,
  ViralChallenges,
  MemeEconomy,
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