"use client";

import { useTranslations } from "next-intl";
import { Package, ListPlus, Share2 } from "@/components/icons/Icons";
import { useLanguage } from "@/hooks/useLanguage";

const icons = [Package, ListPlus, Share2];

const HowItWorks = () => {
  const t = useTranslations("Landing.howItWorks");
  const { isRTL } = useLanguage();

  const steps = Array.from({ length: 3 }).map((_, i) => ({
    number: t(`steps.${i}.number`),
    title: t(`steps.${i}.title`),
    description: t(`steps.${i}.description`),
  }));

  return (
    <section
      id="how-it-works"
      className="relative py-20 md:py-32 overflow-hidden
      bg-gray-50 dark:bg-[#0d1117]"
    >
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-full h-px
          bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"
        />
        <div className="absolute -top-24 right-1/3 w-[360px] h-[360px]
          bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[120px]"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span
            className="inline-flex px-5 py-2 rounded-full text-sm font-semibold
            bg-purple-100/70 dark:bg-purple-500/10
            text-purple-700 dark:text-purple-300
            backdrop-blur-md border border-purple-200/40 dark:border-purple-500/20"
          >
            {t("badge")}
          </span>

          <h2 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-bold
            text-gray-900 dark:text-gray-50"
          >
            {t("title")}{" "}
            <span className="bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent">
              {t("titleHighlight")}
            </span>
          </h2>

          <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = icons[index];

            return (
              <div key={index} className="relative group">
                {/* Connector */}
                {index < steps.length - 1 && (
                  <span
                    className={`hidden md:block absolute top-[110px]
                    ${isRTL ? "-left-10" : "-right-10"}
                    w-20 h-px
                    bg-gradient-to-r from-transparent via-purple-400/50 to-transparent`}
                  />
                )}

                <div
                  className="relative rounded-2xl p-8 text-center
                  bg-white/70 dark:bg-[#0d1117]/70
                  backdrop-blur-xl
                  border border-purple-200/40 dark:border-purple-500/20
                  shadow-lg shadow-purple-500/5
                  transition-all duration-500
                  hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20"
                >
                  {/* Step Number */}
                  <div
                    className="mb-4 text-5xl font-extrabold
                    text-purple-600/80 dark:text-purple-400/80
                    transition-all duration-300
                    group-hover:text-purple-600
                    group-hover:scale-110
                    group-hover:drop-shadow-[0_0_16px_rgba(168,85,247,0.4)]"
                  >
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div
                    className="mx-auto mb-6 w-16 h-16 rounded-2xl
                    bg-gradient-to-br from-purple-500 to-purple-700
                    flex items-center justify-center
                    shadow-lg shadow-purple-500/30
                    transition-all duration-500
                    group-hover:scale-110 group-hover:rotate-6"
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3
                    className="text-2xl font-bold mb-4
                    text-gray-900 dark:text-gray-50
                    group-hover:text-purple-600 dark:group-hover:text-purple-400
                    transition-colors"
                  >
                    {step.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
