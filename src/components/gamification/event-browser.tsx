import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { Progress } from "@/components/shared/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shared/ui/avatar";
import { useEvents } from "@/hooks/use-events";
import { 
  Calendar, 
  Trophy, 
  Users, 
  Clock, 
  Star, 
  Target, 
  Gift,
  PlayCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export function EventBrowser() {
  const { 
    events, 
    userParticipations, 
    eventLeaderboards, 
    loading, 
    joinEvent,
    claimEventRewards,
    getEventTypeIcon,
    getEventStatusColor
  } = useEvents();

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeEvents = events.filter(e => e.status === 'active');
  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const endedEvents = events.filter(e => e.status === 'ended');

  return (
    <div className="space-y-6">
      {/* Eventos Ativos em Destaque */}
      {activeEvents.length > 0 && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <PlayCircle className="h-5 w-5" />
              Eventos Ativos Agora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeEvents.map((event) => {
                const userParticipation = userParticipations.find(p => p.event_id === event.id);
                const timeLeft = new Date(event.end_time).getTime() - Date.now();
                const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

                return (
                  <Card key={event.id} className="border-2 border-green-300 bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="text-2xl">{getEventTypeIcon(event.event_type)}</div>
                          <div>
                            <div className="font-medium">{event.name}</div>
                            <Badge variant="outline" className="text-xs bg-green-100">
                              {event.event_type}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            {hoursLeft}h {minutesLeft}m
                          </div>
                          <div className="text-xs text-muted-foreground">restante</div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.current_participants} participantes
                        </span>
                        {event.max_participants && (
                          <span className="text-muted-foreground">
                            máx. {event.max_participants}
                          </span>
                        )}
                      </div>
                      
                      {userParticipation ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Participando
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Seu Score:</span>
                            <span className="font-medium">{userParticipation.final_score}</span>
                          </div>
                          {userParticipation.rank_position && (
                            <div className="flex justify-between text-sm">
                              <span>Posição:</span>
                              <span className="font-medium">#{userParticipation.rank_position}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Button 
                          onClick={() => joinEvent(event.id)}
                          className="w-full"
                          size="sm"
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Participar
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs de Eventos */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Próximos</TabsTrigger>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="ended">Finalizados</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <Card key={event.id} className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{getEventTypeIcon(event.event_type)}</div>
                            <div>
                              <div className="font-medium">{event.name}</div>
                              <Badge variant="outline" className="text-xs">
                                {event.event_type}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-blue-600">
                              {new Date(event.start_time).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(event.start_time).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {event.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.max_participants ? `Máx. ${event.max_participants}` : 'Ilimitado'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.floor((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / (1000 * 60 * 60))}h
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <div className="flex items-center gap-1 text-sm">
                            <Gift className="h-3 w-3" />
                            <span>Recompensas disponíveis</span>
                          </div>
                          <Button variant="outline" size="sm">
                            <Target className="h-4 w-4 mr-2" />
                            Mais detalhes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum evento próximo</p>
                  <p className="text-sm">Fique atento às novidades!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Eventos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeEvents.length > 0 ? (
                <div className="space-y-4">
                  {activeEvents.map((event) => {
                    const leaderboard = eventLeaderboards[event.id] || [];
                    const userParticipation = userParticipations.find(p => p.event_id === event.id);
                    
                    return (
                      <Card key={event.id} className="border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{getEventTypeIcon(event.event_type)}</div>
                              <div>
                                <div className="font-medium">{event.name}</div>
                                <Badge variant="outline" className="text-xs bg-green-100">
                                  {event.event_type}
                                </Badge>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-800">
                              Ativo
                            </Badge>
                          </div>
                          
                          {leaderboard.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Trophy className="h-4 w-4" />
                                Ranking Atual
                              </div>
                              <div className="space-y-1">
                                {leaderboard.slice(0, 5).map((player, index) => (
                                  <div key={player.user_id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium w-6">#{index + 1}</span>
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={player.profile_image_url} />
                                        <AvatarFallback>{player.nickname[0]}</AvatarFallback>
                                      </Avatar>
                                      <span>{player.nickname}</span>
                                    </div>
                                    <span className="font-medium">{player.final_score}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {userParticipation ? (
                            <div className="mt-4 p-3 bg-green-50 rounded-lg">
                              <div className="flex items-center gap-2 text-sm text-green-700 mb-2">
                                <CheckCircle className="h-4 w-4" />
                                Você está participando
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Score:</span>
                                  <span className="font-medium ml-2">{userParticipation.final_score}</span>
                                </div>
                                {userParticipation.rank_position && (
                                  <div>
                                    <span className="text-muted-foreground">Posição:</span>
                                    <span className="font-medium ml-2">#{userParticipation.rank_position}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <Button 
                              onClick={() => joinEvent(event.id)}
                              className="w-full mt-4"
                              size="sm"
                            >
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Participar Agora
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <PlayCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum evento ativo</p>
                  <p className="text-sm">Aguarde novos eventos começarem!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ended" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Eventos Finalizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {endedEvents.length > 0 ? (
                <div className="space-y-4">
                  {endedEvents.map((event) => {
                    const userParticipation = userParticipations.find(p => p.event_id === event.id);
                    
                    return (
                      <Card key={event.id} className="border-gray-200 bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl opacity-50">{getEventTypeIcon(event.event_type)}</div>
                              <div>
                                <div className="font-medium">{event.name}</div>
                                <Badge variant="outline" className="text-xs">
                                  {event.event_type}
                                </Badge>
                              </div>
                            </div>
                            <Badge variant="secondary">
                              Finalizado
                            </Badge>
                          </div>
                          
                          {userParticipation ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                Você participou
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Score Final:</span>
                                  <span className="font-medium ml-2">{userParticipation.final_score}</span>
                                </div>
                                {userParticipation.rank_position && (
                                  <div>
                                    <span className="text-muted-foreground">Posição:</span>
                                    <span className="font-medium ml-2">#{userParticipation.rank_position}</span>
                                  </div>
                                )}
                              </div>
                              
                              {!userParticipation.rewards_claimed && (
                                <Button 
                                  onClick={() => claimEventRewards(event.id)}
                                  size="sm"
                                  className="mt-2"
                                >
                                  <Gift className="h-4 w-4 mr-2" />
                                  Coletar Recompensas
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Você não participou deste evento
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum evento finalizado</p>
                  <p className="text-sm">Histórico de eventos aparecerá aqui</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
