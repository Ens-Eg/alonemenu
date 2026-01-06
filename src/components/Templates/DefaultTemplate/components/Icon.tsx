import React from "react";

// ============================
// Icon Component (Using Remix Icons via className)
// ============================

interface IconProps {
  name: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className = "" }) => (
  <i className={`ri-${name} ${className}`} />
);

