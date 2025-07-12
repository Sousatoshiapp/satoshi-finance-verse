import { useNavigate } from "react-router-dom";
import { abbreviateDistrictName } from "@/lib/district-utils";
import xpLogo from "@/assets/xp-logo.png";
import animaLogo from "@/assets/anima-logo.png";

interface DistrictCircleBadgeProps {
  district?: {
    id: string;
    name: string;
    color_primary: string;
    color_secondary: string;
    theme: string;
    sponsor_logo_url?: string;
  };
  size?: "sm" | "md" | "lg";
}

export function DistrictCircleBadge({ district, size = "md" }: DistrictCircleBadgeProps) {
  const navigate = useNavigate();
  
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm", 
    lg: "w-12 h-12 text-base"
  };

  if (!district) {
    return (
      <button
        onClick={() => navigate('/satoshi-city')}
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-200 shadow-lg`}
      >
        <span className="text-primary font-bold">?</span>
      </button>
    );
  }

  // Obter inicial do nome do distrito como fallback
  const getDistrictInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // Mapear URLs de logo para imports locais
  const getLogoSrc = (district: any) => {
    if (district.sponsor_company === 'XP Investimentos' || district.theme === 'renda_variavel') {
      return xpLogo;
    }
    if (district.sponsor_company === 'Ânima Educação') {
      return animaLogo;
    }
    return district.sponsor_logo_url;
  };

  return (
    <button
      onClick={() => navigate('/satoshi-city')}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-200 shadow-lg relative group`}
      style={{
        background: `linear-gradient(135deg, ${district.color_primary}, ${district.color_secondary})`,
        border: `2px solid ${district.color_primary}`,
      }}
      title={`Distrito: ${district.name}`}
    >
      {/* Logo do patrocinador ou inicial do distrito */}
      {district.sponsor_logo_url ? (
        <img 
          src={getLogoSrc(district)} 
          alt={district.name}
          className="w-full h-full object-contain rounded-full p-1"
          onError={(e) => {
            // Fallback para inicial se imagem falhar
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      
      {/* Fallback com inicial do distrito */}
      <span className={`text-white font-bold text-lg ${district.sponsor_logo_url ? 'hidden' : ''}`}>
        {getDistrictInitial(district.name)}
      </span>
      
      {/* Tooltip on hover */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {abbreviateDistrictName(district.name)}
      </div>
    </button>
  );
}