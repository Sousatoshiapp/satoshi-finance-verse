import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
// XP District Images
import xpMorning from "@/assets/districts/xp-morning.jpg";
import xpSunset from "@/assets/districts/xp-sunset.jpg";
import xpNight from "@/assets/districts/xp-night.jpg";

// Anima District Images
import animaMorning from "@/assets/districts/anima-morning.jpg";
import animaSunset from "@/assets/districts/anima-sunset.jpg";
import animaNight from "@/assets/districts/anima-night.jpg";

// Crypto District Images
import cryptoMorning from "@/assets/districts/crypto-morning.jpg";
import cryptoSunset from "@/assets/districts/crypto-sunset.jpg";
import cryptoNight from "@/assets/districts/crypto-night.jpg";

// Banking District Images
import bankingMorning from "@/assets/districts/banking-morning.jpg";
import bankingSunset from "@/assets/districts/banking-sunset.jpg";
import bankingNight from "@/assets/districts/banking-night.jpg";

// Real Estate District Images
import realestateMorning from "@/assets/districts/realestate-morning.jpg";
import realestateSunset from "@/assets/districts/realestate-sunset.jpg";
import realestateNight from "@/assets/districts/realestate-night.jpg";

// International District Images
import internationalMorning from "@/assets/districts/international-morning.jpg";
import internationalSunset from "@/assets/districts/international-sunset.jpg";
import internationalNight from "@/assets/districts/international-night.jpg";

// Fintech District Images
import fintechMorning from "@/assets/districts/fintech-morning.jpg";
import fintechSunset from "@/assets/districts/fintech-sunset.jpg";
import fintechNight from "@/assets/districts/fintech-night.jpg";

// Paleta de cores temáticas por distrito
const districtColors = {
  renda_variavel: {
    primary: 'hsl(142, 76%, 36%)', // Verde XP
    secondary: 'hsl(142, 85%, 25%)',
    accent: 'hsl(142, 76%, 46%)',
  },
  educacao_financeira: {
    primary: 'hsl(220, 100%, 50%)', // Azul Ânima
    secondary: 'hsl(220, 85%, 35%)',
    accent: 'hsl(220, 100%, 65%)',
  },
  criptomoedas: {
    primary: 'hsl(45, 100%, 50%)', // Dourado crypto
    secondary: 'hsl(39, 85%, 35%)',
    accent: 'hsl(45, 100%, 65%)',
  },
  sistema_bancario: {
    primary: 'hsl(210, 50%, 35%)', // Azul bancário
    secondary: 'hsl(210, 60%, 25%)',
    accent: 'hsl(210, 60%, 50%)',
  },
  fundos_imobiliarios: {
    primary: 'hsl(25, 80%, 45%)', // Laranja tijolo
    secondary: 'hsl(25, 75%, 30%)',
    accent: 'hsl(25, 85%, 60%)',
  },
  mercado_internacional: {
    primary: 'hsl(260, 70%, 45%)', // Roxo internacional
    secondary: 'hsl(260, 75%, 30%)',
    accent: 'hsl(260, 80%, 60%)',
  },
  fintech: {
    primary: 'hsl(180, 70%, 40%)', // Ciano tech
    secondary: 'hsl(180, 75%, 25%)',
    accent: 'hsl(180, 80%, 55%)',
  },
};

interface DistrictBackgroundProps {
  districtTheme: string;
  className?: string;
}

interface District {
  image_url: string | null;
  color_primary: string;
  color_secondary: string;
}

// Mapeamento de imagens por distrito e período do dia
const getDistrictImage = (districtTheme: string, timeOfDay: string) => {
  const imageMap = {
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
    criptomoedas: {
      morning: cryptoMorning,
      sunset: cryptoSunset,
      night: cryptoNight,
    },
    sistema_bancario: {
      morning: bankingMorning,
      sunset: bankingSunset,
      night: bankingNight,
    },
    fundos_imobiliarios: {
      morning: realestateMorning,
      sunset: realestateSunset,
      night: realestateNight,
    },
    mercado_internacional: {
      morning: internationalMorning,
      sunset: internationalSunset,
      night: internationalNight,
    },
    fintech: {
      morning: fintechMorning,
      sunset: fintechSunset,
      night: fintechNight,
    },
  };

  const district = imageMap[districtTheme as keyof typeof imageMap];
  return district ? district[timeOfDay as keyof typeof district] : null;
};

// Função para gerar gradientes temáticos baseados no distrito e período
const getDistrictGradient = (districtTheme: string, timeOfDay: string) => {
  const colors = districtColors[districtTheme as keyof typeof districtColors] || districtColors.sistema_bancario;
  
  const gradients = {
    morning: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.accent}30 50%, ${colors.secondary}15 100%)`,
    sunset: `linear-gradient(135deg, ${colors.accent}25 0%, ${colors.primary}35 50%, ${colors.secondary}20 100%)`,
    night: `linear-gradient(135deg, ${colors.secondary}30 0%, ${colors.primary}25 50%, ${colors.accent}15 100%)`,
  };
  
  return gradients[timeOfDay as keyof typeof gradients] || gradients.night;
};

export const DistrictBackground: React.FC<DistrictBackgroundProps> = ({ 
  districtTheme, 
  className = "" 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [districtData, setDistrictData] = useState<District | null>(null);

  // Buscar dados do distrito
  useEffect(() => {
    const fetchDistrictData = async () => {
      const { data, error } = await supabase
        .from('districts')
        .select('image_url, color_primary, color_secondary')
        .eq('theme', districtTheme)
        .single();
      
      if (data && !error) {
        setDistrictData(data);
      }
    };
    
    fetchDistrictData();
  }, [districtTheme]);

  // Atualizar a hora a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Atualizar a cada minuto

    return () => clearInterval(timer);
  }, []);

  // Determinar o gradiente baseado na hora e distrito
  const currentGradient = useMemo(() => {
    const hour = currentTime.getHours();
    let timeOfDay = 'night';
    
    if (hour >= 6 && hour < 12) {
      timeOfDay = 'morning';
    } else if (hour >= 12 && hour < 18) {
      timeOfDay = 'sunset';
    }
    
    return getDistrictGradient(districtTheme, timeOfDay);
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

  // Obter imagem local baseada no tema do distrito e período do dia
  const districtImage = getDistrictImage(districtTheme, timeOfDay);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Background image do distrito */}
      {districtImage && (
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${districtImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}

      {/* Background gradiente temático */}
      <motion.div
        key={`${districtTheme}-${timeOfDay}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="absolute inset-0"
        style={{
          background: districtData?.image_url 
            ? `linear-gradient(135deg, ${districtData.color_primary}40 0%, ${districtData.color_secondary}30 50%, ${districtData.color_primary}20 100%)`
            : currentGradient,
        }}
      />

      {/* Overlay de período do dia */}
      <div className={`absolute inset-0 ${overlayStyles[timeOfDay]}`} />

      {/* Overlay de gradiente para legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

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