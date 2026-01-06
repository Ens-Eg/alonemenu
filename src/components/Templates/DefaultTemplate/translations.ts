// ============================
// Translations
// ============================

export const translations = {
  ar: {
    brand: "منيو الكتروني",
    tagline: "استمتع بأشهى المأكولات",
    hero: {
      title: "اكتشف",
      highlight: "قائمتنا",
      subtitle: "المميزة",
      description: "تجربة طعام فريدة تجمع بين النكهات الأصيلة والإبداع العصري",
      cta: "تصفح القائمة",
    },
    nav: {
      menu: "القائمة",
      about: "عن المطعم",
      contact: "تواصل معنا",
    },
    categories: {
      title: "قائمة الطعام",
      all: "عرض الكل",
      appetizers: "المقبلات",
      mains: "الأطباق الرئيسية",
      drinks: "المشروبات",
      desserts: "الحلويات",
    },
    search: {
      placeholder: "ابحث في القائمة...",
      noResults: "لا توجد نتائج",
      results: "نتيجة",
      tryDifferentKeywords: "جرب البحث بكلمات أخرى",
    },
    footer: {
      address: "القاهرة، مصر",
      phone: "+20 10 123 4567",
      hours: "مفتوح يومياً: 12:00 م - 12:00 ص",
      rights: "جميع الحقوق محفوظة",
      followUs: "تابعنا",
      designedBy: "تصميم وتطوير",
    },
  },
  en: {
    brand: "Online Menu",
    tagline: "Enjoy the finest cuisine",
    hero: {
      title: "Discover",
      highlight: "Our Menu",
      subtitle: "Excellence",
      description:
        "A unique dining experience blending authentic flavors with modern creativity",
      cta: "Browse Menu",
    },
    nav: {
      menu: "Menu",
      about: "About",
      contact: "Contact",
    },
    categories: {
      title: "Our Menu",
      all: "View All",
      appetizers: "Appetizers",
      mains: "Main Courses",
      drinks: "Beverages",
      desserts: "Desserts",
    },
    search: {
      placeholder: "Search menu...",
      noResults: "No results found",
      results: "result",
      tryDifferentKeywords: "Try searching with different keywords",
    },
    footer: {
      address: "Cairo, Egypt",
      phone: "+20 10 123 4567",
      hours: "Open Daily: 12:00 PM - 12:00 AM",
      rights: "All Rights Reserved",
      followUs: "Follow Us",
      designedBy: "Designed & Developed by",
    },
  },
} as const;

export type TranslationType = typeof translations.ar | typeof translations.en;

