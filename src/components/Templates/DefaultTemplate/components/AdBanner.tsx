"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "../context";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { MenuItem } from "../../types";

// ============================
// Ad Banner Component
// ============================

interface AdBannerProps {
  items: MenuItem[];
  ownerPlanType?: string; // Add owner plan type
  menuId?: number; // Add menu ID to fetch custom ads
}

interface GlobalAd {
  id: number;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  imageUrl?: string;
  linkUrl?: string;
  position: string;
  displayOrder: number;
}

type BannerItem = MenuItem | GlobalAd;

function isGlobalAd(item: BannerItem): item is GlobalAd {
  return "titleAr" in item;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  items,
  ownerPlanType,
  menuId,
}) => {
  const { locale, direction } = useLanguage();
  const [currentAd, setCurrentAd] = useState(0);
  const [ads, setAds] = useState<GlobalAd[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const rtl = direction === "rtl";

  // Check if owner is on free plan (show global ads only for free users)
  const isOwnerFreePlan = ownerPlanType === "free" || !ownerPlanType;

  // Fetch ads based on owner plan type
  useEffect(() => {
    if (isOwnerFreePlan) {
      // Free users: fetch global ads
      fetchGlobalAds();
    } else if (menuId) {
      // Pro users: fetch menu-specific custom ads
      fetchCustomAds();
    } else {
      setLoadingAds(false);
    }
  }, [isOwnerFreePlan, menuId]);

  const fetchGlobalAds = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/public/ads?position=banner&limit=5`
      );
      if (response.ok) {
        const data = await response.json();
        setAds(data.data?.ads || []);
      }
    } catch (error) {
      console.error("Error fetching global ads:", error);
    } finally {
      setLoadingAds(false);
    }
  };

  const fetchCustomAds = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/public/menu/${menuId}/ads?position=banner&limit=5`
      );
      if (response.ok) {
        const data = await response.json();
        setAds(data.data?.ads || []);
      }
    } catch (error) {
      console.error("Error fetching custom ads:", error);
    } finally {
      setLoadingAds(false);
    }
  };

  // Filter items with discounts
  const discountedItems = items.filter(
    (item) => item.discountPercent && item.discountPercent > 0
  );

  // Combine ads and discounted items
  const allBannerItems: BannerItem[] = [...ads, ...discountedItems];

  // Auto-rotate ads
  useEffect(() => {
    if (allBannerItems.length > 0) {
      const timer = setInterval(() => {
        setCurrentAd((prev) => (prev + 1) % allBannerItems.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [allBannerItems.length]);

  // If no items to show, don't render
  if (loadingAds || allBannerItems.length === 0) {
    return null;
  }

  const currentItem = allBannerItems[currentAd];
  const isAd = isGlobalAd(currentItem);

  // Get display values based on item type
  const title = isAd
    ? locale === "ar"
      ? currentItem.titleAr || currentItem.title
      : currentItem.title || currentItem.titleAr
    : currentItem.name;

  const description = isAd
    ? locale === "ar"
      ? currentItem.contentAr || currentItem.content
      : currentItem.content || currentItem.contentAr
    : currentItem.description;

  const imageUrl = isAd ? currentItem.imageUrl : currentItem.image;
  const linkUrl = isAd ? currentItem.linkUrl : null;

  const discount =
    !isAd && currentItem.discountPercent
      ? `${currentItem.discountPercent}%`
      : null;

  const badge = isAd
    ? { ar: "إعلان", en: "Sponsored" }
    : discount
    ? { ar: "عرض محدود", en: "Limited Offer" }
    : null;

  const handleAdClick = async () => {
    if (isAd && linkUrl) {
      // Track click
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/ads/${currentItem.id}/click`,
          {
            method: "POST",
          }
        );
      } catch (error) {
        console.error("Error tracking ad click:", error);
      }
      // Open link
      window.open(linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="py-8 sm:py-12 relative overflow-hidden">
      <div className="container mx-auto px-3 sm:px-4">
        <div
          dir={direction}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-main)] shadow-2xl cursor-pointer"
          onClick={isAd && linkUrl ? handleAdClick : undefined}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-6 sm:p-8 md:p-12 flex flex-col sm:flex-row items-center gap-6 min-h-[200px] sm:min-h-[240px]">
            {/* Text Content */}
            <div
              className={`flex-1 text-center sm:text-start ${
                rtl ? "sm:text-right" : "sm:text-left"
              }`}
            >
              {/* Badge */}
              {badge && (
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-bold mb-4 ${
                    isAd ? "bg-blue-600" : "bg-[var(--accent)] animate-pulse"
                  }`}
                >
                  <Icon
                    name={isAd ? "megaphone-fill" : "fire-fill"}
                    className="text-sm"
                  />
                  <span>{locale === "ar" ? badge.ar : badge.en}</span>
                </div>
              )}

              {/* Title with Discount */}
              <div className="flex items-center gap-3 justify-center sm:justify-start mb-3">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                  {title}
                </h3>
                {discount && (
                  <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white text-lg sm:text-xl font-bold shadow-lg">
                    -{discount}
                  </span>
                )}
              </div>

              {/* Description */}
              {description && (
                <p className="text-sm sm:text-base text-white/80 mb-6 max-w-md leading-relaxed">
                  {description}
                </p>
              )}

              {/* CTA */}
              <Button
                variant="hero"
                size="default"
                className="text-sm sm:text-base"
                onClick={(e?: React.MouseEvent) => {
                  if (isAd && linkUrl && e) {
                    e.stopPropagation();
                    handleAdClick();
                  }
                }}
              >
                <span>
                  {isAd
                    ? locale === "ar"
                      ? "اعرف المزيد"
                      : "Learn More"
                    : locale === "ar"
                    ? "اطلب الآن"
                    : "Order Now"}
                </span>
                <Icon
                  name={rtl ? "arrow-left-line" : "arrow-right-line"}
                  className="text-lg"
                />
              </Button>
            </div>

            {/* Decorative Element */}
            <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 right-12 w-32 h-32 rounded-full bg-[var(--accent)]/20 blur-2xl" />
          </div>

          {/* Ad Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {allBannerItems.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentAd(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentAd === index
                    ? "w-6 bg-[var(--accent)]"
                    : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentAd(
                (prev) =>
                  (prev - 1 + allBannerItems.length) % allBannerItems.length
              );
            }}
            className={`absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[var(--accent)] transition-all duration-300 z-20 ${
              rtl ? "right-3" : "left-3"
            }`}
          >
            <Icon
              name={rtl ? "arrow-right-s-line" : "arrow-left-s-line"}
              className="text-xl"
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentAd((prev) => (prev + 1) % allBannerItems.length);
            }}
            className={`absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[var(--accent)] transition-all duration-300 z-20 ${
              rtl ? "left-3" : "right-3"
            }`}
          >
            <Icon
              name={rtl ? "arrow-left-s-line" : "arrow-right-s-line"}
              className="text-xl"
            />
          </button>
        </div>
      </div>
    </section>
  );
};
