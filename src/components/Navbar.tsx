"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Globe, Moon, Sun, Menu } from "@/components/icons/Icons";

interface NavbarProps {
  onOpenSignIn?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenSignIn }) => {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("navbar");
  const navRef = useRef<HTMLDivElement>(null);

  const NAV_ITEMS = [
    { key: "home", path: "#hero" },
    { key: "features", path: "#features" },
    { key: "team", path: "#how-it-works" },
    { key: "faq", path: "#packages" },
    { key: "contact", path: "#contact" },
  ];

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [activeSection, setActiveSection] = useState("#hero");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };

    if (mobileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileOpen]);

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const onScroll = () => setIsSticky(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = NAV_ITEMS.map((item) => item.path.replace("#", ""));
      const scrollPosition = window.scrollY + 150;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(`#${sections[i]}`);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const switchLanguage = () => {
    const basePath = pathname.replace(/^\/(ar|en)/, "") || "/";
    window.location.href = `/${locale === "ar" ? "en" : "ar"}${basePath}`;
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    if (path.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(path);
      if (element) {
        const navbarHeight = 100; // Approximate navbar height
        const elementPosition =
          element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - navbarHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all ${
        isSticky ? "py-3" : "py-5 md:py-6"
      }`}
    >
      <div className="container mx-auto px-4" ref={navRef}>
        <div
          className={`flex items-center justify-between rounded-2xl px-6 py-4 backdrop-blur-xl transition-all
          bg-white/70 dark:bg-[#0d1117]/70
          border border-purple-200/40 dark:border-purple-500/20
          shadow-lg shadow-purple-500/5`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
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
              <a
                key={item.key}
                href={item.path}
                onClick={(e) => handleNavClick(e, item.path)}
                className={`relative font-medium transition-colors cursor-pointer
                ${
                  activeSection === item.path
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                }`}
              >
                {t(item.key)}
                {activeSection === item.path && (
                  <span className="absolute -bottom-2 left-0 w-full h-[2px] rounded-full bg-purple-500" />
                )}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Language */}
            <button
              onClick={switchLanguage}
              className="w-10 h-10 flex items-center justify-center rounded-lg
              hover:bg-purple-100 dark:hover:bg-purple-500/20
              text-gray-700 dark:text-gray-300 transition"
              title={locale === "ar" ? "English" : "العربية"}
            >
              <Globe size={18} />
            </button>

            {/* Theme */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-10 flex items-center justify-center rounded-lg
              hover:bg-purple-100 dark:hover:bg-purple-500/20
              text-purple-600 dark:text-purple-400 transition"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Login */}
            <Link
              href={`/${locale}/authentication/sign-in`}
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
              bg-purple-600 hover:bg-purple-700 text-white font-semibold
              transition shadow-glow"
            >
              {t("login")}
            </Link>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg
              hover:bg-purple-100 dark:hover:bg-purple-500/20"
            >
              <Menu />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            className="lg:hidden mt-4 rounded-2xl p-6
            bg-white/90 dark:bg-[#0d1117]/90 backdrop-blur-xl
            border border-purple-200/40 dark:border-purple-500/20
            shadow-xl"
          >
            <nav className="flex flex-col gap-5">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.key}
                  href={item.path}
                  onClick={(e) => {
                    handleNavClick(e, item.path);
                    setMobileOpen(false);
                  }}
                  className={`font-medium transition-colors cursor-pointer
                  ${
                    activeSection === item.path
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {t(item.key)}
                </a>
              ))}

              <Link
                href={`/${locale}/authentication/sign-in`}
                className="mt-4 inline-flex justify-center items-center px-5 py-3 rounded-xl
                bg-purple-600 hover:bg-purple-700 text-white font-semibold transition"
              >
                {t("login")}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
