
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useGamification } from "@/hooks/use-gamification";
import { Trophy, ArrowRight, Star, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AchievementsCarousel() {
  const { achievements, loading, getRecentAchievements } = useGamification();
  const navigate = useNavigate();

  const recentAchievements = getRecentAchievements(6);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Conquistas Recentes</h3>
            <div className="animate-pulse h-4 w-16 bg-muted rounded"></div>
          </div>
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-24 h-32 bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">Conquistas Recentes</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/achievements')}
            className="text-primary hover:text-primary/80"
          >
            Ver Todas <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {recentAchievements.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground mb-2">Nenhuma conquista ainda</p>
            <Button variant="outline" size="sm" onClick={() => navigate('/levels')}>
              Começar Jornada
            </Button>
          </div>
        ) : (
          <Carousel className="w-full">
            <CarouselContent>
              {recentAchievements.map((achievement) => (
                <CarouselItem key={achievement.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <Card className="h-full bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="text-3xl">
                          {achievement.achievements.badge_icon || '🏆'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-yellow-800 mb-1">
                            {achievement.achievements.name}
                          </h4>
                          <p className="text-xs text-yellow-700 mb-2">
                            {achievement.achievements.description}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {new Date(achievement.earned_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        )}
      </CardContent>
    </Card>
  );
}
