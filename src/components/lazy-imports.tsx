import { lazy } from 'react';

// Dashboard Components
export const Dashboard = lazy(() => import('@/pages/Dashboard'));

// Game Components  
export const Quiz = lazy(() => import('@/pages/Quiz'));
export const EnhancedQuiz = lazy(() => import('@/pages/EnhancedQuiz'));
export const SoloQuiz = lazy(() => import('@/pages/SoloQuiz'));
export const Tournaments = lazy(() => import('@/pages/Tournaments'));
export const TournamentDetail = lazy(() => import('@/pages/TournamentDetail'));
export const TournamentQuizSpecific = lazy(() => import('@/pages/TournamentQuizSpecific'));
export const FindOpponent = lazy(() => import('@/pages/FindOpponent'));
export const GameMode = lazy(() => import('@/pages/GameMode'));
export const BtcDuel = lazy(() => import('@/pages/BtcDuel'));
export const ConceptConnectionsPage = lazy(() => import('@/pages/ConceptConnectionsPage'));
export const CasinoDuelScreen = lazy(() => import('@/pages/CasinoDuelScreen'));
export const SelectOpponentScreen = lazy(() => import('@/pages/SelectOpponentScreen'));

// Store Components
export const Store = lazy(() => import('@/pages/Store'));
export const Inventory = lazy(() => import('@/pages/Inventory'));

// District Components
export const DistrictDetail = lazy(() => import('@/pages/DistrictDetail'));

// Gamification Components  
export const Leaderboard = lazy(() => import('@/pages/Leaderboard'));
export const Achievements = lazy(() => import('@/pages/Achievements'));



// Detail Components
export const Profile = lazy(() => import('@/pages/Profile'));
export const UserProfile = lazy(() => import('@/pages/UserProfile'));
export const Settings = lazy(() => import('@/pages/Settings'));
export const Wallet = lazy(() => import('@/pages/Wallet'));




// Duel Components
export const DuelResultScreen = lazy(() => import('@/pages/DuelResultScreen'));

// Chat Components
export const Messages = lazy(() => import('@/pages/Messages'));
export const DirectChatWrapper = lazy(() => import('@/pages/DirectChatWrapper'));
