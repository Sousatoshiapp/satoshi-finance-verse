import React from 'react';
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
} from './game-icons';

// Mapeamento de emojis para componentes personalizados
const emojiIconMap = {
  '🔥': StreakIcon,
  '🏆': TrophyIcon,
  '⚡': LightningIcon,
  '🎁': GiftIcon,
  '⭐': StarIcon,
  '💎': DiamondIcon,
  '⚔️': SwordIcon,
  '👑': CrownIcon,
  '🎯': TargetIcon,
  '🛡️': ShieldIcon,
  '🚀': RocketIcon,
  // Adicionar mais conforme necessário
} as const;

interface IconSystemProps {
  emoji: keyof typeof emojiIconMap;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  animated?: boolean;
  variant?: 'default' | 'glow' | 'pulse';
  fallback?: React.ReactNode;
}

// Componente central do sistema de ícones
export function IconSystem({ 
  emoji, 
  size = 'md', 
  className, 
  animated = false, 
  variant = 'default',
  fallback 
}: IconSystemProps) {
  const IconComponent = emojiIconMap[emoji];
  
  if (!IconComponent) {
    // Fallback para emojis ainda não implementados
    return fallback || <span className={className}>{emoji}</span>;
  }
  
  return (
    <IconComponent 
      size={size} 
      className={className} 
      animated={animated} 
      variant={variant} 
    />
  );
}

// Hook para facilitar o uso
export function useGameIcon(emoji: keyof typeof emojiIconMap) {
  return emojiIconMap[emoji];
}

// Componente de substituição rápida para spans com emojis
interface EmojiReplaceProps {
  children: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  animated?: boolean;
  variant?: 'default' | 'glow' | 'pulse';
}

export function EmojiReplace({ 
  children, 
  size = 'md', 
  className, 
  animated = false, 
  variant = 'default' 
}: EmojiReplaceProps) {
  // Procura por emojis no texto e os substitui
  const parts = children.split(/(🔥|🏆|⚡|🎁|⭐|💎|⚔️|👑|🎯|🛡️|🚀)/);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part in emojiIconMap) {
          return (
            <IconSystem
              key={index}
              emoji={part as keyof typeof emojiIconMap}
              size={size}
              className={className}
              animated={animated}
              variant={variant}
            />
          );
        }
        return part;
      })}
    </>
  );
}

// Componente inteligente que substitui automaticamente emojis em texto
interface SmartTextProps {
  children: React.ReactNode;
  iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  iconVariant?: 'default' | 'glow' | 'pulse';
  animated?: boolean;
  className?: string;
}

export function SmartText({ 
  children, 
  iconSize = 'md', 
  iconVariant = 'default',
  animated = false,
  className 
}: SmartTextProps) {
  const processText = (text: string) => {
    const parts = text.split(/(🔥|🏆|⚡|🎁|⭐|💎|⚔️|👑|🎯|🛡️|🚀)/);
    
    return parts.map((part, index) => {
      if (part in emojiIconMap) {
        return (
          <IconSystem
            key={index}
            emoji={part as keyof typeof emojiIconMap}
            size={iconSize}
            animated={animated}
            variant={iconVariant}
          />
        );
      }
      return part;
    });
  };

  const processNode = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === 'string') {
      return processText(node);
    }
    
    if (React.isValidElement(node) && node.props.children) {
      return React.cloneElement(node, {
        ...node.props,
        children: Array.isArray(node.props.children) 
          ? node.props.children.map(processNode)
          : processNode(node.props.children)
      });
    }
    
    return node;
  };

  return (
    <span className={className}>
      {processNode(children)}
    </span>
  );
}

// Função utilitária para substituir emojis em strings
export function replaceEmojisInText(
  text: string,
  options: {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    variant?: 'default' | 'glow' | 'pulse';
    animated?: boolean;
  } = {}
): React.ReactNode {
  const { size = 'md', variant = 'default', animated = false } = options;
  const parts = text.split(/(🔥|🏆|⚡|🎁|⭐|💎|⚔️|👑|🎯|🛡️|🚀)/);
  
  return parts.map((part, index) => {
    if (part in emojiIconMap) {
      return (
        <IconSystem
          key={index}
          emoji={part as keyof typeof emojiIconMap}
          size={size}
          animated={animated}
          variant={variant}
        />
      );
    }
    return part;
  });
}

// Exportar componentes individuais para uso direto
export {
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
};