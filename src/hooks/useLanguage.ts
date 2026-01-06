"use client";

import { useLocale } from "next-intl";

export function useLanguage() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const isArabic = locale === "ar";
  const isEnglish = locale === "en";

  return {
    locale,
    isRTL,
    isArabic,
    isEnglish,
    direction: isRTL ? "rtl" : "ltr",
  };
}

