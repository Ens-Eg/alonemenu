"use client";

import React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

export const Footer = () => {
  const t = useTranslations("Landing.footer");
  const navT = useTranslations("navbar");
  const locale = useLocale();
  const currentYear = new Date().getFullYear();
  const isRTL = locale === "ar";

  const navLinks = [
    { name: navT("home"), path: "#hero" },
    { name: navT("features"), path: "#features" },
    { name: navT("templates"), path: "#templates" },
    { name: navT("pricing"), path: "#pricing" },
    { name: navT("contact"), path: "#contact" },
  ];

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    if (path.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(path);
      if (element) {
        const navbarHeight = 100;
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
    <footer
      id="contact"
      className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300 py-16 overflow-hidden border-t-2 border-teal-500/20"
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-lg blur opacity-50 group-hover:opacity-75 transition" />
                <div className="relative bg-gradient-to-r from-teal-500 to-cyan-500 p-2 rounded-lg">
                  <Image
                    src="/images/ENS-copy.png"
                    alt="ENS Logo"
                    width={120}
                    height={36}
                    className="brightness-0 invert"
                  />
                </div>
              </div>
            </div>
            <p className="text-slate-400 max-w-md mb-6 leading-relaxed text-base">
              {t("description")}
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-teal-400">
              {t("quickLinks")}
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <a
                    href={link.path}
                    onClick={(e) => handleNavClick(e, link.path)}
                    className="text-slate-400 hover:text-teal-400 transition-all duration-300 hover:translate-x-1 inline-block text-base cursor-pointer"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-teal-400">
              {t("contactUs")}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 group">
                <span className="text-2xl">📞</span>
                <a
                  href="tel:+201000000000"
                  className="text-slate-400 hover:text-teal-400 transition-colors text-base"
                  dir="ltr"
                >
                  +20 100 000 0000
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <span className="text-2xl">✉️</span>
                <a
                  href="mailto:info@ens.com"
                  className="text-slate-400 hover:text-teal-400 transition-colors text-base"
                >
                  info@ens.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8">
          <div className="flex flex-col items-center gap-6">
            <p className="text-slate-500 text-base md:text-lg flex items-center gap-2 font-bold">
              © {currentYear}{" "}
              <a
                href="https://www.facebook.com/ENSEGYPTEG"
                className="text-teal-400 hover:text-teal-300 transition-colors hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                ENS
              </a>
              . {locale === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
