"use client";

import React from "react";
import { useLanguage } from "../context";
import { Button } from "./Button";
import { Icon } from "./Icon";

// ============================
// Language Toggle Component
// ============================

export const LanguageToggle: React.FC = () => {
  const { locale, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="group relative overflow-hidden rounded-full px-4 py-2"
    >
      <span className="flex items-center gap-2">
        <Icon
          name="global-line"
          className="text-[var(--text-lg)] transition-transform duration-300 group-hover:rotate-180"
        />
        <span className="text-[var(--text-sm)] font-semibold tracking-wide">
          {locale === "ar" ? "EN" : "عربي"}
        </span>
      </span>
    </Button>
  );
};

