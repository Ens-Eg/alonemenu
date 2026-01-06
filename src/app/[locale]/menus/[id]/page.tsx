"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useMenu } from "@/hooks/useApi";
import { getMenuPublicUrl } from "@/lib/menuUrl";
import toast from "react-hot-toast";

interface MenuStats {
  totalItems: number;
  activeItems: number;
  categories: number;
  views: number;
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
  const { user, loading: authLoading } = useAuth();
  const { data: menu, isLoading: menuLoading, error } = useMenu(parseInt(id));
  
  const [loading, setLoading] = useState(true);
  const [menuName, setMenuName] = useState("");
  const [notFoundError, setNotFoundError] = useState(false);
  const [stats, setStats] = useState<MenuStats>({
    totalItems: 0,
    activeItems: 0,
    categories: 0,
    views: 0,
  });

  // التحقق من ملكية القائمة
  useEffect(() => {
    if (!authLoading && !menuLoading) {
      if (!user) {
        toast.error("يجب تسجيل الدخول أولاً");
        router.push(`/${locale}/authentication/sign-in`);
        return;
      }

      if (error || (menu && menu.userId !== user.id)) {
        // إذا كان هناك خطأ أو المستخدم لا يملك القائمة، اعرض 404
        setNotFoundError(true);
        return;
      }
    }
  }, [user, menu, authLoading, menuLoading, router, locale, error]);

  // Trigger notFound() when error is detected
  if (notFoundError) {
    notFound();
  }

  useEffect(() => {
    fetchMenuData();
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

      if (response.ok) {
        const data = await response.json();
        setMenuName(data.data?.menu?.name || "");
        // TODO: Fetch real stats from backend
        setStats({
          totalItems: data.data?.itemsCount || 0,
          activeItems: data.data?.activeItemsCount || 0,
          categories: data.data?.categoriesCount || 0,
          views: data.data?.views || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching menu data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading || menuLoading) {
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
            onClick={() => router.push(`/${locale}/menus`)}
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

        {/* Quick Actions */}
        <div className="flex gap-3 mt-4">
          <Link
            href={`/${locale}/menus/${id}/items`}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <i className="material-symbols-outlined !text-[20px]">
              restaurant_menu
            </i>
            {t("manageItems")}
          </Link>
          <Link
            href={`/${locale}/menus/${id}/settings`}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <i className="material-symbols-outlined !text-[20px]">settings</i>
            {t("settings")}
          </Link>
          {menu?.slug && (
            <a
              href={getMenuPublicUrl(menu.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center gap-2"
            >
              <i className="material-symbols-outlined !text-[20px]">
                open_in_new
              </i>
              {t("viewPublic")}
            </a>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t("stats.views")}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.views}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <i className="material-symbols-outlined text-orange-600 dark:text-orange-400 !text-[28px]">
                visibility
              </i>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href={`/${locale}/menus/${id}/items`}
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
          href={`/${locale}/menus/${id}/settings`}
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

        {menu?.slug && (
          <a
            href={getMenuPublicUrl(menu.slug)}
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

      {/* Recent Activity (Placeholder) */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t("recentActivity.title")}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700 text-center">
          <i className="material-symbols-outlined text-gray-400 !text-[48px] mb-3">
            history
          </i>
          <p className="text-gray-600 dark:text-gray-400">
            {t("recentActivity.noActivity")}
          </p>
        </div>
      </div>
    </div>
  );
}
