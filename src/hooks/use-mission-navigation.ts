import { useNavigate } from "react-router-dom";
import { AdaptiveMission } from "./use-daily-missions";

interface MissionNavigationSystem {
  navigateToMission: (mission: AdaptiveMission) => void;
  getOptimalPath: (missionType: string) => string;
  trackMissionEngagement: (missionId: string, action: string) => void;
}

export function useMissionNavigation(): MissionNavigationSystem {
  const navigate = useNavigate();

  const navigateToMission = (mission: AdaptiveMission) => {
    trackMissionEngagement(mission.id, 'clicked');
    
    switch (mission.category) {
      case 'quiz':
        if (mission.basedOnWeakness && mission.contextualHints.length > 0) {
          navigate(`/quiz?focus=${mission.contextualHints[0]}&mission=${mission.id}`);
        } else {
          navigate('/quiz');
        }
        break;
        
      case 'social':
        if (mission.mission_type === 'duel_wins') {
          navigate('/duels?mission_mode=true');
        } else if (mission.mission_type === 'chat_messages') {
          navigate('/social?tab=chat');
        } else {
          navigate('/social');
        }
        break;
        
      case 'exploration':
        if (mission.basedOnWeakness && mission.contextualHints.length > 0) {
          navigate(`/satoshi-city/${mission.contextualHints[0]}`);
        } else {
          navigate('/satoshi-city');
        }
        break;
        
      case 'streak':
        navigate('/profile?tab=achievements');
        break;
        
      default:
        navigate('/quiz');
    }
  };

  const getOptimalPath = (missionType: string): string => {
    const pathMap: Record<string, string> = {
      'correct_answers': '/quiz',
      'quiz_completion': '/quiz',
      'duel_wins': '/duels',
      'chat_messages': '/social?tab=chat',
      'daily_login': '/profile',
      'xp_earned': '/quiz'
    };
    
    return pathMap[missionType] || '/quiz';
  };

  const trackMissionEngagement = (missionId: string, action: string) => {
    console.log(`Mission engagement: ${missionId} - ${action}`);
  };

  return {
    navigateToMission,
    getOptimalPath,
    trackMissionEngagement
  };
}
