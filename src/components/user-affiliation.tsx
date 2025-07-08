import { useNavigate } from "react-router-dom";

interface UserAffiliationProps {
  district?: {
    id: string;
    name: string;
    color_primary: string;
    color_secondary: string;
    theme: string;
  };
  team?: {
    id: string;
    name: string;
    team_color: string;
  };
}

export function UserAffiliation({ district, team }: UserAffiliationProps) {
  const navigate = useNavigate();

  if (!district && !team) return null;

  return (
    <div className="flex items-center justify-center gap-3 mb-4">
      {/* District Card */}
      {district && (
        <div 
          className="flex-1 bg-gradient-to-r from-card/80 to-muted/40 border border-border/50 rounded-2xl p-3 cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-md"
          onClick={() => navigate('/satoshi-city')}
          style={{
            borderColor: `${district.color_primary}30`,
            background: `linear-gradient(135deg, ${district.color_primary}10, ${district.color_secondary}05)`
          }}
        >
          <div className="flex items-center gap-2">
            <div className="text-lg">🏢</div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">Distrito</div>
              <div className="text-sm font-semibold text-foreground truncate">{district.name}</div>
            </div>
          </div>
        </div>
      )}

      {/* Team Card */}
      {team && (
        <div 
          className="flex-1 bg-gradient-to-r from-card/80 to-muted/40 border border-border/50 rounded-2xl p-3 cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-md"
          onClick={() => navigate('/guilds')}
          style={{
            borderColor: `${team.team_color}30`,
            background: `linear-gradient(135deg, ${team.team_color}10, ${team.team_color}05)`
          }}
        >
          <div className="flex items-center gap-2">
            <div className="text-lg">⚔️</div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">Time</div>
              <div className="text-sm font-semibold text-foreground truncate">{team.name}</div>
            </div>
          </div>
        </div>
      )}

      {/* Join Suggestion if no affiliations */}
      {!district && !team && (
        <div 
          className="flex-1 bg-gradient-to-r from-primary/10 to-secondary/5 border border-primary/20 rounded-2xl p-3 cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-md"
          onClick={() => navigate('/satoshi-city')}
        >
          <div className="flex items-center gap-2">
            <div className="text-lg">🌟</div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">Explore</div>
              <div className="text-sm font-semibold text-foreground">Juntar-se a Distrito</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}