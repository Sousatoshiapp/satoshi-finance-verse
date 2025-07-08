import React from "react";
import { cn } from "@/lib/utils";
import beetzIcon from "@/assets/beetz-icon.svg";

interface BeetzIconProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const sizeClasses = {
  xs: "w-3 h-3",
  sm: "w-4 h-4", 
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
  "2xl": "w-16 h-16"
};

export function BeetzIcon({ size = "md", className }: BeetzIconProps) {
  return (
    <img 
      src={beetzIcon} 
      alt="Beetz" 
      className={cn(sizeClasses[size], "inline-block", className)}
    />
  );
}