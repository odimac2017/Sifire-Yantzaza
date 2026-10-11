import React from "react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  avatar?: string | null;
  isOnline?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

const statusSizes = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
};

export default function UserAvatar({
  name,
  avatar = null,
  isOnline = false,
  size = "md",
  className,
}: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative inline-block">
      {avatar ? (
        <img
          src={`/storage/${avatar}`}
          alt={name}
          className={cn("rounded-full object-cover", sizes[size], className)}
        />
      ) : (
        <div
          className={cn(
            "rounded-full bg-muted flex items-center justify-center font-semibold text-foreground",
            sizes[size],
            className
          )}
        >
          {initials}
        </div>
      )}

      {/* STATUS */}
      <span
        className={cn(
          "absolute bottom-0 right-0 rounded-full border-2 border-background",
          isOnline ? "bg-green-500" : "bg-gray-400",
          statusSizes[size]
        )}
      />
    </div>
  );
}
