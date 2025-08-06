import React, { useState } from "react";
import { useDailyMissions } from "@/hooks/use-daily-missions";
import { useMissionNavigation } from "@/hooks/use-mission-navigation";
import { useI18n } from "@/hooks/use-i18n";
import { MissionCarouselView } from "./mission-carousel-view";
import { MissionListView } from "./mission-list-view";
import { MissionCompactView } from "./mission-compact-view";
import { AdaptiveMission } from "@/hooks/use-daily-missions";

interface UnifiedDailyMissionsProps {
  userId?: string;
  displayMode?: 'carousel' | 'list' | 'compact';
  maxMissions?: number;
  showProgress?: boolean;
  showRewards?: boolean;
  onMissionClick?: (mission: AdaptiveMission) => void;
  className?: string;
}

export function UnifiedDailyMissions({
  userId,
  displayMode = 'list',
  maxMissions = 3,
  showProgress = true,
  showRewards = true,
  onMissionClick,
  className
}: UnifiedDailyMissionsProps) {
  const { t } = useI18n();
  const {
    adaptiveMissions,
    loading,
    completedToday,
    completionRate,
    timeUntilReset,
    getDifficultyColor,
    getCategoryIcon
  } = useDailyMissions();
  
  const { navigateToMission } = useMissionNavigation();

  const handleMissionClick = (mission: AdaptiveMission) => {
    if (onMissionClick) {
      onMissionClick(mission);
    } else {
      navigateToMission(mission);
    }
  };

  const displayMissions = adaptiveMissions.slice(0, maxMissions);

  const commonProps = {
    missions: displayMissions,
    loading,
    completedToday,
    completionRate,
    timeUntilReset,
    onMissionClick: handleMissionClick,
    getDifficultyColor,
    getCategoryIcon,
    showProgress,
    showRewards,
    className,
    t
  };

  switch (displayMode) {
    case 'carousel':
      return <MissionCarouselView {...commonProps} />;
    case 'compact':
      return <MissionCompactView {...commonProps} />;
    default:
      return <MissionListView {...commonProps} />;
  }
}
