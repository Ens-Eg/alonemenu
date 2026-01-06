"use client";

import React, { useEffect } from "react";
import { MenuItem } from "../types";
import { useLanguage } from "../context";
import { Icon } from "./Icon";
import { getCurrencyByCode } from "@/constants/currencies";

// ============================
// Modal Component
// ============================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  currency?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, item, currency = "SAR" }) => {
  const { locale, direction } = useLanguage();
  const rtl = direction === "rtl";
  const currencySymbol = getCurrencyByCode(currency)?.symbol || currency;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const name = locale === "ar" ? item.nameAr : item.nameEn;
  const description = locale === "ar" ? item.descriptionAr : item.descriptionEn;
  const popularText = locale === "ar" ? "الأكثر طلباً" : "Popular";
  const priceLabel = locale === "ar" ? "السعر" : "Price";
  
  // Get category label if available
  const categoryLabels: Record<string, { ar: string; en: string }> = {
    appetizers: { ar: "المقبلات", en: "Appetizers" },
    mains: { ar: "الأطباق الرئيسية", en: "Main Courses" },
    drinks: { ar: "المشروبات", en: "Beverages" },
    desserts: { ar: "الحلويات", en: "Desserts" },
  };
  
  const getCategoryLabel = () => {
    if (!item.category || !categoryLabels[item.category]) {
      return locale === "ar" ? "منتج" : "Item";
    }
    return locale === "ar"
      ? categoryLabels[item.category].ar
      : categoryLabels[item.category].en;
  };
  
  const categoryLabel = getCategoryLabel();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal Content */}
      <div
        dir={direction}
        className="relative w-full max-w-lg bg-[var(--bg-card)] rounded-3xl overflow-hidden border border-[var(--border-main)] shadow-2xl animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 z-30 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[var(--accent)] transition-all duration-300 ${
            rtl ? "left-4" : "right-4"
          }`}
        >
          <Icon name="close-line" className="text-xl" />
        </button>

        {/* Image */}
        <div className="relative h-64 sm:h-72 overflow-hidden">
          <img
            src={item.image}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent" />

          {/* Popular Badge */}
          {item.isPopular && (
            <div
              className={`absolute top-4 flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white text-xs font-bold shadow-lg ${
                rtl ? "right-4" : "left-4"
              }`}
            >
              <Icon name="star-fill" className="text-sm" />
              <span>{popularText}</span>
            </div>
          )}

          {/* Category Badge */}
          <div
            className={`absolute bottom-4 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-medium border border-white/20 ${
              rtl ? "right-4" : "left-4"
            }`}
          >
            {categoryLabel}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <h2 className="text-2xl font-bold text-[var(--text-main)]">{name}</h2>

          {/* Description */}
          <p className="text-[var(--text-muted)] leading-relaxed text-base">
            {description}
          </p>

          {/* Divider */}
          <div className="h-px bg-[var(--border-main)]" />

          {/* Price Section */}
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)] text-sm">
              {priceLabel}
            </span>
            <div className="flex flex-col items-end gap-1">
              {item.originalPrice && item.discountPercent ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-[var(--text-muted)] line-through">
                      {item.originalPrice} {currencySymbol}
                    </span>
                    <span className="text-xs font-bold bg-[var(--accent)] text-white px-2 py-0.5 rounded">
                      -{item.discountPercent}%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-[var(--accent)]">
                      {item.price}
                    </span>
                    <span className="text-lg text-[var(--text-muted)]">{currencySymbol}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[var(--accent)]">
                    {item.price}
                  </span>
                  <span className="text-lg text-[var(--text-muted)]">{currencySymbol}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

