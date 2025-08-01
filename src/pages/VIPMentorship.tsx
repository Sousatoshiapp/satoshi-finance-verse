import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shared/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { Crown, Star, Calendar, Clock, Video, MessageCircle, ArrowLeft, Award, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Mentor {
  id: string;
  name: string;
  avatar: string;
  title: string;
  expertise: string[];
  rating: number;
  students: number;
  hourlyRate: number;
  experience: string;
  description: string;
  nextAvailable: Date;
  verified: boolean;
}

interface Session {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorAvatar: string;
  date: Date;
  duration: number;
  topic: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  type: 'individual' | 'group';
}

export default function VIPMentorship() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMentorshipData();
  }, []);

  const loadMentorshipData = async () => {
    // Mock data
    const mockMentors: Mentor[] = [
      {
        id: '1',
        name: 'Dr. Ana Silva',
        avatar: '/placeholder-avatar.jpg',
        title: 'Especialista em DeFi',
        expertise: ['DeFi', 'Yield Farming', 'Smart Contracts'],
        rating: 4.9,
        students: 156,
        hourlyRate: 150,
        experience: '8 anos',
        description: 'Ex-executiva do Binance com mais de 8 anos de experiência em DeFi e protocolos de yield farming.',
        nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000),
        verified: true
      },
      {
        id: '2',
        name: 'Carlos Bitcoin',
        avatar: '/placeholder-avatar.jpg',
        title: 'Trading Expert',
        expertise: ['Day Trading', 'Análise Técnica', 'Risk Management'],
        rating: 4.8,
        students: 234,
        hourlyRate: 120,
        experience: '10 anos',
        description: 'Trader profissional com track record comprovado e mais de $2M em lucros acumulados.',
        nextAvailable: new Date(Date.now() + 12 * 60 * 60 * 1000),
        verified: true
      },
      {
        id: '3',
        name: 'Maria Crypto',
        avatar: '/placeholder-avatar.jpg',
        title: 'Blockchain Developer',
        expertise: ['Blockchain', 'Web3', 'NFTs'],
        rating: 4.7,
        students: 89,
        hourlyRate: 180,
        experience: '6 anos',
        description: 'Desenvolvedora sênior com experiência em projetos blockchain de grande escala.',
        nextAvailable: new Date(Date.now() + 48 * 60 * 60 * 1000),
        verified: true
      }
    ];

    const mockSessions: Session[] = [
      {
        id: '1',
        mentorId: '1',
        mentorName: 'Dr. Ana Silva',
        mentorAvatar: '/placeholder-avatar.jpg',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        duration: 60,
        topic: 'Estratégias de Yield Farming',
        status: 'scheduled',
        type: 'individual'
      },
      {
        id: '2',
        mentorId: '2',
        mentorName: 'Carlos Bitcoin',
        mentorAvatar: '/placeholder-avatar.jpg',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        duration: 90,
        topic: 'Análise Técnica Avançada',
        status: 'completed',
        type: 'individual'
      }
    ];

    setTimeout(() => {
      setMentors(mockMentors);
      setSessions(mockSessions);
      setLoading(false);
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">Agendada</Badge>;
      case 'completed': return <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Concluída</Badge>;
      case 'cancelled': return <Badge className="bg-red-500/10 text-red-500 border-red-500/30">Cancelada</Badge>;
      default: return <Badge variant="outline">Pendente</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-muted/30 rounded-lg p-6 h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Crown className="h-6 w-6 text-yellow-500" />
                Programa VIP de Mentoria
              </h1>
              <p className="text-muted-foreground">Aprenda diretamente com os melhores especialistas do mercado</p>
            </div>
          </div>

          {/* VIP Benefits Banner */}
          <Card className="mb-6 border-yellow-500/30 bg-gradient-to-r from-background to-yellow-500/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Benefícios VIP Exclusivos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-blue-500" />
                      Sessões 1:1 com especialistas
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-500" />
                      Chat privado 24/7
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-purple-500" />
                      Certificados exclusivos
                    </div>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  Ativar VIP
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="mentors" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mentors">Mentores</TabsTrigger>
              <TabsTrigger value="sessions">Minhas Sessões</TabsTrigger>
              <TabsTrigger value="progress">Progresso</TabsTrigger>
            </TabsList>

            <TabsContent value="mentors" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {mentors.map((mentor) => (
                  <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={mentor.avatar} />
                          <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{mentor.name}</h3>
                            {mentor.verified && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{mentor.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-3 w-3 ${i < Math.floor(mentor.rating) ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {mentor.rating} ({mentor.students} estudantes)
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{mentor.description}</p>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>Experiência:</span>
                          <span className="font-medium">{mentor.experience}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Valor/hora:</span>
                          <span className="font-medium text-green-500">${mentor.hourlyRate}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Próxima disponibilidade:</span>
                          <span className="font-medium">
                            {mentor.nextAvailable.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {mentor.expertise.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <Button className="w-full">
                          <Calendar className="h-4 w-4 mr-2" />
                          Agendar Sessão
                        </Button>
                        <Button variant="outline" className="w-full">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Enviar Mensagem
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              <div className="space-y-4">
                {sessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={session.mentorAvatar} />
                            <AvatarFallback>{session.mentorName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{session.topic}</h3>
                            <p className="text-sm text-muted-foreground">
                              com {session.mentorName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(session.status)}
                          <div className="text-sm text-muted-foreground mt-1">
                            {session.type === 'individual' ? 'Individual' : 'Grupo'}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Data</div>
                          <div className="font-medium">{session.date.toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Horário</div>
                          <div className="font-medium">{session.date.toLocaleTimeString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Duração</div>
                          <div className="font-medium">{session.duration} min</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Ações</div>
                          <div className="flex gap-2">
                            {session.status === 'scheduled' && (
                              <>
                                <Button size="sm" variant="outline">
                                  <Video className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Calendar className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            {session.status === 'completed' && (
                              <Button size="sm" variant="outline">
                                Ver Gravação
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {sessions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Nenhuma sessão agendada</p>
                  <p className="text-sm">Agende sua primeira mentoria com um especialista!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="progress" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas Gerais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Sessões realizadas:</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Horas de mentoria:</span>
                        <span className="font-medium">18h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mentores diferentes:</span>
                        <span className="font-medium">3</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Certificados obtidos:</span>
                        <span className="font-medium">2</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Próximos Objetivos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 border rounded-lg">
                        <div className="font-medium mb-1">DeFi Avançado</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Complete 5 sessões sobre protocolos DeFi
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">3/5 sessões</div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="font-medium mb-1">Trading Master</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Atinja 80% de winrate em trades simulados
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">75% atual</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <FloatingNavbar />
    </div>
  );
}
