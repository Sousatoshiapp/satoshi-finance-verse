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

const fontSizeClasses = {
  xs: "text-[6px]",
  sm: "text-[8px]", 
  md: "text-[10px]",
  lg: "text-[12px]",
  xl: "text-[18px]",
  "2xl": "text-[24px]"
};

export function BeetzIcon({ size = "md", className }: BeetzIconProps) {
  return (
    <div 
      className={cn(
        sizeClasses[size],
        fontSizeClasses[size],
        "inline-flex items-center justify-center rounded-full bg-[#adff2f] text-black font-bold",
        className
      )}
    >
      B
    </div>
  );
}