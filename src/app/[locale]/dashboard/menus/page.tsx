"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  useMenus,
  useCreateMenu,
  useDeleteMenu,
  useToggleMenuStatus,
} from "@/hooks/useApi";
import api from "@/lib/api";
import { getMenuPublicUrl } from "@/lib/menuUrl";
import toast from "react-hot-toast";

interface Menu {
  id: number;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  logoUrl: string | null;
  createdAt: string;
}

export default function MenusPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Menus");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // React Query hooks
  const { data: menus = [], isLoading: loadingMenus } = useMenus();
  const deleteMenu = useDeleteMenu();
  const toggleStatus = useToggleMenuStatus(0); // Will be updated per menu

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/authentication/sign-in`);
    }
    // Redirect admin users to admin panel
    if (!loading && user?.role === "admin") {
      router.push(`/${locale}/admin`);
    }
  }, [user, loading, router, locale]);

  const handleToggleStatus = async (menuId: number, currentStatus: boolean) => {
    const toggle = useToggleMenuStatus(menuId);
    await toggle.mutateAsync(!currentStatus);
  };

  const handleDelete = async (menuId: number) => {
    if (!confirm(t("deleteConfirm"))) return;
    await deleteMenu.mutateAsync(menuId);
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white ">
                {t("title")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t("subtitle")}
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 shadow-lg"
            >
              <i className="material-symbols-outlined !text-[20px]">add</i>
              {t("createMenu")}
            </button>
          </div>
        </div>
        {loadingMenus ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        ) : menus.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("noMenus")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t("getStarted")}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              {t("createFirst")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.map((menu: Menu) => (
              <div
                key={menu.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {menu.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      menu.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {menu.isActive ? t("active") : t("inactive")}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {menu.description || t("noDescription")}
                </p>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("slug")}: <span className="font-mono">{menu.slug}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("created")}:{" "}
                    {new Date(menu.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      router.push(`/${locale}/dashboard/menus/${menu.id}`)
                    }
                    className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    📊 {t("openDashboard")}
                  </button>
                  <button
                    onClick={() => handleToggleStatus(menu.id, menu.isActive)}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    {menu.isActive ? "⏸️" : "▶️"}
                  </button>
                  <button
                    onClick={() => handleDelete(menu.id)}
                    className="px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-sm"
                  >
                    🗑️
                  </button>
                </div>

                <a
                  href={getMenuPublicUrl(menu.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-center px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm"
                >
                  {t("viewPublic")} →
                </a>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Menu Modal */}
      {showCreateModal && (
        <CreateMenuModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

interface CreateMenuModalProps {
  onClose: () => void;
}

function CreateMenuModal({ onClose }: CreateMenuModalProps) {
  const t = useTranslations("Menus.createModal");
  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    slug: "",
  });
  const [slugStatus, setSlugStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    suggestions: string[];
  }>({
    checking: false,
    available: null,
    suggestions: [],
  });

  const createMenu = useCreateMenu();

  // Debounced slug check
  useEffect(() => {
    if (!formData.slug || formData.slug.length < 3) {
      setSlugStatus({ checking: false, available: null, suggestions: [] });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSlugStatus({ checking: true, available: null, suggestions: [] });
      try {
        const result = await api.checkSlugAvailability(formData.slug);
        if (result.error) {
          setSlugStatus({ checking: false, available: false, suggestions: [] });
        } else if (result.data) {
          const data = result.data as any;
          setSlugStatus({
            checking: false,
            available: data.available ?? false,
            suggestions: data.suggestions ?? [],
          });
        } else {
          setSlugStatus({ checking: false, available: null, suggestions: [] });
        }
      } catch (error) {
        console.error("Error checking slug:", error);
        setSlugStatus({ checking: false, available: null, suggestions: [] });
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [formData.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check slug availability before submitting
    if (formData.slug && slugStatus.available === false) {
      toast.error("هذا الرابط مستخدم بالفعل. يرجى اختيار رابط آخر.");
      return;
    }

    try {
      // Transform data to match backend expectations
      const menuData = {
        nameEn: formData.name,
        nameAr: formData.nameAr,
        descriptionEn: formData.description,
        descriptionAr: formData.descriptionAr,
        slug: formData.slug,
      };

      await createMenu.mutateAsync(menuData);
      onClose();
    } catch (error) {
      // Error handled by React Query hook
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData({ ...formData, slug: suggestion });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 ">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="material-symbols-outlined text-white !text-[28px]">
                restaurant_menu
              </i>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white ">
              {t("title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <i className="material-symbols-outlined text-gray-500 dark:text-gray-400">
              close
            </i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Names Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <i className="material-symbols-outlined text-primary-500 !text-[20px]">
                label
              </i>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white !mb-0">
                {t("menuNames")}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("nameEn")} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    placeholder="e.g., My Restaurant Menu"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("nameAr")} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) =>
                      setFormData({ ...formData, nameAr: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    placeholder="مثال: قائمة مطعمي"
                    dir="rtl"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Descriptions Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <i className="material-symbols-outlined text-primary-500 !text-[20px]">
                description
              </i>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("descriptions")}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("descriptionEn")}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all resize-none"
                  placeholder="Describe your menu in English..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("descriptionAr")}
                </label>
                <textarea
                  value={formData.descriptionAr}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionAr: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all resize-none"
                  placeholder="اكتب وصف القائمة بالعربية..."
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          {/* Slug Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <i className="material-symbols-outlined text-primary-500 !text-[20px]">
                link
              </i>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("urlSettings")}
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("slug")} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-"),
                    })
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all font-mono ${
                    slugStatus.available === false
                      ? "border-red-300 dark:border-red-600 focus:ring-red-500"
                      : slugStatus.available === true
                      ? "border-green-300 dark:border-green-600 focus:ring-green-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-primary-500"
                  }`}
                  placeholder="my-restaurant-menu"
                  required
                />
                {slugStatus.checking && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                  </div>
                )}
                {!slugStatus.checking && slugStatus.available === true && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <i className="material-symbols-outlined text-green-500 !text-[20px]">
                      check_circle
                    </i>
                  </div>
                )}
                {!slugStatus.checking && slugStatus.available === false && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <i className="material-symbols-outlined text-red-500 !text-[20px]">
                      cancel
                    </i>
                  </div>
                )}
              </div>

              {/* Status Message */}
              {slugStatus.checking && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  جاري التحقق من الرابط...
                </p>
              )}
              {!slugStatus.checking && slugStatus.available === true && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                  <i className="material-symbols-outlined !text-[16px]">
                    check_circle
                  </i>
                  هذا الرابط متاح
                </p>
              )}
              {!slugStatus.checking && slugStatus.available === false && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <i className="material-symbols-outlined !text-[16px]">
                    cancel
                  </i>
                  هذا الرابط مستخدم بالفعل
                </p>
              )}

              {/* Suggestions */}
              {!slugStatus.checking &&
                slugStatus.available === false &&
                slugStatus.suggestions.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      اقتراحات مشابهة:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {slugStatus.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1.5 text-xs font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-300 dark:hover:border-primary-600 text-gray-700 dark:text-gray-300 transition-all"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <i className="material-symbols-outlined text-blue-500 !text-[18px] mt-0.5">
                    info
                  </i>
                  <div className="flex-1">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                      {t("slugHint")}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                      {formData.slug
                        ? `${formData.slug}.yoursite.com`
                        : "your-slug.yoursite.com"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={createMenu.isPending}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={createMenu.isPending}
            >
              {createMenu.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t("creating")}
                </>
              ) : (
                <>
                  <i className="material-symbols-outlined !text-[20px]">
                    add_circle
                  </i>
                  {t("create")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
