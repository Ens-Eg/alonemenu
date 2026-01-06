"use client";

import { useTranslations } from "next-intl";
import {
  Palette,
  BarChart3,
  CreditCard,
  HeadphonesIcon,
  Building2,
  TrendingUp,
  Settings,
  Languages,
} from "@/components/icons/Icons";

const icons = [
  Palette,
  BarChart3,
  CreditCard,
  Settings,
  Building2,
  TrendingUp,
  HeadphonesIcon,
  Languages,
];

const FeaturesSection = () => {
  const t = useTranslations("Landing.features");

  const features = Array.from({ length: 8 }).map((_, i) => ({
    title: t(`items.${i}.title`),
    description: t(`items.${i}.description`),
  }));

  return (
    <section
      id="features"
      className="relative py-20 md:py-32 overflow-hidden
      bg-white dark:bg-[#0d1117]"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-1/3 w-[420px] h-[420px] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-120px] right-1/3 w-[420px] h-[420px] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <span className="inline-flex items-center gap-2 px-5 py-2
            rounded-full text-sm font-semibold
            bg-purple-100/70 dark:bg-purple-500/10
            text-purple-700 dark:text-purple-300
            backdrop-blur-md border border-purple-200/40 dark:border-purple-500/20"
          >
            {t("badge")}
          </span>

          <h2 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-bold
            text-gray-900 dark:text-gray-50 leading-tight"
          >
            {t("title")}{" "}
            <span className="bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent">
              {t("titleHighlight")}
            </span>{" "}
            {t("titleEnd")}
          </h2>

          <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = icons[index];

            return (
              <div
                key={index}
                className="group relative rounded-2xl p-6
                bg-white/70 dark:bg-[#0d1117]/70
                backdrop-blur-xl
                border border-purple-200/40 dark:border-purple-500/20
                shadow-lg shadow-purple-500/5
                transition-all duration-500
                hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20"
              >
                {/* Icon */}
                <div
                  className="mb-6 w-14 h-14 rounded-xl
                  bg-gradient-to-br from-purple-500 to-purple-700
                  flex items-center justify-center
                  shadow-lg shadow-purple-500/30
                  transition-all duration-500
                  group-hover:scale-110 group-hover:rotate-6"
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Text */}
                <h3
                  className="text-xl font-bold mb-3
                  text-gray-900 dark:text-gray-50
                  group-hover:text-purple-600 dark:group-hover:text-purple-400
                  transition-colors"
                >
                  {feature.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                  {feature.description}
                </p>

                {/* Hover glow */}
                <span
                  className="pointer-events-none absolute inset-0 rounded-2xl
                  opacity-0 group-hover:opacity-100 transition
                  bg-gradient-to-br from-purple-500/10 to-transparent"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
