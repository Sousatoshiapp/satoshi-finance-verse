import { memo, lazy, Suspense } from 'react';
import { ProfileStyleLoader } from '@/components/shared/ui/profile-style-loader';

// FASE 1: Social Explosion - Lazy load all social components
const AchievementStories = lazy(() => 
  import('@/components/features/stories/AchievementStories').then(module => ({
    default: module.AchievementStories
  }))
);

const BattleRoyaleMode = lazy(() => 
  import('@/components/features/battle-royale/BattleRoyaleMode').then(module => ({
    default: module.BattleRoyaleMode
  }))
);

const RecentWinsFeed = lazy(() => 
  import('@/components/features/recent-wins/RecentWinsFeed').then(module => ({
    default: module.RecentWinsFeed
  }))
);

const WeeklyTournament = lazy(() => 
  import('@/components/features/tournaments/WeeklyTournament').then(module => ({
    default: module.WeeklyTournament
  }))
);

// Optimized loader with Gen Z styling
const SocialLoader = memo(() => (
  <div className="flex items-center justify-center p-6">
    <div className="relative">
      <ProfileStyleLoader size="md" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-pulse text-xs text-muted-foreground font-medium">
          Loading...
        </div>
      </div>
    </div>
  </div>
));

// Lazy social section components with error boundaries
export const LazyAchievementStories = memo(() => (
  <Suspense fallback={<SocialLoader />}>
    <AchievementStories />
  </Suspense>
));

export const LazyBattleRoyaleMode = memo(() => (
  <Suspense fallback={<SocialLoader />}>
    <BattleRoyaleMode />
  </Suspense>
));

export const LazyRecentWinsFeed = memo(() => (
  <Suspense fallback={<SocialLoader />}>
    <RecentWinsFeed />
  </Suspense>
));

export const LazyWeeklyTournament = memo(() => (
  <Suspense fallback={<SocialLoader />}>
    <WeeklyTournament />
  </Suspense>
));

// Display names for debugging
LazyAchievementStories.displayName = 'LazyAchievementStories';
LazyBattleRoyaleMode.displayName = 'LazyBattleRoyaleMode';
LazyRecentWinsFeed.displayName = 'LazyRecentWinsFeed';
LazyWeeklyTournament.displayName = 'LazyWeeklyTournament';