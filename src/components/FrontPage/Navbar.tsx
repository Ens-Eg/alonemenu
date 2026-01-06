"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Menu, X, Moon, Sun, Globe } from "@/components/icons/Icons";

const Navbar = () => {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("navbar");

  const isRTL = locale === "ar";

  const NAV_ITEMS = [
    { key: "home", path: "/" },
    { key: "features", path: "/features" },
    { key: "useCases", path: "/use-cases" },
    { key: "pricing", path: "/pricing" },
    { key: "contact", path: "#contact" }
  ];

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      document.documentElement.classList.toggle("dark", newTheme);
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };

  useEffect(() => {
    const onScroll = () => setIsSticky(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleLanguage = () => {
    const cleanPath = pathname.replace(/^\/(ar|en)/, "") || "/";
    window.location.href = `/${locale === "ar" ? "en" : "ar"}${cleanPath}`;
  };

  const withLocale = (path: string) =>
    path.startsWith("#") ? path : `/${locale}${path}`;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all ${
        isSticky
          ? "backdrop-blur-xl bg-white/70 dark:bg-[#0d1117]/70 shadow-lg"
          : "bg-transparent"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-[80px]">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <Image
              src="/images/ENS-copy.png"
              alt="ENS Logo"
              width={110}
              height={32}
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={withLocale(item.path)}
                className={`text-sm font-medium transition-colors ${
                  pathname === withLocale(item.path)
                    ? "text-purple-600"
                    : "text-gray-700 dark:text-gray-300 hover:text-purple-600"
                }`}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language */}
            <button
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-purple-100 dark:hover:bg-purple-500/20 transition"
            >
              <Globe className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Dark Mode */}
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle theme"
              className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-purple-100 dark:hover:bg-purple-500/20 transition"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* CTA */}
            <Link
              href={`/${locale}/authentication/sign-in`}
              className="ml-2 inline-flex items-center justify-center rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition shadow-glow"
            >
              {t("login")}
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-md hover:bg-purple-100 dark:hover:bg-purple-500/20"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden mt-4 rounded-2xl bg-white dark:bg-[#0d1117] shadow-xl p-6 space-y-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={withLocale(item.path)}
                onClick={() => setIsOpen(false)}
                className="block text-gray-800 dark:text-gray-300 font-medium hover:text-purple-600"
              >
                {t(item.key)}
              </Link>
            ))}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 text-sm"
              >
                <Globe className="w-5 h-5" />
                {t("language")}
              </button>

              <button onClick={toggleDarkMode}>
                {isDarkMode ? <Sun /> : <Moon />}
              </button>
            </div>

            <Link
              href={`/${locale}/authentication/sign-in`}
              className="block text-center rounded-lg bg-purple-600 py-2 font-semibold text-white hover:bg-purple-700 transition"
            >
              {t("login")}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
