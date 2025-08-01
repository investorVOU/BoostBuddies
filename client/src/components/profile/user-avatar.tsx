import { User, Crown, Shield, Star } from "lucide-react";
import { PremiumBadge } from "@/components/ui/premium-badge";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: {
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    isPremium?: boolean;
    email?: string;
  };
  size?: "sm" | "md" | "lg" | "xl";
  showBadge?: boolean;
  className?: string;
}

export function UserAvatar({ 
  user, 
  size = "md", 
  showBadge = true, 
  className 
}: UserAvatarProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  const badgeSizes = {
    sm: "sm" as const,
    md: "sm" as const,
    lg: "md" as const,
    xl: "md" as const
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg"
  };

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className={cn("relative inline-block", className)}>
      {user.profileImageUrl ? (
        <img
          src={user.profileImageUrl}
          alt={`${user.firstName || ''} ${user.lastName || ''}`.trim()}
          className={cn(
            "rounded-full object-cover border-2 border-white shadow-sm",
            sizes[size]
          )}
        />
      ) : (
        <div className={cn(
          "rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-heading font-semibold shadow-sm",
          sizes[size],
          textSizes[size]
        )}>
          {initials || <User className="w-1/2 h-1/2" />}
        </div>
      )}
      
      {showBadge && user.isPremium && (
        <div className="absolute -top-1 -right-1">
          <PremiumBadge variant="crown" size={badgeSizes[size]} />
        </div>
      )}
    </div>
  );
}