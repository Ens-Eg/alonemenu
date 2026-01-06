import React from "react";

// ============================
// Input Component
// ============================

interface InputProps {
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full h-12 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] px-4 py-2 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none transition-all ${className}`}
    />
  );
};

