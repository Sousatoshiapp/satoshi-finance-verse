import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

// Import das imagens por distrito
import xpMorning from '@/assets/districts/xp-morning.jpg';
import xpSunset from '@/assets/districts/xp-sunset.jpg';
import xpNight from '@/assets/districts/xp-night.jpg';
import animaMorning from '@/assets/districts/anima-morning.jpg';
import animaSunset from '@/assets/districts/anima-sunset.jpg';
import animaNight from '@/assets/districts/anima-night.jpg';

interface DistrictBackgroundProps {
  districtTheme: string;
  className?: string;
}

const districtImages = {
  renda_variavel: {
    morning: xpMorning,
    sunset: xpSunset,
    night: xpNight,
  },
  educacao_financeira: {
    morning: animaMorning,
    sunset: animaSunset,
    night: animaNight,
  },
  // Para os outros distritos, usar as existentes como placeholder até gerar as específicas
  criptomoedas: {
    morning: xpMorning, // Placeholder
    sunset: xpSunset,   // Placeholder
    night: xpNight,     // Placeholder
  },
  sistema_bancario: {
    morning: xpMorning, // Placeholder
    sunset: xpSunset,   // Placeholder
    night: xpNight,     // Placeholder
  },
  fundos_imobiliarios: {
    morning: xpMorning, // Placeholder
    sunset: xpSunset,   // Placeholder
    night: xpNight,     // Placeholder
  },
  mercado_internacional: {
    morning: xpMorning, // Placeholder
    sunset: xpSunset,   // Placeholder
    night: xpNight,     // Placeholder
  },
  fintech: {
    morning: xpMorning, // Placeholder
    sunset: xpSunset,   // Placeholder
    night: xpNight,     // Placeholder
  },
};

export const DistrictBackground: React.FC<DistrictBackgroundProps> = ({ 
  districtTheme, 
  className = "" 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar a hora a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Atualizar a cada minuto

    return () => clearInterval(timer);
  }, []);

  // Determinar qual imagem usar baseado na hora
  const currentImage = useMemo(() => {
    const hour = currentTime.getHours();
    const images = districtImages[districtTheme as keyof typeof districtImages] || districtImages.sistema_bancario;
    
    if (hour >= 6 && hour < 12) {
      return images.morning;
    } else if (hour >= 12 && hour < 18) {
      return images.sunset;
    } else {
      return images.night;
    }
  }, [currentTime, districtTheme]);

  // Determinar o período do dia para efeitos
  const timeOfDay = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'sunset';
    return 'night';
  }, [currentTime]);

  // Overlays baseados no período do dia
  const overlayStyles = {
    morning: 'bg-gradient-to-b from-blue-500/10 via-transparent to-yellow-500/20',
    sunset: 'bg-gradient-to-b from-orange-500/20 via-transparent to-purple-500/30',
    night: 'bg-gradient-to-b from-purple-900/30 via-transparent to-blue-900/40'
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Imagem de fundo principal */}
      <motion.div
        key={currentImage}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${currentImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Overlay de período do dia */}
      <div className={`absolute inset-0 ${overlayStyles[timeOfDay]}`} />

      {/* Overlay de gradiente para legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Efeitos de partículas sutis */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Indicador de período do dia */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1">
          <span className="text-white/80 text-sm font-medium capitalize">
            {timeOfDay === 'morning' && '🌅 Manhã'}
            {timeOfDay === 'sunset' && '🌅 Tarde'}
            {timeOfDay === 'night' && '🌙 Noite'}
          </span>
        </div>
      </div>
    </div>
  );
};