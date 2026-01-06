"use client";

import { useTranslations } from "next-intl";

const TrustedBy = () => {
  const t = useTranslations("trustedBy");
  const partners = [
    t("partners.0"),
    t("partners.1"),
    t("partners.2"),
    t("partners.3"),
    t("partners.4"),
    t("partners.5"),
    t("partners.6"),
    t("partners.7"),
  ];

  return (
    <section className="py-12 text-white dark:text-gray-100 overflow-hidden relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 dark:opacity-25"
        style={{ backgroundImage: 'url(/images/landing-pages/bg-pattern.jpg)' }}
      />
      {/* Purple Gradient Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-95 dark:opacity-90" 
        style={{ background: 'linear-gradient(135deg, rgb(61, 31, 110), rgb(44, 13, 96))' }}
      />
      
      <div className="container mx-auto px-4 mb-8 relative z-10">
        <p className="text-center text-lg md:text-xl lg:text-2xl font-semibold text-gray-50 animate-fade-in" suppressHydrationWarning>
          {t("title")}
        </p>
      </div>
      
      {/* Marquee Animation */}
      <div className="relative z-10">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...partners, ...partners].map((partner, index) => (
            <div
              key={index}
              className="mx-8 md:mx-12 flex items-center"
            >
              <div className="bg-white/5 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/10 hover:bg-white/15 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 shadow-lg">
                <span className="text-lg font-bold text-gray-50 opacity-90 hover:opacity-100 transition-opacity" suppressHydrationWarning>{partner}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;

