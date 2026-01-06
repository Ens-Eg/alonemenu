"use client";

import React from "react";
import { useLanguage } from "../context";
import { Button } from "./Button";
import { Icon } from "./Icon";

// ============================
// Hero Section Component
// ============================

interface HeroSectionProps {
  menuName: string;
  description?: string;
  logo?: string;
  rating: {
    average: number;
    total: number;
  };
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  menuName,
  description,
  logo,
  rating,
}) => {
  const { t, direction } = useLanguage();
  const rtl = direction === "rtl";

  const scrollToMenu = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="
  relative min-h-[100svh]
  flex items-center justify-center
  overflow-hidden
"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&h=900&fit=crop"
          alt="Hero background"
          className="
        w-full h-full object-cover
        scale-110
      "
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/65" />

        {/* Depth gradient */}
        <div
          className="
      absolute inset-0
      bg-gradient-to-b
      from-[var(--bg-main)]/95
      via-transparent
      to-[var(--bg-main)]
    "
        />
      </div>

      {/* Floating lights */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="
      absolute top-1/4 left-1/4
      w-56 md:w-72 h-56 md:h-72
      bg-[var(--accent)]/18
      rounded-full blur-3xl
      animate-float
    "
        />
        <div
          className="
        absolute bottom-1/4 right-1/4
        w-72 md:w-[28rem] h-72 md:h-[28rem]
        bg-[var(--accent-2)]/14
        rounded-full blur-3xl
        animate-float
      "
          style={{ animationDelay: "2.5s" }}
        />
      </div>

      {/* Content */}
      <div
        className={`
      relative z-10
      container mx-auto px-4
      text-center
      ${rtl ? "font-cairo" : "font-poppins"}
    `}
      >
        {/* Badge */}
        <div
          className="
      inline-flex items-center gap-2
      px-4 py-2
      rounded-full
      bg-[var(--accent)]/10
      border border-[var(--accent)]/30
      backdrop-blur-md
      mb-6 md:mb-8
      shadow-sm
    "
        >
          <Icon
            name="sparkling-2-line"
            className="text-sm text-[var(--accent)] animate-pulse"
          />
          <span className="text-xs sm:text-sm text-[var(--accent)] font-medium">
            {t.tagline}
          </span>
        </div>

        {/* Title */}
        <h1
          className="
      text-4xl sm:text-5xl md:text-6xl lg:text-7xl
      font-extrabold
      leading-[1.05]
      tracking-tight
      mb-5 md:mb-6
    "
        >
          <span className="text-[var(--text-main)] block">{t.hero.title}</span>

          <span
            className="
        block
        bg-gradient-to-r
        from-[var(--accent)]
        to-[var(--accent-2)]
        bg-clip-text
        text-transparent
        drop-shadow-[0_10px_30px_rgba(0,0,0,0.4)]
      "
          >
            {menuName}
          </span>

          <span className="text-[var(--text-main)] block">
            {t.hero.subtitle}
          </span>
        </h1>

        {/* Description */}
        <p
          className="
      text-base sm:text-lg md:text-xl
      text-[var(--text-muted)]
      max-w-2xl mx-auto
      leading-relaxed
      mb-8 md:mb-10
      px-2
    "
        >
          {description || t.hero.description}
        </p>

        {/* CTA */}
        <div>
          <Button
            variant="hero"
            size="lg"
            onClick={scrollToMenu}
            className="
          group
          text-base sm:text-lg
          px-6 py-3 sm:px-9 sm:py-4
          shadow-[0_20px_50px_-15px_var(--accent)]
        "
          >
            <span>{t.hero.cta}</span>
            <Icon
              name="arrow-down-s-line"
              className="
            text-xl
            transition-transform duration-300
            group-hover:translate-y-1.5
          "
            />
          </Button>
        </div>
      </div>
    </section>
  );
};

