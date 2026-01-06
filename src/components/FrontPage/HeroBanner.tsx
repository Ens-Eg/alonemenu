"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "@/components/icons/Icons";
import { useLanguage } from "@/hooks/useLanguage";

const HeroSection = () => {
  const t = useTranslations("heroSection");
  const { isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section
      id="hero"
      className="pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-[#0d1117] dark:to-gray-900 overflow-hidden relative"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/30 rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 dark:bg-purple-500/15 rounded-full blur-3xl animate-spin-slow" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div
          className={`flex flex-col ${
            isRTL ? "md:flex-row-reverse" : "md:flex-row"
          } items-center gap-12 md:gap-16`}
        >
          {/* Text */}
          <div
            className={`flex-1 text-center ${
              isRTL ? "md:text-right" : "md:text-left"
            }`}
          >
            {/* Title */}
            <h1 className="mb-8">
              <span className="block text-lg md:text-xl lg:text-2xl font-medium text-gray-700 dark:text-gray-300 mb-3 animate-slide-up">
                {t("title1")}
              </span>

              <span className="block text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight tracking-normal animate-slide-up">
                <span className="relative inline-block text-gray-900 dark:text-gray-50 drop-shadow-[0_8px_30px_rgba(124,58,237,0.25)]">
                  {t("title2")}
                  <span
                    className={`absolute -bottom-2 h-3 w-full bg-purple-500/20 dark:bg-purple-500/30 -z-10 rounded-md ${
                      isRTL ? "right-0" : "left-0"
                    }`}
                  />
                </span>
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-sm md:text-base lg:text-lg font-medium text-purple-700 dark:text-purple-400 mb-6 animate-slide-up opacity-0"
              style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
            >
              {t("subtitle")}
            </p>

            {/* Description */}
            <p
              className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto md:mx-0 mb-6 animate-slide-up opacity-0 leading-relaxed"
              style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}
            >
              {t("description")}
            </p>

            {/* Trust Chips */}
            <div
              className="flex flex-wrap gap-3 justify-center mb-8 animate-slide-up opacity-0"
              style={{ animationDelay: "0.35s", animationFillMode: "forwards" }}
            >
              {t("trust")
                .split("•")
                .map((item) => (
                  <span
                    key={item}
                    className="px-4 py-1 text-sm rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300"
                  >
                    {item.trim()}
                  </span>
                ))}
            </div>

            {/* CTA */}
            <div
              className="animate-slide-up opacity-0"
              style={{ animationDelay: "0.45s", animationFillMode: "forwards" }}
            >
              <Button
                variant="hero"
                size="xl"
                asChild
                className="group relative overflow-hidden hover:scale-105 transition-all duration-300 shadow-glow text-white font-semibold"
              >
                <a href="#contact" className="flex items-center gap-2">
                  <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 text-white drop-shadow-sm">
                    {t("cta")}
                  </span>
                  <ArrowIcon
                    className={`relative z-10 w-5 h-5 text-white transition-transform duration-300 ${
                      isRTL
                        ? "group-hover:-translate-x-1"
                        : "group-hover:translate-x-1"
                    }`}
                  />
                </a>
              </Button>
            </div>
          </div>

          {/* Video */}
          <div className="flex-1 flex justify-center perspective-1000">
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-purple-500/20 dark:bg-purple-500/40 blur-3xl rounded-full scale-75 animate-glow-pulse" />
              <video
                src="https://cdn.prod.website-files.com/64ef7d0d34ee51e7fdfd939c%2F6782cc6994f4276a731a21f7_f2-transcode.mp4"
                title="عرض منيو إلكتروني QR Code للمطاعم"
                className="relative z-10 w-full max-w-md md:max-w-lg lg:max-w-xl drop-shadow-2xl rounded-2xl hover:rotate-x-1 hover:-rotate-y-1 hover:scale-105 transition-transform duration-500"
                muted
                autoPlay
                loop
                playsInline
                preload="metadata"
              />
              <div className="absolute -top-8 -right-8 w-16 h-16 bg-purple-500/20 dark:bg-purple-500/40 rounded-full blur-xl animate-float-delayed" />
              <div
                className="absolute -bottom-4 -left-4 w-12 h-12 bg-purple-500/30 dark:bg-purple-500/50 rounded-full blur-lg animate-float"
                style={{ animationDelay: "0.5s" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
