"use client";

import React from "react";
import { AdItem } from "../types";
import { useLanguage } from "../context";
import { Icon } from "./Icon";

// ============================
// Small Ad Cards Component (for between menu items)
// ============================

interface SmallAdCardProps {
  ad: AdItem;
}

export const SmallAdCard: React.FC<SmallAdCardProps> = ({ ad }) => {
  const { locale, direction } = useLanguage();
  const rtl = direction === "rtl";

  const title = locale === "ar" ? ad.titleAr : ad.titleEn;
  const badge = ad.badge ? (locale === "ar" ? ad.badge.ar : ad.badge.en) : null;

  return (
    <div
      dir={direction}
      className="
    relative rounded-2xl overflow-hidden
    bg-gradient-to-br from-[var(--accent)]/15 to-[var(--accent-2)]/15
    border border-[var(--accent)]/25
    p-4 sm:p-5
    cursor-pointer group
    transition-all duration-500 ease-out
    hover:border-[var(--accent)]
    hover:shadow-[0_10px_40px_-10px_var(--accent)]
    hover:scale-[1.015]
  "
    >
      {/* Glow overlay */}
      <div
        className="
    absolute inset-0
    bg-gradient-to-r from-[var(--accent)]/15 via-transparent to-[var(--accent-2)]/15
    opacity-0 group-hover:opacity-100
    transition-opacity duration-500
  "
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Badge */}
        {badge && (
          <div
            className="
        inline-flex items-center gap-1.5
        px-2.5 py-1
        rounded-full
        bg-[var(--accent)]
        text-white
        text-[10px] sm:text-xs
        font-semibold
        mb-3
        shadow-sm
      "
          >
            <Icon name="megaphone-fill" className="text-xs" />
            <span>{badge}</span>
          </div>
        )}

        {/* Title */}
        <h4
          className="
      text-base sm:text-lg
      font-bold
      text-[var(--text-main)]
      mb-2
      transition-colors duration-300
      group-hover:text-[var(--accent)]
    "
        >
          {title}
        </h4>

        {/* Discount */}
        {ad.discount && (
          <div className="flex items-end gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--accent)]">
              -{ad.discount}
            </span>
            <span className="text-xs text-[var(--text-muted)] mb-1">
              {locale === "ar" ? "خصم" : "OFF"}
            </span>
          </div>
        )}
      </div>

      {/* Arrow */}
      <div className={`absolute bottom-4 ${rtl ? "left-4" : "right-4"}`}>
        <div
          className="
      w-9 h-9
      rounded-full
      bg-[var(--accent)]/20
      flex items-center justify-center
      transition-all duration-300
      group-hover:bg-[var(--accent)]
      group-hover:scale-110
    "
        >
          <Icon
            name={rtl ? "arrow-left-s-line" : "arrow-right-s-line"}
            className="
          text-lg
          text-[var(--accent)]
          transition-colors duration-300
          group-hover:text-white
        "
          />
        </div>
      </div>

      {/* Decorative blur shapes */}
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-[var(--accent)]/15 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-[var(--accent-2)]/15 blur-2xl" />
    </div>
  );
};

