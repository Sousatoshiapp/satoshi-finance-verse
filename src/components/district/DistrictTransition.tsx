
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSponsorTheme } from '@/contexts/SponsorThemeProvider';
import { TrendingUp, GraduationCap, Bitcoin, Banknote, Home, Globe, Cpu } from 'lucide-react';

// Import district logos
import bankingLogo from "@/assets/districts/banking-sector-logo.png";
import cryptoLogo from "@/assets/districts/cripto-valley-logo.png";
import tradeLogo from "@/assets/districts/international-trade-logo.png";
import realEstateLogo from "@/assets/districts/real-estate-logo.png";
import techLogo from "@/assets/districts/tech-finance-logo.png";
import variableIncomeLogo from "@/assets/districts/variable-income-logo.png";
import financialEducationLogo from "@/assets/districts/financial-education-logo.png";

interface DistrictTransitionProps {
  isTransitioning: boolean;
  fromLocation: string;
  toLocation: string;
  toDistrictTheme?: string;
  onComplete: () => void;
}

export const DistrictTransition: React.FC<DistrictTransitionProps> = ({
  isTransitioning,
  fromLocation,
  toLocation,
  toDistrictTheme,
  onComplete
}) => {
  const [stage, setStage] = useState(0);
  const { getTheme } = useSponsorTheme();
  
  const sponsorTheme = toDistrictTheme ? getTheme(toDistrictTheme) : null;

  // District logos mapping - COMPLETO com todos os temas
  const districtLogos = {
    sistema_bancario: bankingLogo,
    criptomoedas: cryptoLogo,
    mercado_internacional: tradeLogo,
    fundos_imobiliarios: realEstateLogo,
    fintech: techLogo,
    renda_variavel: variableIncomeLogo,
    educacao_financeira: financialEducationLogo,
  };

  // District icons mapping - COMPLETO com todos os temas
  const districtIcons = {
    renda_variavel: TrendingUp,
    educacao_financeira: GraduationCap,
    criptomoedas: Bitcoin,
    sistema_bancario: Banknote,
    fundos_imobiliarios: Home,
    mercado_internacional: Globe,
    fintech: Cpu,
  };

  // Function to get district logo with fallback system - CORRECTED
  const getDistrictLogoOrIcon = () => {
    console.log('🎯 [TRANSITION] Searching logo for theme:', toDistrictTheme);
    
    // Priority 1: sponsor logo from database
    if (sponsorTheme?.logoUrl) {
      console.log('✅ [TRANSITION] Using sponsor logo:', sponsorTheme.logoUrl);
      return { type: 'image', src: sponsorTheme.logoUrl };
    }
    
    // Priority 2: local theme logo
    if (toDistrictTheme && districtLogos[toDistrictTheme as keyof typeof districtLogos]) {
      const logoSrc = districtLogos[toDistrictTheme as keyof typeof districtLogos];
      console.log('✅ [TRANSITION] Using local logo:', logoSrc);
      return { type: 'image', src: logoSrc };
    }
    
    // Priority 3: fallback icon
    if (toDistrictTheme && districtIcons[toDistrictTheme as keyof typeof districtIcons]) {
      const IconComponent = districtIcons[toDistrictTheme as keyof typeof districtIcons];
      console.log('✅ [TRANSITION] Using fallback icon for theme:', toDistrictTheme);
      return { type: 'icon', component: IconComponent };
    }
    
    console.log('⚠️ [TRANSITION] No logo/icon found for theme:', toDistrictTheme);
    return null;
  };

  useEffect(() => {
    if (!isTransitioning) return;
    
    console.log('🚀 [TRANSIÇÃO] Iniciando transição:', { fromLocation, toLocation, toDistrictTheme });

    const timeline = [
      { delay: 0, stage: 1 },      // Zoom out - 1000ms
      { delay: 1000, stage: 2 },   // Hyperspace travel - 2000ms 
      { delay: 3000, stage: 3 },   // Zoom in - 1000ms
      { delay: 4000, stage: 0 },   // Complete - 500ms delay
    ];

    const timers = timeline.map(({ delay, stage }) =>
      setTimeout(() => {
        if (stage === 0) {
          console.log('🚀 [TRANSIÇÃO] Transição concluída');
          onComplete();
        } else {
          console.log(`🚀 [TRANSIÇÃO] Stage ${stage} iniciado`);
          setStage(stage);
        }
      }, delay)
    );

    return () => {
      console.log('🚀 [TRANSIÇÃO] Limpando timers');
      timers.forEach(clearTimeout);
    };
  }, [isTransitioning, fromLocation, toLocation, onComplete]);

  if (!isTransitioning) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Stage 1: Zoom out overlay */}
        {stage === 1 && (
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 1 }}
              animate={{ scale: 0.8 }}
              transition={{ duration: 1.0, ease: "easeInOut" }}
            >
              <div className="text-white text-center">
                <motion.div
                  className="text-lg font-medium mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Saindo de {fromLocation}
                </motion.div>
                <motion.div
                  className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Stage 2: Hyperspace Travel Effect */}
        {stage === 2 && (
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Vignette effect */}
            <div 
              className="absolute inset-0 opacity-60"
              style={{
                background: 'radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.8) 80%)'
              }}
            />
            
            {/* Hyperspace stars */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(120)].map((_, i) => {
                const angle = Math.random() * Math.PI * 2;
                const initialRadius = Math.random() * 100 + 50;
                const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 400;
                const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 300;
                const startX = centerX + Math.cos(angle) * initialRadius;
                const startY = centerY + Math.sin(angle) * initialRadius;
                const distance = Math.random() * 800 + 400;
                const endX = centerX + Math.cos(angle) * distance;
                const endY = centerY + Math.sin(angle) * distance;
                
                // Color variations - mostly white, some blue/cyan
                const colorClass = Math.random() > 0.85 ? 'bg-blue-400' : 
                                 Math.random() > 0.92 ? 'bg-cyan-300' : 'bg-white';
                
                return (
                  <motion.div
                    key={`hyperstar-${i}`}
                    className={`absolute ${colorClass} rounded-full shadow-sm`}
                    style={{
                      left: startX - 1,
                      top: startY - 1,
                      width: '2px',
                      height: '2px',
                      boxShadow: `0 0 4px currentColor`,
                    }}
                    animate={{
                      x: [0, endX - startX],
                      y: [0, endY - startY],
                      width: ['2px', '2px', '4px', '60px', '100px'],
                      height: ['2px', '2px', '2px', '1px', '1px'],
                      opacity: [0, 1, 1, 0.6, 0],
                    }}
                    transition={{
                      duration: 2.0,
                      ease: [0.25, 0.46, 0.45, 0.94],
                      delay: Math.random() * 0.5,
                    }}
                  />
                );
              })}
            </div>
            
            {/* Center bright glow */}
            <motion.div
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                width: '40px',
                height: '40px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 30%, transparent 70%)',
                borderRadius: '50%',
              }}
              animate={{
                scale: [0, 1, 3, 5],
                opacity: [0, 0.8, 0.3, 0],
              }}
              transition={{
                duration: 2.0,
                ease: "easeOut",
              }}
            />

            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center text-white text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="text-2xl font-bold mb-8"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Viajando para
              </motion.div>
              
              {(() => {
                const logoOrIcon = getDistrictLogoOrIcon();
                if (logoOrIcon?.type === 'image') {
                  return (
                    <motion.img
                      src={logoOrIcon.src}
                      alt={toLocation}
                      className="w-48 h-48 object-contain"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ 
                        opacity: 1, 
                        scale: [0.5, 1.1, 1],
                      }}
                      transition={{ 
                        duration: 1.2,
                        ease: "easeOut"
                      }}
                      style={{
                        filter: 'drop-shadow(0 0 20px rgba(173, 255, 47, 0.3))',
                      }}
                    />
                  );
                } else if (logoOrIcon?.type === 'icon') {
                  const IconComponent = logoOrIcon.component;
                  return (
                    <motion.div
                      className="flex items-center justify-center w-48 h-48"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ 
                        opacity: 1, 
                        scale: [0.5, 1.1, 1],
                      }}
                      transition={{ 
                        duration: 1.2,
                        ease: "easeOut"
                      }}
                    >
                      <IconComponent 
                        className="w-32 h-32 text-[#adff2f]"
                        style={{
                          filter: 'drop-shadow(0 0 20px rgba(173, 255, 47, 0.3))',
                        }}
                      />
                    </motion.div>
                  );
                } else {
                  return (
                    <motion.div
                      className="text-3xl font-bold text-cyan-300"
                      initial={{ letterSpacing: '0.1em' }}
                      animate={{ letterSpacing: '0.2em' }}
                      transition={{ duration: 0.8 }}
                    >
                      {toLocation}
                    </motion.div>
                  );
                }
              })()}
            </motion.div>
          </motion.div>
        )}

        {/* Stage 3: Zoom in */}
        {stage === 3 && (
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.0, ease: "easeInOut" }}
            >
              <div className="text-white text-center">
                <motion.div
                  className="text-xl font-medium"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Chegando em {toLocation}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
