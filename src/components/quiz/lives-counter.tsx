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
    <div className="flex items-center gap-1 sm:gap-2 bg-red-500/10 rounded-lg px-2 py-1 border border-red-500/20">
      {/* Vidas */}
      <div className="flex items-center gap-0.5 sm:gap-1">
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
              className={`h-3 w-3 sm:h-4 sm:w-4 ${
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
        <div className="flex items-center gap-1 text-xs text-red-400 font-medium hidden sm:flex">
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