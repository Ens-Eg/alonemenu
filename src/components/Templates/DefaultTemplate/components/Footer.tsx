"use client";

import React, { useMemo } from "react";
import { useLanguage } from "../context";
import { Icon } from "./Icon";
import { Branch } from "../../types";

// ============================
// Footer Component
// ============================

interface FooterProps {
  menuName: string;
  branches: Branch[];
}

export const Footer: React.FC<FooterProps> = ({ menuName, branches }) => {
  const { t, direction } = useLanguage();

  const socialLinks = useMemo(
    () => [
      { icon: "instagram-line", href: "#" },
      { icon: "twitter-x-line", href: "#" },
      { icon: "facebook-circle-line", href: "#" },
    ],
    []
  );

  return (
    <footer
      id="contact"
      dir={direction}
      className="
    relative overflow-hidden
    bg-[var(--bg-card)]
    border-t border-[var(--border-main)]
   py-4 sm:py-6 md:py-10
   pb-16 sm:pb-18 md:pb-20
  "
    >
      {/* Ambient glow */}
      <div
        className="
    absolute bottom-0 left-1/2 -translate-x-1/2
    w-[420px] md:w-[720px]
    h-[220px] md:h-[340px]
    bg-[var(--accent)]/8
    rounded-full blur-3xl
    pointer-events-none
  "
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Top */}
        <div
          className="
      grid grid-cols-1
      sm:grid-cols-2
      md:grid-cols-3
      gap-8 sm:gap-10 md:gap-14
      text-start
    "
        >
          {/* Brand */}
          <div>
            <h3
              className="
          text-xl sm:text-2xl
          font-extrabold
          bg-gradient-to-r
          from-[var(--accent)]
          to-[var(--accent-2)]
          bg-clip-text
          text-transparent
          mb-3
        "
            >
              {t.brand}
            </h3>
            <p
              className="
          text-sm sm:text-base
          text-[var(--text-muted)]
          max-w-sm
          leading-relaxed
        "
            >
              {t.tagline}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="
          text-base sm:text-lg
          font-semibold
          text-[var(--text-main)]
          mb-4
        "
            >
              {t.nav.contact}
            </h4>

            <ul className="space-y-3">
              <li
                className="
            flex items-start gap-3
            text-sm sm:text-base
            text-[var(--text-muted)]
            transition-colors
            hover:text-[var(--text-main)]
          "
              >
                <Icon
                  name="map-pin-line"
                  className="text-lg sm:text-xl text-[var(--accent)] mt-0.5 shrink-0"
                />
                <span>{t.footer.address}</span>
              </li>

              <li
                className="
            flex items-center gap-3
            text-sm sm:text-base
            text-[var(--text-muted)]
            transition-colors
            hover:text-[var(--text-main)]
          "
              >
                <Icon
                  name="phone-line"
                  className="text-lg sm:text-xl text-[var(--accent)] shrink-0"
                />
                <span dir="ltr">{t.footer.phone}</span>
              </li>

              <li
                className="
            flex items-center gap-3
            text-sm sm:text-base
            text-[var(--text-muted)]
            transition-colors
            hover:text-[var(--text-main)]
          "
              >
                <Icon
                  name="time-line"
                  className="text-lg sm:text-xl text-[var(--accent)] shrink-0"
                />
                <span>{t.footer.hours}</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="sm:col-span-2 md:col-span-1">
            <h4
              className="
          text-base sm:text-lg
          font-semibold
          text-[var(--text-main)]
          mb-4
        "
            >
              {t.footer.followUs}
            </h4>

            <div className="flex gap-3">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                w-10 h-10 sm:w-11 sm:h-11
                rounded-full
                bg-[var(--bg-main)]
                border border-[var(--border-main)]
                flex items-center justify-center
                text-[var(--text-muted)]
                transition-all duration-300
                hover:bg-[var(--accent)]
                hover:border-[var(--accent)]
                hover:text-white
                hover:scale-110
              "
                >
                  <Icon name={social.icon} className="text-lg sm:text-xl" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="
      mt-8 sm:mt-10 md:mt-12
      pt-5 sm:pt-6
      border-t border-[var(--border-main)]
      text-center
      flex flex-col items-center
      gap-1.5
    "
        >
          <p
            dir="ltr"
            className="
          text-xs sm:text-sm
          text-[var(--text-muted)]
          leading-relaxed
        "
          >
            © {new Date().getFullYear()} {t.brand}. {t.footer.rights}
          </p>

          <p
            className="
        flex items-center justify-center
        gap-1
        text-xs sm:text-sm
        text-[var(--text-muted)]
      "
          >
            <span>{t.footer.designedBy}</span>
            <a
              href="https://www.facebook.com/ENSEGYPTEG"
              target="_blank"
              rel="noopener noreferrer"
              className="
            font-semibold
            text-[var(--accent)]
            hover:underline
            transition
          "
            >
              ENS
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

