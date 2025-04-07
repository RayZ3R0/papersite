"use client";

import { UserWithoutPassword } from "@/lib/authTypes";

interface UserAvatarProps {
  user: UserWithoutPassword;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
};

export default function UserAvatar({
  user,
  size = "md",
  className = "",
}: UserAvatarProps) {
  // Get user's initials from username
  const initials = user.username
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full bg-primary text-white font-medium
        flex items-center justify-center
        ${className}
      `}
    >
      {initials}
    </div>
  );
}
