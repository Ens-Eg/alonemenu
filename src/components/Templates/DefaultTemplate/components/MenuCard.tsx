"use client";

import React, { memo } from "react";
import { MenuItem } from "../types";
import { useLanguage } from "../context";
import { Icon } from "./Icon";
import { getCurrencyByCode } from "@/constants/currencies";

// ============================
// Menu Card Component
// ============================

interface MenuCardProps {
  item: MenuItem;
  index: number;
  currency?: string;
  onClick: () => void;
}

export const MenuCard = memo<MenuCardProps>(({ item, index, currency = "SAR", onClick }) => {
  const { locale, direction } = useLanguage();
  const rtl = direction === "rtl";

  const name = locale === "ar" ? item.nameAr : item.nameEn;
  const description =
    locale === "ar" ? item.descriptionAr : item.descriptionEn;
  const popularText = locale === "ar" ? "الأكثر طلباً" : "Popular";
  const viewDetails = locale === "ar" ? "عرض التفاصيل" : "View Details";
  const currencySymbol = getCurrencyByCode(currency)?.symbol || currency;

  return (
    <div
      dir={direction}
      onClick={onClick}
      className="
      group relative
      bg-[var(--bg-card)]
      rounded-2xl
      overflow-hidden
      border border-[var(--border-main)]
      cursor-pointer
      transition-all duration-500 ease-out
      hover:border-[var(--accent)]/60
      hover:-translate-y-2
      hover:shadow-[0_30px_60px_rgba(0,0,0,0.45)]
    "
      style={{
        animationDelay: `${index * 60}ms`,
        opacity: 0,
        animation: "fadeInUp 0.55s ease-out forwards",
      }}
    >
      {/* Popular badge */}
      {item.isPopular && (
        <div
          className={`
          absolute top-3 z-20
          flex items-center gap-1.5
          px-3 py-1.5
          rounded-full
          bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]
          text-white
          text-[11px]
          font-bold
          shadow-lg
          ${rtl ? "right-3" : "left-3"}
        `}
        >
          <Icon name="star-fill" className="text-xs" />
          <span>{popularText}</span>
        </div>
      )}

      {/* Image */}
      <div className="relative h-44 sm:h-48 overflow-hidden">
        <img
          src={item.image}
          alt={name}
          loading="lazy"
          className="
          w-full h-full object-cover
          transition-transform duration-700 ease-out
          group-hover:scale-110
        "
        />

        {/* Image overlay */}
        <div
          className="
        absolute inset-0
        bg-gradient-to-t
        from-[var(--bg-card)]
        via-black/30
        to-transparent
      "
        />

        {/* Hover action */}
        <div
          className="
        absolute inset-0
        flex items-center justify-center
        bg-[var(--accent)]/0
        group-hover:bg-[var(--accent)]/25
        transition-all duration-500
      "
        >
          <span
            className="
          opacity-0
          group-hover:opacity-100
          translate-y-3
          group-hover:translate-y-0
          transition-all duration-300
          bg-white/95
          text-[var(--bg-main)]
          px-4 py-2
          rounded-full
          text-sm
          font-semibold
          flex items-center gap-2
          shadow-xl
        "
          >
            <Icon name="eye-line" className="text-base" />
            {viewDetails}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3
          className="
        text-base sm:text-lg
        font-bold
        mb-2
        line-clamp-1
        text-[var(--text-main)]
        transition-colors duration-300
        group-hover:text-[var(--accent)]
      "
        >
          {name}
        </h3>

        <p
          className="
        text-xs sm:text-sm
        text-[var(--text-muted)]
        mb-4
        line-clamp-2
        min-h-[2.6rem]
        leading-relaxed
      "
        >
          {description}
        </p>

        {/* Footer */}
        <div
          className="
        flex items-center justify-between
        pt-1
        border-t border-[var(--border-main)]/50
      "
        >
          <div className="flex flex-col gap-1">
            {item.originalPrice && item.discountPercent ? (
              <>
                <span className="text-xs text-[var(--text-muted)] line-through">
                  {item.originalPrice} {currencySymbol}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[var(--accent)] font-extrabold text-lg sm:text-xl">
                    {item.price}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-[var(--text-muted)]">
                    {currencySymbol}
                  </span>
                  <span className="text-[10px] font-bold bg-[var(--accent)] text-white px-1.5 py-0.5 rounded ml-1">
                    -{item.discountPercent}%
                  </span>
                </div>
              </>
            ) : (
              <span
                className="
              text-[var(--accent)]
              font-extrabold
              text-lg sm:text-xl
              flex items-baseline gap-1
            "
              >
                {item.price}
                <span className="text-xs sm:text-sm font-medium text-[var(--text-muted)]">
                  {currencySymbol}
                </span>
              </span>
            )}
          </div>

          <div
            className="
          w-9 h-9
          rounded-full
          bg-[var(--accent)]/10
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
      </div>
    </div>
  );
});

MenuCard.displayName = "MenuCard";

