"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { getMenuPublicUrl } from "@/lib/menuUrl";

interface MenuStats {
  totalItems: number;
  activeItems: number;
  categories: number;
}

interface RecentItem {
  id: number;
  nameAr: string;
  nameEn: string;
  type: "product" | "category";
  createdAt: string;
  imageUrl?: string;
}

export default function MenuDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("MenuDashboard");
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [menuName, setMenuName] = useState("");
  const [menuSlug, setMenuSlug] = useState<string | null>(null);
  const [notFoundError, setNotFoundError] = useState(false);
  const [stats, setStats] = useState<MenuStats>({
    totalItems: 0,
    activeItems: 0,
    categories: 0,
  });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    fetchMenuData();
    fetchRecentActivity();
  }, [id]);

  const fetchMenuData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/menus/${id}?locale=${locale}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 404) {
        setNotFoundError(true);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const menu = data.menu;
        // استخدام الترجمة المناسبة حسب اللغة
        const displayName =
          locale === "ar"
            ? menu?.nameAr || menu?.name || ""
            : menu?.nameEn || menu?.name || "";
        setMenuName(displayName);
        setMenuSlug(menu?.slug || null);
        // TODO: Fetch real stats from backend
        setStats({
          totalItems: data.itemsCount || 0,
          activeItems: data.activeItemsCount || 0,
          categories: data.categoriesCount || 0,
        });
      } else {
        setNotFoundError(true);
      }
    } catch (error) {
      console.error("Error fetching menu data:", error);
      setNotFoundError(true);
    } finally {
      setLoading(false);
    }
  };

  // Trigger notFound() when error is detected
  if (notFoundError) {
    notFound();
  }

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      // Fetch recent products
      const productsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/menus/${id}/items`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (productsResponse.status === 404) {
        setNotFoundError(true);
        return;
      }

      // Fetch recent categories
      const categoriesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/menus/${id}/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (categoriesResponse.status === 404) {
        setNotFoundError(true);
        return;
      }

      const activities: RecentItem[] = [];

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        const recentProducts = (productsData.items || [])
          .slice(0, 3)
          .map((item: any) => ({
            id: item.id,
            nameAr: item.nameAr,
            nameEn: item.nameEn,
            type: "product" as const,
            createdAt: item.createdAt || new Date().toISOString(),
            imageUrl: item.imageUrl,
          }));
        activities.push(...recentProducts);
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        const recentCategories = (categoriesData.categories || [])
          .slice(0, 3)
          .map((cat: any) => ({
            id: cat.id,
            nameAr: cat.nameAr,
            nameEn: cat.nameEn,
            type: "category" as const,
            createdAt: cat.createdAt || new Date().toISOString(),
            imageUrl: cat.imageUrl,
          }));
        activities.push(...recentCategories);
      }

      // Sort by date and take the 5 most recent
      activities.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentItems(activities.slice(0, 5));
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.push(`/${locale}/dashboard/menus`)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <i className="material-symbols-outlined">arrow_back</i>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {menuName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/${locale}/dashboard/menus/${id}`}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
            >
              <i className="material-symbols-outlined !text-[18px]">
                dashboard
              </i>
              {t("navigation.overview")}
            </Link>
            <Link
              href={`/${locale}/dashboard/menus/${id}/categories`}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <i className="material-symbols-outlined !text-[18px]">category</i>
              {t("navigation.categories")}
            </Link>
            <Link
              href={`/${locale}/dashboard/menus/${id}/products`}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <i className="material-symbols-outlined !text-[18px]">
                restaurant_menu
              </i>
              {t("navigation.products")}
            </Link>
            <Link
              href={`/${locale}/dashboard/menus/${id}/settings`}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <i className="material-symbols-outlined !text-[18px]">settings</i>
              {t("settings")}
            </Link>
            {menuSlug && (
              <a
                href={getMenuPublicUrl(menuSlug)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center gap-2"
              >
                <i className="material-symbols-outlined !text-[18px]">
                  open_in_new
                </i>
                {t("viewPublic")}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t("stats.totalItems")}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalItems}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <i className="material-symbols-outlined text-blue-600 dark:text-blue-400 !text-[28px]">
                restaurant_menu
              </i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t("stats.activeItems")}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.activeItems}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <i className="material-symbols-outlined text-green-600 dark:text-green-400 !text-[28px]">
                check_circle
              </i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t("stats.categories")}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.categories}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <i className="material-symbols-outlined text-purple-600 dark:text-purple-400 !text-[28px]">
                category
              </i>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href={`/${locale}/dashboard/menus/${id}/items`}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <i className="material-symbols-outlined text-white !text-[32px]">
                restaurant_menu
              </i>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {t("quickLinks.items")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("quickLinks.itemsDesc")}
              </p>
            </div>
            <i className="material-symbols-outlined text-gray-400 group-hover:text-primary-500 transition-colors">
              arrow_forward
            </i>
          </div>
        </Link>

        <Link
          href={`/${locale}/dashboard/menus/${id}/settings`}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <i className="material-symbols-outlined text-white !text-[32px]">
                settings
              </i>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {t("quickLinks.settings")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("quickLinks.settingsDesc")}
              </p>
            </div>
            <i className="material-symbols-outlined text-gray-400 group-hover:text-primary-500 transition-colors">
              arrow_forward
            </i>
          </div>
        </Link>

        {menuSlug && (
          <a
            href={getMenuPublicUrl(menuSlug)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <i className="material-symbols-outlined text-white !text-[32px]">
                  public
                </i>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {t("quickLinks.preview")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("quickLinks.previewDesc")}
                </p>
              </div>
              <i className="material-symbols-outlined text-gray-400 group-hover:text-primary-500 transition-colors">
                open_in_new
              </i>
            </div>
          </a>
        )}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t("recentActivity.title")}
        </h2>
        {recentItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700 text-center">
            <i className="material-symbols-outlined text-gray-400 !text-[48px] mb-3">
              history
            </i>
            <p className="text-gray-600 dark:text-gray-400">
              {t("recentActivity.noActivity")}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
            {recentItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={locale === "ar" ? item.nameAr : item.nameEn}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          item.type === "product"
                            ? "bg-blue-100 dark:bg-blue-900/30"
                            : "bg-purple-100 dark:bg-purple-900/30"
                        }`}
                      >
                        <i
                          className={`material-symbols-outlined ${
                            item.type === "product"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-purple-600 dark:text-purple-400"
                          } !text-[24px]`}
                        >
                          {item.type === "product"
                            ? "restaurant_menu"
                            : "category"}
                        </i>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {locale === "ar" ? item.nameAr : item.nameEn}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          item.type === "product"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                        }`}
                      >
                        {item.type === "product"
                          ? t("recentActivity.product")
                          : t("recentActivity.category")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("recentActivity.added")}{" "}
                      {new Date(item.createdAt).toLocaleDateString(
                        locale === "ar" ? "ar-SA" : "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <Link
                    href={`/${locale}/dashboard/menus/${id}/${
                      item.type === "product" ? "products" : "categories"
                    }`}
                    className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                  >
                    {t("recentActivity.view")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
