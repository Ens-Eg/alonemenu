"use client";

import React, { useState, useEffect, use } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { getTemplateById, getDefaultTemplate } from "@/components/Templates";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

interface MenuItem {
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

interface Category {
  id: number;
  name: string;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  latitude: string;
  longitude: string;
}

interface MenuData {
  menu: {
    id: number;
    name: string;
    description: string;
    logo: string;
    theme: string;
    slug: string;
    currency: string;
    isActive: boolean;
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

export default function PublicMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Unwrap params Promise using React.use()
  const { slug } = use(params);

  const locale = useLocale();
  const t = useTranslations("PublicMenu");
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    fetchMenuData();
  }, [slug, locale]);

  const fetchMenuData = async () => {
    try {
      setLoading(true);

      // Try using api client first
      let result = await api.getPublicMenu(slug, locale);

      // If api client fails, try direct fetch as fallback
      if (result.error) {
        console.warn("API client failed:", result.error);
        console.warn("Trying direct fetch as fallback...");

        try {
          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
          const fetchUrl = `${apiUrl}/public/menu/${slug}?locale=${locale}`;

          console.log("Fetching from:", fetchUrl);

          const response = await fetch(fetchUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            // Add mode to handle CORS
            mode: "cors",
            credentials: "omit",
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Response error:", response.status, errorText);
            throw new Error(`Menu not found (${response.status})`);
          }

          const data = await response.json();
          result = {
            data: data,
            error: undefined,
          };
        } catch (fetchError: any) {
          console.error("Direct fetch also failed:", fetchError);

          // Provide more helpful error message
          if (
            fetchError.message?.includes("Failed to fetch") ||
            fetchError.name === "TypeError"
          ) {
            throw new Error(
              "Cannot connect to server. Please check: 1) Backend is running on port 5000, 2) CORS is configured, 3) No ad blocker is blocking the request."
            );
          }

          throw new Error(
            result.error || fetchError.message || "Failed to fetch menu data"
          );
        }
      }

      if (result.error) {
        throw new Error(result.error);
      }

      // API returns { success: true, data: {...} }
      const apiResponse = result.data as any;
      const menuData = apiResponse?.data || apiResponse;

      if (!menuData) {
        throw new Error("Menu not found");
      }

      setMenuData(menuData);

      // Update page metadata dynamically
      if (menuData?.menu) {
        const menu = menuData.menu;

        // Update page title
        document.title = menu.name || "Menu";

        // Update meta description
        let metaDescription = document.querySelector(
          'meta[name="description"]'
        );
        if (!metaDescription) {
          metaDescription = document.createElement("meta");
          metaDescription.setAttribute("name", "description");
          document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute("content", menu.description || "");

        // Update favicon
        if (menu.logo) {
          let favicon = document.querySelector(
            'link[rel="icon"]'
          ) as HTMLLinkElement;
          if (!favicon) {
            favicon = document.createElement("link");
            favicon.setAttribute("rel", "icon");
            document.head.appendChild(favicon);
          }
          favicon.setAttribute("href", menu.logo);

          // Also update apple-touch-icon
          let appleIcon = document.querySelector(
            'link[rel="apple-touch-icon"]'
          ) as HTMLLinkElement;
          if (!appleIcon) {
            appleIcon = document.createElement("link");
            appleIcon.setAttribute("rel", "apple-touch-icon");
            document.head.appendChild(appleIcon);
          }
          appleIcon.setAttribute("href", menu.logo);
        }
      }

      // Keep "all" as default - don't change it
      // This ensures all items are shown when the page loads
    } catch (error: any) {
      console.error("Error fetching menu:", error);
      toast.error(error.message || t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <i className="material-symbols-outlined text-gray-400 !text-[64px] mb-4">
          restaurant_menu
        </i>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t("notFound")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("notFoundDescription")}
        </p>
      </div>
    );
  }

  // صفحة الصيانة - إذا كانت القائمة متوقفة (isActive = false)
  if (!menuData.menu.isActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 !text-[48px]">
              construction
            </i>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {locale === "ar" ? "تحت الصيانة" : "Under Maintenance"}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {locale === "ar"
              ? "نعتذر، القائمة غير متاحة حالياً. نحن نعمل على تحسينها وسنعود قريباً!"
              : "Sorry, this menu is currently unavailable. We are working on improvements and will be back soon!"}
          </p>

          {menuData.menu.logo && (
            <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700">
              <Image
                src={menuData.menu.logo}
                alt={menuData.menu.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {menuData.menu.name}
          </p>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {locale === "ar"
                ? "شكراً لتفهمكم"
                : "Thank you for your understanding"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Determine which template to use based on theme
  const theme = menuData.menu.theme || "default";
  const templateInfo = getTemplateById(theme) || getDefaultTemplate();
  const TemplateComponent = templateInfo.component;

  return (
    <>
      <TemplateComponent
        menuData={menuData}
        slug={slug}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onShowRatingModal={() => setShowRatingModal(true)}
      />
    </>
  );
}
