"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { Locale } from "../types";
import { translations, TranslationType } from "../translations";

// ============================
// Context: Language
// ============================

interface LanguageContextType {
  locale: Locale;
  t: TranslationType;
  direction: "rtl" | "ltr";
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [locale, setLocale] = useState<Locale>("ar");

  const toggleLanguage = useCallback(() => {
    setLocale((prev) => (prev === "ar" ? "en" : "ar"));
  }, []);

  const direction = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = direction;
      document.documentElement.lang = locale;
    }
  }, [locale, direction]);

  const value: LanguageContextType = {
    locale,
    t: translations[locale],
    direction,
    toggleLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

