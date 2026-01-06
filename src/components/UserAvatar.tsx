"use client";

import React from "react";
import Image from "next/image";

interface UserAvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showBorder?: boolean;
  onClick?: () => void;
}

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-2xl",
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  size = "md",
  className = "",
  showBorder = false,
  onClick,
}) => {
  const getInitial = (name: string): string => {
    if (!name) return "?";
    // Get first character, support both Arabic and English
    return name.trim().charAt(0).toUpperCase();
  };

  const initial = getInitial(name);
  const sizeClass = sizeClasses[size];
  const borderClass = showBorder ? "border-2 border-primary-200" : "";

  // Generate a consistent color based on the name
  const getColorFromName = (name: string): string => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const avatarColor = getColorFromName(name);

  if (src) {
    return (
      <div
        className={`relative rounded-full overflow-hidden ${sizeClass} ${borderClass} ${className} ${
          onClick ? "cursor-pointer" : ""
        }`}
        onClick={onClick}
      >
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full ${sizeClass} ${borderClass} ${avatarColor} text-white font-bold ${className} ${
        onClick ? "cursor-pointer hover:opacity-90 transition-opacity" : ""
      }`}
      onClick={onClick}
    >
      {initial}
    </div>
  );
};

export default UserAvatar;

