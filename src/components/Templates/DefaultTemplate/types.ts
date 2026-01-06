// ============================
// Types & Interfaces
// ============================

export type Locale = "ar" | "en";
export type Category = "all" | "appetizers" | "mains" | "drinks" | "desserts";

export interface MenuItem {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  price: number;
  image: string;
  category: string;
  categoryId?: number;
  isPopular?: boolean;
  originalPrice?: number;
  discountPercent?: number;
}

export interface AdItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  image: string;
  badge?: { ar: string; en: string };
  link?: string;
  discount?: string;
}

export interface ENSAdItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
}

