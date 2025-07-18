// Simplified Lazy Loading
import { lazy } from 'react';

// Simple Lazy Routes  
export const LazyRoutes = {
  Welcome: lazy(() => import('@/pages/Welcome')),
  Auth: lazy(() => import('@/pages/Auth')),
  Dashboard: lazy(() => import('@/pages/Dashboard')),
  Profile: lazy(() => import('@/pages/Profile')),
  Quiz: lazy(() => import('@/pages/Quiz')),
  SoloQuiz: lazy(() => import('@/pages/SoloQuiz')),
  Duels: lazy(() => import('@/pages/Duels')),
  Leaderboard: lazy(() => import('@/pages/Leaderboard')),
  Social: lazy(() => import('@/pages/Social')),
  Settings: lazy(() => import('@/pages/Settings')),
  AdminDashboard: lazy(() => import('@/pages/AdminDashboard')),
  AdminSettings: lazy(() => import('@/pages/AdminSettings')),
  AdminUsersAll: lazy(() => import('@/pages/AdminUsersAll')),
  AdminUsersPremium: lazy(() => import('@/pages/AdminUsersPremium')),
  AdminUsersModeration: lazy(() => import('@/pages/AdminUsersModeration')),
  AdminFinanceRevenue: lazy(() => import('@/pages/AdminFinanceRevenue')),
  AdminFinanceBeetz: lazy(() => import('@/pages/AdminFinanceBeetz')),
  AdminFinanceSubscriptions: lazy(() => import('@/pages/AdminFinanceSubscriptions')),
  AdminFinanceReports: lazy(() => import('@/pages/AdminFinanceReports')),
  AdminQuizQuestions: lazy(() => import('@/pages/AdminQuizQuestions')),
  AdminQuizCategories: lazy(() => import('@/pages/AdminQuizCategories')),
  AdminSocialPosts: lazy(() => import('@/pages/AdminSocialPosts')),
  SatoshiCity: lazy(() => import('@/pages/SatoshiCity')),
  Tournaments: lazy(() => import('@/pages/Tournaments')),
  Store: lazy(() => import('@/pages/Store')),
  Marketplace: lazy(() => import('@/pages/Marketplace')),
  LivesMarketplace: lazy(() => import('@/pages/marketplace/Lives')),
  GameMode: lazy(() => import('@/pages/GameMode')),
  DistrictDetail: lazy(() => import('@/pages/DistrictDetail')),
  DistrictQuiz: lazy(() => import('@/pages/DistrictQuiz')),
  DistrictDuelPage: lazy(() => import('@/pages/DistrictDuelPage')),
  DistrictResidentsPage: lazy(() => import('@/pages/DistrictResidentsPage')),
  EnhancedQuiz: lazy(() => import('@/pages/EnhancedQuiz')),
  DuelQuiz: lazy(() => import('@/pages/DuelQuiz')),
  TournamentDetail: lazy(() => import('@/pages/TournamentDetail')),
  TournamentQuiz: lazy(() => import('@/pages/TournamentQuiz')),
  Playground: lazy(() => import('@/pages/Playground')),
  Missions: lazy(() => import('@/pages/Missions')),
  LootBoxes: lazy(() => import('@/pages/LootBoxes')),
  Guilds: lazy(() => import('@/pages/Guilds')),
  Levels: lazy(() => import('@/pages/Levels')),
  BeetzInfo: lazy(() => import('@/pages/BeetzInfo')),
  FindOpponent: lazy(() => import('@/pages/FindOpponent')),
  TournamentQuizSpecific: lazy(() => import('@/pages/TournamentQuizSpecific')),
  LearningAnalytics: lazy(() => import('@/pages/LearningAnalytics')),
  
  TestingHub: lazy(() => import('@/pages/TestingHub')),
  GamificationDashboard: lazy(() => import('@/pages/GamificationDashboard')),
  Achievements: lazy(() => import('@/pages/Achievements')),
  Leagues: lazy(() => import('@/pages/Leagues')),
  Powerups: lazy(() => import('@/pages/Powerups')),
  DailyChallenges: lazy(() => import('@/pages/DailyChallenges')),
  AITutor: lazy(() => import('@/pages/AITutor')),
  LearningPath: lazy(() => import('@/pages/LearningPath')),
  ContentGenerator: lazy(() => import('@/pages/ContentGenerator')),
  AISimulator: lazy(() => import('@/pages/AISimulator')),
  MonetizationDashboard: lazy(() => import('@/pages/MonetizationDashboard')),
  VirtualStore: lazy(() => import('@/pages/VirtualStore')),
  NFTMarketplace: lazy(() => import('@/pages/NFTMarketplace')),
  AffiliateProgram: lazy(() => import('@/pages/AffiliateProgram')),
  Wallet: lazy(() => import('@/pages/Wallet')),
  AdminGamification: lazy(() => import('@/pages/admin/AdminGamification')),
  AdminAIContent: lazy(() => import('@/pages/admin/AdminAIContent')),
  AdminMonetization: lazy(() => import('@/pages/admin/AdminMonetization')),
  AvatarDetail: lazy(() => import('@/pages/AvatarDetail')),
  BoostDetail: lazy(() => import('@/pages/BoostDetail')),
  SkinDetail: lazy(() => import('@/pages/SkinDetail')),
  AccessoryDetail: lazy(() => import('@/pages/AccessoryDetail')),
  PasswordReset: lazy(() => import('@/pages/PasswordReset'))
};