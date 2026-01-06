"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

import { useLocale } from "next-intl";

import ProfileMenu from "../Header/ProfileMenu";
import DarkMode from "../Header/DarkMode";
import Fullscreen from "../Header/Fullscreen";
import { usePathname } from "next/navigation";

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const locale = useLocale();

  const handleLanguageChange = (newLocale: string) => {
    // Get pathname without locale prefix
    const pathnameWithoutLocale = pathname.replace(/^\/(ar|en)/, "") || "/";
    // Navigate to the same page with the new locale
    window.location.href = `/${newLocale}${pathnameWithoutLocale}`;
  };

  const languages = [
    { code: "ar", name: "العربية", emoji: "🇸🇦" },
    { code: "en", name: "English", flag: "/images/flags/usa.svg", emoji: "🇺🇸" },
  ];

  const currentLanguage =
    languages.find((lang) => lang.code === locale) || languages[0];

  return (
    <nav className="bg-white dark:bg-[#0c1427] border-b border-gray-200 dark:border-[#172036] sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link
              href={`/${locale}/menus`}
              className="text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
            >
              SaaS Menu
            </Link>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Language Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  handleLanguageChange(locale === "ar" ? "en" : "ar")
                }
                className="inline-flex items-center justify-center w-[40px] h-[40px] rounded-md transition-all hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                title={
                  locale === "ar" ? "Switch to English" : "التبديل إلى العربية"
                }
              >
                <i className="material-symbols-outlined !text-[20px] md:!text-[22px]">
                  translate
                </i>
              </button>
            </div>

            <DarkMode />

            <Fullscreen />

            <ProfileMenu context="menus" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
