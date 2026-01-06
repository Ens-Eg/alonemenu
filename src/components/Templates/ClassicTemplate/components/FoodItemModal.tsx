"use client";

import React from "react";
import { useLocale } from "next-intl";
import { X } from "@/components/icons/Icons";
import { FoodItemModalProps } from "./types";

export const FoodItemModal: React.FC<FoodItemModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const locale = useLocale();
  const isRTL = locale === "ar";

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden ${
          isRTL ? "rtl" : "ltr"
        }`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 flex items-center justify-center transition-colors shadow-lg"
        >
          <X className="w-6 h-6 text-slate-700 dark:text-slate-300" />
        </button>

        {/* Image */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img
            src={item.image}
            alt={locale === "ar" ? item.nameAr : item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-lg">
              {locale === "ar" ? item.nameAr : item.name}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-teal-400">
                ${item.price}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
              {locale === "ar" ? "الوصف" : "Description"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
              {locale === "ar" ? item.descriptionAr : item.description}
            </p>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {locale === "ar" ? "السعر" : "Price"}
              </span>
              <div className="text-3xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                ${item.price}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
