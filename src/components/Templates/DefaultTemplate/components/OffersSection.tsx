"use client";

import React from "react";
import { useLanguage } from "../context";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { SmallAdCard } from "./SmallAdCard";
import { MenuItem } from "../../types";

// ============================
// Offers Section Component
// ============================

interface OffersSectionProps {
  items: MenuItem[];
}

export const OffersSection: React.FC<OffersSectionProps> = ({ items }) => {
  const { locale, direction } = useLanguage();
  const rtl = direction === "rtl";

  // Convert menu items to ad format for SmallAdCard
  const adsFromItems = items.map((item) => ({
    id: item.id.toString(),
    titleAr: item.name,
    titleEn: item.name,
    descriptionAr: item.description,
    descriptionEn: item.description,
    image: item.image,
    discount: item.discountPercent ? `${item.discountPercent}%` : undefined,
    badge: item.discountPercent
      ? { ar: "عرض خاص", en: "Special Offer" }
      : undefined,
  }));

  // If no offers, don't show the section
  if (adsFromItems.length === 0) {
    return null;
  }

  return (
    <section
      className="
  relative overflow-hidden
  py-10 sm:py-16
"
    >
      {/* Background wash */}
      <div
        className="
    absolute inset-0
    bg-gradient-to-b from-transparent via-[var(--accent)]/6 to-transparent
  "
      />

      {/* Decorative blur */}
      <div className="absolute top-1/2 -left-20 w-72 h-72 bg-[var(--accent)]/10 blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/3 -right-20 w-72 h-72 bg-[var(--accent-2)]/10 blur-3xl" />

      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        {/* Header */}
        <div
          className={`
        flex items-center justify-between
        mb-6 sm:mb-10
        ${rtl ? "flex-row-reverse" : ""}
      `}
        >
          <div
            className={`flex items-center gap-3 ${
              rtl ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className="
          w-11 h-11
          rounded-xl
          bg-[var(--accent)]/20
          flex items-center justify-center
          shadow-sm
        "
            >
              <Icon
                name="gift-2-fill"
                className="text-[var(--accent)] text-xl"
              />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--text-main)] leading-tight">
                {locale === "ar" ? "عروض خاصة" : "Special Offers"}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                {locale === "ar" ? "لا تفوت الفرصة!" : "Don't miss out!"}
              </p>
            </div>
          </div>

          {/* View all */}
          <Button
            variant="ghost"
            size="sm"
            className="
          text-xs sm:text-sm
          gap-1.5
          group
        "
          >
            <span>{locale === "ar" ? "عرض الكل" : "View All"}</span>
            <Icon
              name={rtl ? "arrow-left-s-line" : "arrow-right-s-line"}
              className="
            text-base
            transition-transform duration-300
            group-hover:translate-x-1
          "
            />
          </Button>
        </div>

        {/* Grid */}
        <div
          className="
      grid grid-cols-2
      lg:grid-cols-4
      gap-3 sm:gap-5
    "
        >
          {adsFromItems.map((ad) => (
            <SmallAdCard key={ad.id} ad={ad} />
          ))}
        </div>
      </div>
    </section>
  );
};

