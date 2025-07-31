import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { 
  StreakIcon, 
  TrophyIcon, 
  LightningIcon, 
  GiftIcon, 
  StarIcon, 
  DiamondIcon, 
  SwordIcon, 
  CrownIcon, 
  TargetIcon, 
  ShieldIcon, 
  RocketIcon 
} from '@/components/icons/game-icons';

// Componente de demonstração dos ícones personalizados
export function IconShowcase() {
  const icons = [
    { name: 'Streak (🔥)', component: StreakIcon, description: 'Sequência de dias', usage: 'Streaks, progresso diário' },
    { name: 'Trophy (🏆)', component: TrophyIcon, description: 'Conquistas e vitórias', usage: 'Achievements, rankings' },
    { name: 'Lightning (⚡)', component: LightningIcon, description: 'Experiência e energia', usage: 'XP, power-ups' },
    { name: 'Gift (🎁)', component: GiftIcon, description: 'Recompensas e presentes', usage: 'Loot boxes, prêmios' },
    { name: 'Star (⭐)', component: StarIcon, description: 'Favoritos e qualidade', usage: 'Ratings, favoritos' },
    { name: 'Diamond (💎)', component: DiamondIcon, description: 'Itens preciosos', usage: 'Premium, raros' },
    { name: 'Sword (⚔️)', component: SwordIcon, description: 'Combate e duelos', usage: 'Duelos, PvP' },
    { name: 'Crown (👑)', component: CrownIcon, description: 'Liderança e status', usage: 'Ranks, líderes' },
    { name: 'Target (🎯)', component: TargetIcon, description: 'Objetivos e metas', usage: 'Missões, objetivos' },
    { name: 'Shield (🛡️)', component: ShieldIcon, description: 'Proteção e defesa', usage: 'Proteção, seguros' },
    { name: 'Rocket (🚀)', component: RocketIcon, description: 'Boost e aceleração', usage: 'Boosts, melhorias' },
  ];

  const variants = ['default', 'glow', 'pulse'] as const;
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Ícones Personalizados do Satoshi Finance Game</h1>
        <p className="text-muted-foreground">Sistema cyberpunk/tech com gradientes e animações</p>
      </div>

      {/* Demonstração de todos os ícones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {icons.map((icon) => {
          const IconComponent = icon.component;
          return (
            <Card key={icon.name} className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-center mb-3">
                  <IconComponent size="2xl" animated variant="glow" />
                </div>
                <CardTitle className="text-lg text-center">{icon.name}</CardTitle>
                <p className="text-sm text-muted-foreground text-center">{icon.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs">{icon.usage}</Badge>
                  
                  {/* Variações de tamanho */}
                  <div className="flex items-center justify-center gap-2 pt-2">
                    {sizes.slice(0, 4).map((size) => (
                      <IconComponent key={size} size={size} variant="glow" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Demonstração de variantes */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Variantes de Animação</CardTitle>
          <p className="text-sm text-muted-foreground">
            Diferentes estilos visuais disponíveis para cada ícone
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            {variants.map((variant) => (
              <div key={variant} className="text-center space-y-3">
                <h3 className="font-semibold capitalize">{variant}</h3>
                <div className="flex items-center justify-center gap-3">
                  <StreakIcon size="lg" variant={variant} animated={variant === 'pulse'} />
                  <TrophyIcon size="lg" variant={variant} animated={variant === 'pulse'} />
                  <LightningIcon size="lg" variant={variant} animated={variant === 'pulse'} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {variant === 'default' && 'Padrão sem efeitos'}
                  {variant === 'glow' && 'Brilho suave ao redor'}
                  {variant === 'pulse' && 'Pulsação animada'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demonstração de uso em contexto */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Exemplos de Uso em Contexto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Streak Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full">
            <StreakIcon size="sm" animated variant="glow" />
            <span className="font-semibold">15 dias</span>
          </div>

          {/* Achievement Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full">
            <TrophyIcon size="sm" animated variant="glow" />
            <span className="font-semibold">Conquista Desbloqueada!</span>
          </div>

          {/* XP Gain */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full">
            <LightningIcon size="sm" animated variant="glow" />
            <span className="font-semibold">+500 XP</span>
          </div>

          {/* Loot Box */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full">
            <GiftIcon size="sm" animated variant="glow" />
            <span className="font-semibold">Loot Box Disponível!</span>
          </div>
        </CardContent>
      </Card>

      {/* Antes e Depois */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Comparação: Antes vs Depois</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center space-y-3">
              <h3 className="font-semibold">Emojis Antigos</h3>
              <div className="text-4xl space-x-2">
                <span>🔥</span>
                <span>🏆</span>
                <span>⚡</span>
                <span>🎁</span>
                <span>⭐</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Emojis padrão do sistema, sem personalização
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <h3 className="font-semibold">Ícones Personalizados</h3>
              <div className="flex items-center justify-center gap-3">
                <StreakIcon size="xl" animated variant="glow" />
                <TrophyIcon size="xl" animated variant="glow" />
                <LightningIcon size="xl" animated variant="glow" />
                <GiftIcon size="xl" animated variant="glow" />
                <StarIcon size="xl" animated variant="glow" />
              </div>
              <p className="text-sm text-muted-foreground">
                Design cyberpunk com cores do app e animações
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
