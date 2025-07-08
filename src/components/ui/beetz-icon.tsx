import React from "react";
import { cn } from "@/lib/utils";

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
      src="/lovable-uploads/073c0879-ad65-4bee-b80a-a29090231192.png" 
      alt="Beetz" 
      className={cn(sizeClasses[size], "inline-block", className)}
    />
  );
}