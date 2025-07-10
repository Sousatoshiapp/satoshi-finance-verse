import { Heart, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useLivesSystem } from "@/hooks/use-lives-system";

export function LivesCounter() {
  const { userLives, getTimeToNextLife } = useLivesSystem();
  
  if (!userLives) return null;

  const timeToNext = getTimeToNextLife();
  const livesCount = userLives.lives_count;
  const maxLives = 3;

  return (
    <div className="flex items-center gap-2">
      {/* Vidas */}
      <div className="flex items-center gap-1">
        {Array.from({ length: maxLives }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ scale: 1 }}
            animate={{ 
              scale: index < livesCount ? 1 : 0.8,
              opacity: index < livesCount ? 1 : 0.3
            }}
            transition={{ duration: 0.3 }}
          >
            <Heart 
              className={`h-5 w-5 ${
                index < livesCount 
                  ? "text-red-500 fill-red-500" 
                  : "text-gray-400"
              }`}
            />
          </motion.div>
        ))}
      </div>

      {/* Timer de regeneração */}
      {timeToNext && !timeToNext.ready && livesCount < maxLives && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
          <Clock className="h-3 w-3" />
          <span>
            {timeToNext.hours > 0 && `${timeToNext.hours}h `}
            {timeToNext.minutes}m
          </span>
        </div>
      )}
    </div>
  );
}