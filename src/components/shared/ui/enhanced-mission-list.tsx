import React, { memo, useMemo } from 'react';
import { VirtualList } from './virtual-list';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Progress } from './progress';
import { Trophy, Clock, Star } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface EnhancedMissionListProps {
  missions: any[];
  onMissionClick: (missionId: string) => void;
  height?: number;
  itemHeight?: number;
}

export const EnhancedMissionList = memo(({
  missions,
  onMissionClick,
  height = 400,
  itemHeight = 120
}: EnhancedMissionListProps) => {
  const renderMission = useMemo(() => (mission: any) => (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer mb-3"
      onClick={() => onMissionClick(mission.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">{mission.title}</h3>
            <p className="text-xs text-muted-foreground mb-2">{mission.description}</p>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant={mission.difficulty === 'easy' ? 'secondary' : 
                        mission.difficulty === 'medium' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {mission.difficulty}
              </Badge>
              
              {mission.is_special && (
                <Badge variant="outline" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Especial
                </Badge>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progresso</span>
                <span>{mission.progress || 0}%</span>
              </div>
              <Progress value={mission.progress || 0} className="h-2" />
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 ml-4">
            <div className="flex items-center gap-1 text-orange-500">
              <Trophy className="h-4 w-4" />
              <span className="text-sm font-medium">{mission.reward_xp} XP</span>
            </div>
            
            {mission.time_limit && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="text-xs">{mission.time_limit}h</span>
              </div>
            )}
            
            <Badge 
              variant={mission.completed ? 'default' : 'outline'}
              className={cn(
                "text-xs",
                mission.completed && "bg-green-500 text-white"
              )}
            >
              {mission.completed ? 'Completa' : 'Ativa'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  ), [onMissionClick]);

  return (
    <VirtualList
      items={missions}
      itemHeight={itemHeight}
      height={height}
      renderItem={renderMission}
      className="space-y-3"
    />
  );
});

EnhancedMissionList.displayName = 'EnhancedMissionList';
