"use client";

import React from "react";
import { useLocale } from "next-intl";
import { ArrowRight, Sparkles } from "@/components/icons/Icons";

export const QRCodeSection = () => {
  const locale = useLocale();
  const isRTL = locale === "ar";

  // Generate QR code URL (using a QR code API service)
  const socialMediaUrl = "https://www.facebook.com/ENSEGYPTEG"; // Replace with actual social media URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    socialMediaUrl
  )}`;

  return (
    <section
      id="qr-code"
      className="py-24 md:py-32 bg-gradient-to-br from-teal-50 via-cyan-50/50 to-blue-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div
          className={`flex flex-col ${
            isRTL ? "lg:flex-row-reverse" : "lg:flex-row"
          } items-center gap-12 lg:gap-20`}
        >
          {/* Content */}
          <div
            className={`flex-1 text-center ${
              isRTL ? "lg:text-right" : "lg:text-left"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 border border-teal-200 dark:border-teal-800 mb-6">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">
                {locale === "ar" ? "تابعنا" : "Follow Us"}
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6">
              {locale === "ar"
                ? "امسح رمز QR للوصول إلى صفحاتنا الاجتماعية"
                : "Scan QR Code to Visit Our Social Media"}
            </h2>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {locale === "ar"
                ? "تابعنا على وسائل التواصل الاجتماعي للحصول على آخر الأخبار والعروض الخاصة"
                : "Follow us on social media to get the latest news and special offers"}
            </p>

            <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
              <a
                href={socialMediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
              >
                <span className="text-2xl">📱</span>
                <span>{locale === "ar" ? "زيارة الصفحة" : "Visit Page"}</span>
                <ArrowRight
                  className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`}
                />
              </a>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex-1 flex justify-center">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 rounded-3xl blur-2xl opacity-50 animate-pulse" />

              {/* QR Code Card */}
              <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border-2 border-teal-100 dark:border-teal-900">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                    {locale === "ar" ? "امسح الكود" : "Scan Code"}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {locale === "ar"
                      ? "استخدم كاميرا هاتفك"
                      : "Use your phone camera"}
                  </p>
                </div>

                {/* QR Code Image */}
                <div className="relative bg-white p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700">
                  <img
                    src={qrCodeUrl}
                    alt={locale === "ar" ? "رمز QR" : "QR Code"}
                    className="w-64 h-64 mx-auto"
                  />
                </div>

                {/* Instructions */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="text-teal-600 dark:text-teal-400">1.</span>
                    <span>
                      {locale === "ar"
                        ? "افتح تطبيق الكاميرا على هاتفك"
                        : "Open your phone camera app"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="text-teal-600 dark:text-teal-400">2.</span>
                    <span>
                      {locale === "ar"
                        ? "وجه الكاميرا نحو رمز QR"
                        : "Point camera at QR code"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="text-teal-600 dark:text-teal-400">3.</span>
                    <span>
                      {locale === "ar"
                        ? "اضغط على الرابط الذي يظهر"
                        : "Tap the link that appears"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
