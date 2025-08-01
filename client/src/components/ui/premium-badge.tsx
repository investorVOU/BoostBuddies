import { Crown, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  variant?: "crown" | "star" | "zap";
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export function PremiumBadge({ 
  variant = "crown", 
  size = "md", 
  className,
  showText = false 
}: PremiumBadgeProps) {
  const icons = {
    crown: Crown,
    star: Star,
    zap: Zap
  };

  const sizes = {
    sm: showText ? "px-2 py-1 text-xs" : "w-6 h-6",
    md: showText ? "px-3 py-1.5 text-sm" : "w-8 h-8",
    lg: showText ? "px-4 py-2 text-base" : "w-10 h-10"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-5 h-5"
  };

  const Icon = icons[variant];

  if (showText) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-heading font-semibold rounded-full shadow-lg",
        sizes[size],
        className
      )}>
        <Icon className={iconSizes[size]} />
        <span>Premium</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "inline-flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full shadow-lg",
      sizes[size],
      className
    )}>
      <Icon className={iconSizes[size]} />
    </div>
  );
}