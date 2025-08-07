import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/shared/ui/button";

interface CrisisIconProps {
  onClick: () => void;
}

export const CrisisIcon = ({ onClick }: CrisisIconProps) => {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 relative animate-pulse"
    >
      <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping"></div>
      <AlertTriangle className="h-5 w-5 text-yellow-500 relative z-10" />
    </Button>
  );
};
