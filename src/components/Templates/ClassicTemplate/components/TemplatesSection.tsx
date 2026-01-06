"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { Star } from "@/components/icons/Icons";
import { MenuItem } from "./types";
import { getMenuItems } from "./data";
import { FoodItemModal } from "./FoodItemModal";

export const TemplatesSection = () => {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFoodItem, setSelectedFoodItem] = useState<MenuItem | null>(
    null
  );

  const menuItems = getMenuItems();

  const categories = [
    {
      id: "all",
      name: locale === "ar" ? "الكل" : "All",
      icon: "🍽️",
    },
    {
      id: "main",
      name: locale === "ar" ? "الأطباق الرئيسية" : "Main Dishes",
      icon: "🍽️",
    },
    {
      id: "salad",
      name: locale === "ar" ? "السلطات" : "Salads",
      icon: "🥗",
    },
    {
      id: "dessert",
      name: locale === "ar" ? "الحلويات" : "Desserts",
      icon: "🍰",
    },
    {
      id: "drinks",
      name: locale === "ar" ? "المشروبات" : "Drinks",
      icon: "🥤",
    },
  ];

  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  return (
    <section
      id="templates"
      className="py-24 md:py-32 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 mb-6">
            <Star className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">
              {locale === "ar" ? "قائمة الطعام" : "Menu Items"}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6">
            {locale === "ar" ? "استكشف قائمتنا" : "Explore Our Menu"}
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12">
            {locale === "ar"
              ? "اختر من مجموعة متنوعة من الأطباق اللذيذة"
              : "Choose from a variety of delicious dishes"}
          </p>
        </div>

        {/* Categories Filter */}
        <div className="mb-16">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`group flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold text-base transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/50 scale-105"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 hover:scale-105"
                }`}
              >
                <span className="text-2xl">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedFoodItem(item)}
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition-all cursor-pointer group hover:shadow-xl hover:-translate-y-2"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={locale === "ar" ? item.nameAr : item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">
                  {locale === "ar" ? item.nameAr : item.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {locale === "ar" ? item.descriptionAr : item.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-semibold">
                    {categories.find((cat) => cat.id === item.category)?.name}
                  </span>
                  <span className="text-teal-600 dark:text-teal-400 font-bold text-lg">
                    ${item.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Food Item Modal */}
      <FoodItemModal
        isOpen={selectedFoodItem !== null}
        onClose={() => setSelectedFoodItem(null)}
        item={selectedFoodItem}
      />
    </section>
  );
};
