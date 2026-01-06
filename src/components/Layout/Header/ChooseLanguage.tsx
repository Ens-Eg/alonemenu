"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

type Language = {
  name: string;
  code: string;
  flag?: string;
  emoji: string;
  nameAr: string;
};

const languages: Language[] = [
  { name: "العربية", nameAr: "العربية", code: "ar", emoji: "🇸🇦" },
  { name: "English", nameAr: "الإنجليزية", code: "en", flag: "/images/flags/usa.svg", emoji: "🇺🇸" },
];

const ChooseLanguage: React.FC = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [active, setActive] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  const handleLanguageChange = (code: string) => {
    if (code === locale) {
      setActive(false);
      return;
    }

    // Use router.push with the current pathname
    // The router from next-intl will automatically handle the locale prefix
    router.push(pathname, { locale: code });
    setActive(false);
  };

  const handleDropdownToggle = () => {
    setActive((prevState) => !prevState);
  };

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="relative language-menu mx-[8px] md:mx-[10px] lg:mx-[12px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0"
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={handleDropdownToggle}
        className={`flex items-center gap-1 leading-none px-2 py-1 rounded transition-all hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-800 ${
          active ? "text-primary-500 bg-gray-100 dark:bg-gray-800" : ""
        }`}
      >
        {currentLanguage.flag ? (
          <Image
            src={currentLanguage.flag}
            alt={currentLanguage.name}
            width={20}
            height={20}
            className="rounded-sm"
          />
        ) : (
          <span className="text-xl">{currentLanguage.emoji}</span>
        )}
        <span className="hidden md:inline-block text-sm font-medium">
          {currentLanguage.name}
        </span>
        <i className="ri-arrow-down-s-line text-[15px]"></i>
      </button>

      {active && (
        <div className="language-menu-dropdown bg-white dark:bg-[#0c1427] transition-all shadow-3xl dark:shadow-none py-2 absolute mt-2 w-[180px] z-[1] top-full ltr:right-0 rtl:left-0 rounded-md border border-gray-100 dark:border-[#172036]">
          <div className="px-3 pb-2 mb-2 border-b border-gray-100 dark:border-[#172036]">
            <span className="block text-black dark:text-white font-semibold text-sm">
              {locale === "ar" ? "اختر اللغة" : "Choose Language"}
            </span>
          </div>

          <ul>
            {languages.map((language) => (
              <li key={language.code}>
                <button
                  type="button"
                  className={`w-full text-left px-3 py-2 font-medium transition-all hover:bg-gray-50 dark:hover:bg-[#0a0e19] flex items-center gap-2 ${
                    language.code === locale
                      ? "text-primary-500 bg-gray-50 dark:bg-[#0a0e19]"
                      : "text-black dark:text-white"
                  }`}
                  onClick={() => handleLanguageChange(language.code)}
                >
                  {language.flag ? (
                    <Image
                      src={language.flag}
                      alt={language.name}
                      width={24}
                      height={24}
                      className="rounded-sm"
                    />
                  ) : (
                    <span className="text-2xl">{language.emoji}</span>
                  )}
                  <span className="flex-1">{language.name}</span>
                  {language.code === locale && (
                    <i className="ri-check-line text-primary-500"></i>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChooseLanguage;
