"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Check, Star, Sparkles } from "@/components/icons/Icons";

const PricingSection = () => {
  const t = useTranslations("Landing.pricing");

  const packages = Array.from({ length: 3 }).map((_, i) => ({
    name: t(`packages.${i}.name`),
    originalPrice: t(`packages.${i}.originalPrice`),
    price: t(`packages.${i}.price`),
    features: Array.from({ length: 5 }).map((_, f) =>
      t(`packages.${i}.features.${f}`)
    ),
    enterpriseCta: t(`packages.${i}.enterpriseCta`),
  }));

  return (
    <section
      id="packages"
      className="relative py-20 md:py-32 overflow-hidden
      bg-gray-50 dark:bg-[#0d1117]"
    >
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/4 w-[420px] h-[420px]
          bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[420px] h-[420px]
          bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[140px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold
            text-gray-900 dark:text-gray-50"
          >
            {t("title")}{" "}
            <span className="bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent">
              {t("titleHighlight")}
            </span>
          </h2>

          <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300">
            {t("description")}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {packages.map((pkg, index) => {
            const isPopular = index === 1;
            const isEnterprise = index === 2;

            return (
              <div
                key={index}
                className={`relative rounded-3xl p-8
                backdrop-blur-xl transition-all duration-500
                border
                ${
                  isPopular
                    ? "bg-white/80 dark:bg-[#0d1117]/80 border-purple-500/60 shadow-2xl shadow-purple-500/30 scale-[1.06] z-10"
                    : "bg-white/70 dark:bg-[#0d1117]/70 border-purple-200/40 dark:border-purple-500/20 hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/20"
                }`}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-2 px-5 py-2
                      rounded-full text-sm font-bold text-white
                      bg-gradient-to-r from-purple-600 to-purple-700
                      shadow-lg shadow-purple-500/40"
                    >
                      <Star className="w-4 h-4 fill-current" />
                      {t("mostPopular")}
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                )}

                {/* Discount */}
                {index === 0 && (
                  <span className="inline-flex px-4 py-1 rounded-full text-sm font-semibold
                    bg-purple-100/70 dark:bg-purple-500/10
                    text-purple-700 dark:text-purple-300"
                  >
                    {t("save40")}
                  </span>
                )}

                {/* Name */}
                <h3 className="mt-4 text-2xl font-bold
                  text-purple-800 dark:text-purple-300"
                >
                  {pkg.name}
                </h3>

                {/* Price */}
                <div className="mt-6 mb-8">
                  {pkg.originalPrice && !isEnterprise && (
                    <span className="block text-gray-400 line-through text-lg">
                      {pkg.originalPrice} {t("egp")}
                    </span>
                  )}

                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-extrabold
                      bg-gradient-to-r from-purple-500 to-purple-700
                      bg-clip-text text-transparent"
                    >
                      {isEnterprise ? t("contactUs") : pkg.price}
                    </span>

                    {!isEnterprise && (
                      <span className="text-gray-500 dark:text-gray-400">
                        {t("egp")} / {t("yearly")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-10">
                  {pkg.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-3">
                      <span className="w-6 h-6 min-w-[24px] rounded-full
                        bg-purple-100 dark:bg-purple-500/20
                        inline-flex items-center justify-center leading-none"
                      >
                        <i className="material-symbols-outlined text-purple-600 dark:text-purple-400 !text-[14px] !leading-none">
                          check
                        </i>
                      </span>
                      <span className="text-gray-600 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  size="lg"
                  className={`w-full font-semibold transition-all duration-300
                  ${
                    isPopular
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:scale-105 shadow-lg shadow-purple-500/40"
                      : isEnterprise
                      ? "border border-dashed border-purple-400 text-purple-700 dark:text-purple-300 hover:bg-purple-100/50 dark:hover:bg-purple-500/10"
                      : "border border-purple-300 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                  }`}
                  asChild
                >
                  <a href="#contact">{pkg.enterpriseCta}</a>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
