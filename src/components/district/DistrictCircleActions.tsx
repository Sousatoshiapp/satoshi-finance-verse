import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Target, BookOpen, Building, Crown, Sword, ShoppingBag,
  GraduationCap, DoorOpen, School, Users, Trophy, Book,
  Cpu, Key, Link, Diamond, Zap, Image,
  Calculator, CreditCard, Vault, Shield, TrendingUp, PiggyBank,
  Home, KeyRound, Building2, Handshake, MapPin, Landmark,
  Globe, Plane, Earth, Users2, Flag, Ship,
  Smartphone, Monitor, Beaker, Rocket, Code, CircuitBoard
} from 'lucide-react';
import { useSponsorTheme } from '@/contexts/SponsorThemeProvider';

interface ActionCircleProps {
  action: string;
  districtTheme: string;
  districtId: string;
  isLocked?: boolean;
}

const iconMap = {
  target: Target,
  'door-open': DoorOpen,
  building: Building,
  crown: Crown,
  sword: Sword,
  'shopping-bag': ShoppingBag,
  'graduation-cap': GraduationCap,
  'book-open': BookOpen,
  school: School,
  users: Users,
  trophy: Trophy,
  book: Book,
  cpu: Cpu,
  key: Key,
  link: Link,
  diamond: Diamond,
  zap: Zap,
  image: Image,
  calculator: Calculator,
  'credit-card': CreditCard,
  vault: Vault,
  shield: Shield,
  'trending-up': TrendingUp,
  'piggy-bank': PiggyBank,
  home: Home,
  'key-round': KeyRound,
  'building-2': Building2,
  handshake: Handshake,
  'map-pin': MapPin,
  landmark: Landmark,
  globe: Globe,
  plane: Plane,
  earth: Earth,
  'users-2': Users2,
  flag: Flag,
  ship: Ship,
  smartphone: Smartphone,
  monitor: Monitor,
  beaker: Beaker,
  rocket: Rocket,
  code: Code,
  'circuit-board': CircuitBoard,
};

const ActionCircle: React.FC<ActionCircleProps> = ({ 
  action, 
  districtTheme, 
  districtId, 
  isLocked = false 
}) => {
  const navigate = useNavigate();
  const { getTheme } = useSponsorTheme();
  const theme = getTheme(districtTheme);
  const actionTheme = theme.actionThemes[action as keyof typeof theme.actionThemes];
  
  if (!actionTheme) return null;

  const IconComponent = iconMap[actionTheme.icon as keyof typeof iconMap] || Target;

  const handleClick = () => {
    if (isLocked) return;
    
    switch (action) {
      case 'quiz':
        navigate(`/district/${districtId}/quiz`);
        break;
      case 'account':
        if (theme.name === 'XP Investimentos') {
          window.open('https://xpi.com.br', '_blank');
        }
        break;
      case 'access':
        navigate(`/district/${districtId}`);
        break;
      case 'members':
        navigate(`/district/${districtId}/residents`);
        break;
      case 'duels':
        navigate(`/district/${districtId}/duels`);
        break;
      case 'store':
        navigate('/store');
        break;
    }
  };

  return (
    <motion.div
      className="relative group cursor-pointer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Círculo principal */}
      <motion.div
        className={`
          w-32 h-32 md:w-40 md:h-40 rounded-full 
          bg-gradient-to-br from-white/20 to-white/5
          backdrop-blur-md border border-white/30
          flex flex-col items-center justify-center
          shadow-2xl relative overflow-hidden
          ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]'}
        `}
        style={{
          boxShadow: isLocked ? undefined : `0 0 30px ${theme.primaryColor}40`,
        }}
        animate={{
          boxShadow: isLocked ? undefined : [
            `0 0 20px ${theme.primaryColor}20`,
            `0 0 40px ${theme.primaryColor}40`,
            `0 0 20px ${theme.primaryColor}20`,
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Efeito de brilho pulsante */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${theme.primaryColor}20 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Ícone */}
        <IconComponent 
          className="w-8 h-8 md:w-10 md:h-10 mb-2 z-10 text-white drop-shadow-lg" 
          style={{ color: theme.accentColor }}
        />
        
        {/* Texto */}
        <span 
          className="text-xs md:text-sm font-bold text-center px-2 z-10 text-white drop-shadow-lg"
          style={{ color: 'white' }}
        >
          {actionTheme.name}
        </span>

        {/* Efeito de partículas */}
        {!isLocked && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  backgroundColor: theme.accentColor,
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        )}

        {/* Lock overlay se bloqueado */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
        )}
      </motion.div>

      {/* Tooltip */}
      <motion.div
        className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 
                   bg-black/80 backdrop-blur-sm text-white text-xs rounded-lg 
                   px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity
                   whitespace-nowrap z-20"
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
      >
        {actionTheme.description}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 
                        w-2 h-2 bg-black/80 rotate-45"></div>
      </motion.div>
    </motion.div>
  );
};

interface DistrictCircleActionsProps {
  districtTheme: string;
  districtId: string;
  userLevel?: number;
}

export const DistrictCircleActions: React.FC<DistrictCircleActionsProps> = ({
  districtTheme,
  districtId,
  userLevel = 1
}) => {
  const actions = ['quiz', 'account', 'access', 'members', 'duels', 'store'];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative w-full h-full max-w-4xl max-h-4xl pointer-events-auto">
        {/* Posicionamento dos círculos em formação hexagonal */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2">
          <ActionCircle action="quiz" districtTheme={districtTheme} districtId={districtId} />
        </div>
        
        <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2">
          <ActionCircle action="account" districtTheme={districtTheme} districtId={districtId} />
        </div>
        
        <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2">
          <ActionCircle action="access" districtTheme={districtTheme} districtId={districtId} />
        </div>
        
        <div className="absolute bottom-1/4 left-1/3 transform translate-x-1/2">
          <ActionCircle action="members" districtTheme={districtTheme} districtId={districtId} />
        </div>
        
        <div className="absolute bottom-1/4 right-1/3 transform -translate-x-1/2">
          <ActionCircle action="duels" districtTheme={districtTheme} districtId={districtId} />
        </div>
        
        <div className="absolute bottom-1/6 left-1/2 transform -translate-x-1/2">
          <ActionCircle action="store" districtTheme={districtTheme} districtId={districtId} />
        </div>
      </div>
    </div>
  );
};