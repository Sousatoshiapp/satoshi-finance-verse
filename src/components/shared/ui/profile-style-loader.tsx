import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";

interface ProfileStyleLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  text?: string;
}

export function ProfileStyleLoader({ 
  className, 
  size = "md", 
  showText = true,
  text
}: ProfileStyleLoaderProps) {
  const { t } = useI18n();

  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const loadingText = text || t('common.loading');

  return (
    <div className={cn("min-h-screen bg-background flex items-center justify-center", className)}>
      <div className="text-center">
        <div className={cn(
          "animate-spin rounded-full border-b-2 border-primary mx-auto",
          sizes[size]
        )} />
        {showText && (
          <p className="mt-4 text-muted-foreground">{loadingText}</p>
        )}
      </div>
    </div>
  );
}