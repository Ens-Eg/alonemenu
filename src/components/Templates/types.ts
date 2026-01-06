import { ComponentType } from "react";

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  categoryId?: number;
  categoryName?: string;
  originalPrice?: number;
  discountPercent?: number;
}

export interface Category {
  id: number;
  name: string;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  latitude: string;
  longitude: string;
}

export interface MenuData {
  menu: {
    id: number;
    name: string;
    description: string;
    logo: string;
    theme: string;
    slug: string;
    currency: string;
    isActive: boolean;
    ownerPlanType?: string;
  };
  categories?: Category[];
  items: MenuItem[];
  itemsByCategory: Record<string, MenuItem[]>;
  branches: Branch[];
  rating: {
    average: number;
    total: number;
  };
}

export interface TemplateProps {
  menuData: MenuData;
  slug: string;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onShowRatingModal: () => void;
}

export interface TemplateInfo {
  id: string;
  name: string;
  nameAr: string;
  component: ComponentType<TemplateProps>;
  description?: string;
  descriptionAr?: string;
}
