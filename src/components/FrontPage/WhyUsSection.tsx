"use client";

import { useTranslations } from "next-intl";
import { Check, Sparkles } from "@/components/icons/Icons";
import { useLanguage } from "@/hooks/useLanguage";

interface WhyUsItemProps {
  text: string;
  index: number;
}

const WhyUsItem = ({ text, index }: WhyUsItemProps) => {
  return (
    <div
      className="group relative rounded-xl p-6 border-2 backdrop-blur-sm
        bg-gradient-to-br from-white/60 to-white/30
        dark:from-gray-800/60 dark:to-gray-800/40
        border-gray-200/50 dark:border-gray-700/50
        shadow-lg hover:shadow-2xl
        transition-all duration-500
        hover:scale-[1.04]
        hover:border-purple-500/50 dark:hover:border-purple-400/50
        animate-fade-in"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Hover Glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition duration-500
        bg-gradient-to-br from-purple-500/10 to-transparent"
      />

      <div className="relative flex gap-4 items-start">
        {/* Icon */}
        <div className="w-10 h-10 flex-shrink-0 rounded-full
          bg-purple-500/10 dark:bg-purple-500/25
          flex items-center justify-center
          group-hover:bg-purple-500/20 dark:group-hover:bg-purple-500/35
          transition-colors duration-300"
        >
          <Check className="w-5 h-5 text-purple-600 dark:text-purple-400
            group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Text */}
        <p className="text-lg font-medium leading-relaxed text-gray-900 dark:text-gray-100">
          {text}
        </p>
      </div>

      {/* Sparkle */}
      <Sparkles
        className="absolute top-4 right-4 w-4 h-4
          text-purple-500/30 dark:text-purple-400/40
          opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />
    </div>
  );
};

export default function WhyUsSection() {
  const t = useTranslations("Landing.whyUs");
  const { isRTL } = useLanguage();

  const items = [
    t("items.0"),
    t("items.1"),
    t("items.2"),
    t("items.3"),
  ];

  return (
    <section
      id="features"
      className="relative overflow-hidden py-20 px-4
        bg-gradient-to-b from-white to-purple-50/50
        dark:from-[#0d1117] dark:to-gray-900/50"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Background Blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl
          bg-purple-500/10 dark:bg-purple-500/20 animate-pulse-slow"
        />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl
          bg-purple-500/10 dark:bg-purple-500/20 animate-pulse-slow delay-1000"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Title */}
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full
            bg-purple-500/10 dark:bg-purple-500/25"
          >
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
              {t("badge")}
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gradient-enhanced animate-gradient">
            {t("title")}
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item, index) => (
            <WhyUsItem key={index} text={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
