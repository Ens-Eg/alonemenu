"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter, notFound } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useMenu } from "@/hooks/useApi";
import { templates } from "@/components/Templates";

export default function MenuSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("MenuSettings");
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { data: menu, isLoading: menuLoading, error } = useMenu(parseInt(id));

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFoundError, setNotFoundError] = useState(false);
  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    slug: "",
    theme: "default",
    isActive: true,
  });
  const [originalData, setOriginalData] = useState({
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    slug: "",
    theme: "default",
    isActive: true,
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
    fetchMenuSettings();
  }, [id]);

  const fetchMenuSettings = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/menus/${id}`,
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
        const menu = data.data?.menu;
        if (menu) {
          const initialData = {
            nameEn: menu.nameEn || menu.name || "",
            nameAr: menu.nameAr || "",
            descriptionEn: menu.descriptionEn || menu.description || "",
            descriptionAr: menu.descriptionAr || "",
            slug: menu.slug || "",
            theme: menu.theme || "default",
            isActive: menu.isActive || false,
          };
          setFormData(initialData);
          setOriginalData(initialData);
        } else {
          setNotFoundError(true);
        }
      } else {
        setNotFoundError(true);
      }
    } catch (error) {
      console.error("Error fetching menu settings:", error);
      setNotFoundError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Build update object with only changed fields
    const updates: any = {};

    if (formData.nameEn !== originalData.nameEn) {
      updates.nameEn = formData.nameEn;
    }
    if (formData.nameAr !== originalData.nameAr) {
      updates.nameAr = formData.nameAr;
    }
    if (formData.descriptionEn !== originalData.descriptionEn) {
      updates.descriptionEn = formData.descriptionEn;
    }
    if (formData.descriptionAr !== originalData.descriptionAr) {
      updates.descriptionAr = formData.descriptionAr;
    }
    if (formData.theme !== originalData.theme) {
      updates.theme = formData.theme;
    }
    if (formData.isActive !== originalData.isActive) {
      updates.isActive = formData.isActive;
    }

    // Only send request if there are changes
    if (Object.keys(updates).length === 0) {
      toast("لا توجد تغييرات لحفظها", { icon: "ℹ️" });
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/menus/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) throw new Error("Failed to update menu");

      toast.success(t("saveSuccess"));
      // Update original data to reflect saved changes
      setOriginalData({ ...formData });
      router.push(`/${locale}/menus/${id}`);
    } catch (error) {
      console.error("Error saving menu settings:", error);
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("deleteConfirm"))) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/menus/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete menu");

      toast.success(t("deleteSuccess"));
      router.push(`/${locale}/menus`);
    } catch (error) {
      console.error("Error deleting menu:", error);
      toast.error(t("deleteError"));
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
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.push(`/${locale}/menus/${id}`)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <i className="material-symbols-outlined">arrow_back</i>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <i className="material-symbols-outlined text-primary-500">info</i>
            {t("sections.general")}
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("fields.nameEn")}
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) =>
                    setFormData({ ...formData, nameEn: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("fields.nameAr")}
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) =>
                    setFormData({ ...formData, nameAr: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  dir="rtl"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("fields.descriptionEn")}
              </label>
              <textarea
                value={formData.descriptionEn}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionEn: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("fields.descriptionAr")}
              </label>
              <textarea
                value={formData.descriptionAr}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionAr: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white resize-none"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("fields.slug")}
              </label>
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white font-mono"
                disabled
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t("fields.slugHint")}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                (لا يمكن تغيير الرابط بعد الإنشاء)
              </p>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <i className="material-symbols-outlined text-primary-500">
              palette
            </i>
            {t("sections.appearance")}
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("fields.theme")}
            </label>
            <select
              value={formData.theme}
              onChange={(e) =>
                setFormData({ ...formData, theme: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {locale === "ar" ? template.nameAr : template.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <i className="material-symbols-outlined text-primary-500">
              toggle_on
            </i>
            {t("sections.status")}
          </h2>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("fields.isActive")}
            </label>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-8">
            {t("fields.isActiveHint")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t("buttons.saving")}
              </>
            ) : (
              <>
                <i className="material-symbols-outlined !text-[20px]">save</i>
                {t("buttons.save")}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/menus/${id}`)}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {t("buttons.cancel")}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800">
          <h2 className="text-xl font-bold text-red-900 dark:text-red-400 mb-2 flex items-center gap-2">
            <i className="material-symbols-outlined">warning</i>
            {t("dangerZone.title")}
          </h2>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            {t("dangerZone.description")}
          </p>
          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <i className="material-symbols-outlined !text-[20px]">delete</i>
            {t("dangerZone.deleteButton")}
          </button>
        </div>
      </form>
    </div>
  );
}
