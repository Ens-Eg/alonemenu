"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send } from "@/components/icons/Icons";
import { useLanguage } from "@/hooks/useLanguage";

const ContactSection = () => {
  const t = useTranslations("Landing.contact");
  const { isRTL } = useLanguage();

  const [formData, setFormData] = useState({
    restaurantName: "",
    phone: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setFormData({ restaurantName: "", phone: "" });
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <section
      id="contact"
      className="relative py-20 md:py-32 overflow-hidden
      bg-[#0d1117]"
    >
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/4 w-[480px] h-[480px]
          bg-purple-500/20 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[480px] h-[480px]
          bg-purple-500/20 rounded-full blur-[160px]" />
        <div className="absolute inset-x-0 top-1/2 h-px
          bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Text */}
            <div className={`${isRTL ? "lg:text-right" : "lg:text-left"} text-center`}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-50 mb-6">
                {t("title1")}
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  {t("title2")}
                </span>
              </h2>

              <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed">
                {t("description")}
              </p>

              {/* WhatsApp */}
              <a
                href="https://wa.me/01000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-7 py-3 rounded-xl
                bg-green-500 hover:bg-green-600
                text-white font-bold
                transition-all duration-300
                hover:scale-105 shadow-lg hover:shadow-green-500/30"
              >
                <MessageCircle className="w-5 h-5" />
                {t("whatsapp")}
              </a>
            </div>

            {/* Form */}
            <div
              className="relative rounded-3xl p-8
              bg-white/80 dark:bg-[#0d1117]/80
              backdrop-blur-xl
              border border-purple-200/40 dark:border-purple-500/20
              shadow-2xl shadow-purple-500/20"
            >
              {isSubmitted ? (
                <div className="text-center py-10">
                  <div className="mx-auto mb-6 w-16 h-16 rounded-full
                    bg-green-100 dark:bg-green-500/20
                    flex items-center justify-center"
                  >
                    <svg
                      className="w-8 h-8 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>

                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-50">
                    {t("successTitle")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("successDescription")}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Restaurant */}
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t("restaurantName")} *
                    </label>
                    <input
                      type="text"
                      value={formData.restaurantName}
                      onChange={(e) =>
                        setFormData({ ...formData, restaurantName: e.target.value })
                      }
                      placeholder={t("restaurantPlaceholder")}
                      required
                      className="w-full h-12 px-4 rounded-lg
                      bg-white dark:bg-[#161b22]
                      border border-gray-300 dark:border-gray-600
                      text-gray-900 dark:text-gray-50
                      focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                      outline-none transition"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t("phone")} *
                    </label>
                    <input
                      type="tel"
                      dir="ltr"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder={t("phonePlaceholder")}
                      required
                      className="w-full h-12 px-4 rounded-lg
                      bg-white dark:bg-[#161b22]
                      border border-gray-300 dark:border-gray-600
                      text-gray-900 dark:text-gray-50
                      focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                      outline-none transition"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    variant="hero"
                    size="lg"
                    type="submit"
                    className="w-full group
                    bg-gradient-to-r from-purple-600 to-purple-700
                    text-white font-semibold
                    hover:scale-105 transition-all duration-300
                    shadow-lg shadow-purple-500/40"
                  >
                    {t("submit")}
                    <Send
                      className={`w-5 h-5 transition-transform duration-300
                      ${
                        isRTL
                          ? "group-hover:-translate-x-1 rotate-180"
                          : "group-hover:translate-x-1"
                      }`}
                    />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
