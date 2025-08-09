import { ProfileStyleLoader } from "./profile-style-loader";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  return <ProfileStyleLoader className={className} size={size} />;
}