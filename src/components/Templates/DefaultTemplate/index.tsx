"use client";

import React from "react";
import { LanguageProvider } from "./context";
import {
  Navbar,
  HeroSection,
  AdBanner,
  MenuSection,
  OffersSection,
  ENSServicesSection,
  Footer,
  ENSFixedBanner,
} from "./components";
import { globalStyles } from "./styles";
import { TemplateProps } from "../types";

// ============================
// Main App Component
// ============================

export default function DefaultTemplate({
  menuData,
  slug,
  selectedCategory,
  onCategoryChange,
  onShowRatingModal,
}: TemplateProps) {
  // Get discounted items for ads
  const discountedItems = menuData.items.filter(
    (item) => item.discountPercent && item.discountPercent > 0
  );

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
        <style jsx global>
          {globalStyles}
        </style>

        {/* Layout */}
        <Navbar menuName={menuData.menu.name} logo={menuData.menu.logo} />
        <HeroSection
          menuName={menuData.menu.name}
          description={menuData.menu.description}
          logo={menuData.menu.logo}
          rating={menuData.rating}
        />
        <AdBanner
          items={discountedItems}
          ownerPlanType={menuData.menu.ownerPlanType}
          menuId={menuData.menu.id}
        />
        <MenuSection
          categories={menuData.categories || []}
          items={menuData.items}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          currency={menuData.menu.currency || "SAR"}
        />
        <OffersSection items={discountedItems} />
        {/* <ENSServicesSection /> */}
        <Footer menuName={menuData.menu.name} branches={menuData.branches} />
        {/* Show ENS Banner only for free users */}
        {menuData.menu.ownerPlanType === "free" && <ENSFixedBanner />}
      </div>
    </LanguageProvider>
  );
}
