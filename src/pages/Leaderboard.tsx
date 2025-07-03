import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import satoshiMascot from "@/assets/satoshi-mascot.png";

interface LeaderboardUser {
  id: string;
  nickname: string;
  level: number;
  xp: number;
  streak: number;
  avatar: string;
}

export default function Leaderboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('week');
  const navigate = useNavigate();

  // Mock leaderboard data
  const mockUsers: LeaderboardUser[] = [
    { id: '1', nickname: 'FinanceGuru', level: 12, xp: 2450, streak: 45, avatar: '👑' },
    { id: '2', nickname: 'CoinMaster', level: 10, xp: 2100, streak: 32, avatar: '💰' },
    { id: '3', nickname: 'InvestorPro', level: 9, xp: 1890, streak: 28, avatar: '📈' },
    { id: '4', nickname: 'SavingHero', level: 8, xp: 1650, streak: 25, avatar: '🏦' },
    { id: '5', nickname: 'BudgetBoss', level: 7, xp: 1420, streak: 22, avatar: '📊' },
    { id: 'user', nickname: 'Você', level: 3, xp: 245, streak: 7, avatar: '🎯' }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('satoshi_user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const sortedUsers = mockUsers.sort((a, b) => b.xp - a.xp);
  const userRank = sortedUsers.findIndex(user => user.id === 'user') + 1;

  const getRankIcon = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈'; 
    if (position === 3) return '🥉';
    return `#${position}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                ← Dashboard
              </Button>
              <h1 className="text-xl font-bold text-foreground">Ranking</h1>
            </div>
            
            <div className="flex gap-2">
              {(['week', 'month', 'all'] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={timeFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeFilter(filter)}
                >
                  {filter === 'week' ? 'Semana' : filter === 'month' ? 'Mês' : 'Geral'}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Your Position */}
        {currentUser && (
          <Card className="p-6 mb-8 border-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-primary">#{userRank}</div>
                <Avatar className="w-12 h-12">
                  <img src={satoshiMascot} alt="Você" />
                </Avatar>
                <div>
                  <h3 className="font-bold text-foreground">{currentUser.nickname} (Você)</h3>
                  <p className="text-sm text-muted-foreground">
                    Nível {currentUser.level} • {currentUser.xp} XP
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge>🔥 {currentUser.streak} dias</Badge>
              </div>
            </div>
          </Card>
        )}

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {sortedUsers.slice(0, 3).map((user, index) => (
            <Card key={user.id} className={`p-6 text-center ${
              index === 0 ? 'border-yellow-500 bg-yellow-500/5' :
              index === 1 ? 'border-gray-400 bg-gray-400/5' :
              'border-orange-500 bg-orange-500/5'
            }`}>
              <div className="text-4xl mb-2">{getRankIcon(index + 1)}</div>
              <Avatar className="w-16 h-16 mx-auto mb-3">
                <div className="text-2xl">{user.avatar}</div>
              </Avatar>
              <h3 className="font-bold text-foreground mb-1">{user.nickname}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Nível {user.level}
              </p>
              <div className="text-lg font-bold text-primary">{user.xp} XP</div>
              <Badge variant="outline" className="mt-2">
                🔥 {user.streak}
              </Badge>
            </Card>
          ))}
        </div>

        {/* Full Leaderboard */}
        <Card className="p-6">
          <h3 className="font-bold text-foreground mb-6">Ranking Completo</h3>
          <div className="space-y-4">
            {sortedUsers.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                  user.id === 'user' 
                    ? 'bg-primary/10 border border-primary' 
                    : 'bg-muted/20 hover:bg-muted/40'
                }`}
              >
                <div className="w-8 text-center font-bold text-foreground">
                  {getRankIcon(index + 1)}
                </div>
                
                <Avatar className="w-10 h-10">
                  {user.id === 'user' ? (
                    <img src={satoshiMascot} alt={user.nickname} />
                  ) : (
                    <div className="text-lg">{user.avatar}</div>
                  )}
                </Avatar>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">
                    {user.nickname}
                    {user.id === 'user' && <span className="text-primary ml-2">(Você)</span>}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Nível {user.level} • {user.xp} XP
                  </p>
                </div>
                
                <div className="text-right">
                  <Badge variant="outline">
                    🔥 {user.streak}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}