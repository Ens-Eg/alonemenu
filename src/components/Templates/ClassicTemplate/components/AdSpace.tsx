"use client";

import React, { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { X } from "@/components/icons/Icons";
import { AdSpaceProps } from "./types";

// Random ads data
const randomAds = [
  {
    id: 1,
    title: "Special Offer",
    titleAr: "عرض خاص",
    content: "Get 50% off on all premium templates",
    contentAr: "احصل على خصم 50% على جميع القوالب المميزة",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=600&fit=crop",
    link: "#",
    bgColor: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    title: "New Templates",
    titleAr: "قوالب جديدة",
    content: "Check out our latest menu designs",
    contentAr: "اطلع على أحدث تصاميم القوائم",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=600&fit=crop",
    link: "#",
    bgColor: "from-orange-500 to-red-500",
  },
  {
    id: 3,
    title: "Premium Support",
    titleAr: "دعم مميز",
    content: "24/7 customer support available",
    contentAr: "دعم عملاء متاح على مدار الساعة",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=600&fit=crop",
    link: "#",
    bgColor: "from-green-500 to-emerald-500",
  },
  {
    id: 4,
    title: "Free Trial",
    titleAr: "تجربة مجانية",
    content: "Try our service for 14 days free",
    contentAr: "جرب خدمتنا مجاناً لمدة 14 يوماً",
    image:
      "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&h=600&fit=crop",
    link: "#",
    bgColor: "from-purple-500 to-pink-500",
  },
  {
    id: 5,
    title: "Best Deals",
    titleAr: "أفضل العروض",
    content: "Limited time offers - Don't miss out!",
    contentAr: "عروض محدودة - لا تفوت الفرصة!",
    image:
      "https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=400&h=600&fit=crop",
    link: "#",
    bgColor: "from-indigo-500 to-blue-500",
  },
];

export const AdSpace: React.FC<AdSpaceProps> = ({ position }) => {
  const [currentAd, setCurrentAd] = useState(0);
  const [isClosed, setIsClosed] = useState(false);
  const [ads] = useState(() => {
    // Shuffle and pick random ads
    const shuffled = [...randomAds].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });

  useEffect(() => {
    if (ads.length > 1 && !isClosed) {
      const timer = setInterval(() => {
        setCurrentAd((prev) => (prev + 1) % ads.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [ads.length, isClosed]);

  const ad = ads[currentAd];
  const locale = useLocale();
  const title = locale === "ar" ? ad.titleAr : ad.title;
  const content = locale === "ar" ? ad.contentAr : ad.content;

  if (isClosed) return null;

  return (
    <div
      className={`fixed z-20 transition-all duration-500 ${
        // Desktop: side positioning
        position === "left"
          ? "xl:left-6 xl:top-1/2 xl:-translate-y-1/2 xl:w-56"
          : "xl:right-6 xl:top-1/2 xl:-translate-y-1/2 xl:w-56"
      } ${
        // Mobile: bottom positioning
        position === "left"
          ? "bottom-4 left-4 right-4 xl:left-6 xl:right-auto xl:bottom-auto xl:top-1/2 xl:-translate-y-1/2 xl:w-56"
          : "bottom-20 left-4 right-4 xl:right-6 xl:left-auto xl:bottom-auto xl:top-1/2 xl:-translate-y-1/2 xl:w-56"
      }`}
    >
      <div
        className="relative group cursor-pointer"
        onClick={() => {
          if (ad.link) {
            window.open(ad.link, "_blank", "noopener,noreferrer");
          }
        }}
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 rounded-2xl opacity-75 blur-lg group-hover:opacity-100 transition-opacity" />

        <div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-teal-200 dark:border-teal-800 group-hover:scale-105 transition-transform duration-300">
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsClosed(true);
            }}
            className="absolute top-2 right-2 z-30 w-8 h-8 rounded-full  dark:hover:bg-black/90 flex items-center justify-center transition-all"
            aria-label={locale === "ar" ? "إغلاق" : "Close"}
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Image */}
          <div className="relative h-48 xl:h-64 overflow-hidden">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${ad.bgColor} opacity-90`}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="w-12 h-12 xl:w-16 xl:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl xl:text-3xl">🎯</span>
                </div>
                <h3 className="text-white font-bold text-base xl:text-lg mb-2">
                  {title}
                </h3>
                <p className="text-white/90 text-xs xl:text-sm">{content}</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="p-3 xl:p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-slate-800 dark:to-slate-900">
            <button className="w-full py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md text-sm xl:text-base">
              {locale === "ar" ? "اعرف المزيد" : "Learn More"}
            </button>
          </div>

          {/* Indicators */}
          {ads.length > 1 && (
            <div className="absolute bottom-14 xl:bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {ads.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentAd(index);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    currentAd === index
                      ? "w-8 bg-teal-500"
                      : "w-2 bg-white/50 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
