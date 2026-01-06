"use client";

import React, { use, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, notFound } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "react-hot-toast";
import { templates } from "@/components/Templates";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import CurrencySelector from "@/components/CurrencySelector";

export default function MenuSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("MenuSettings");
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuName, setMenuName] = useState("");
  const [menuSlug, setMenuSlug] = useState<string | null>(null);
  const [notFoundError, setNotFoundError] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "appearance">(
    "general"
  );
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // دمج حالات الـ modals في object واحد لتحسين الأداء
  const [modalState, setModalState] = useState({
    deleteModal: { show: false, confirmText: "", isProcessing: false },
    deactivateModal: { show: false, confirmText: "", isProcessing: false },
  });
  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    slug: "",
    logo: "",
    theme: "default",
    currency: "SAR",
    isActive: true,
  });
  const [originalData, setOriginalData] = useState({
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    slug: "",
    logo: "",
    theme: "default",
    currency: "SAR",
    isActive: true,
  });

  const fetchMenuSettings = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/menus/${id}?locale=${locale}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal,
          }
        );

        if (response.status === 404) {
          setNotFoundError(true);
          return;
        }

        if (response.ok) {
          const data = await response.json();
          const menu = data.menu;

          if (menu && menu.id) {
            const displayName =
              locale === "ar"
                ? menu.nameAr || menu.name || ""
                : menu.nameEn || menu.name || "";
            setMenuName(displayName);
            setMenuSlug(menu.slug || null);

            const initialData = {
              nameEn: menu.nameEn || "",
              nameAr: menu.nameAr || "",
              descriptionEn: menu.descriptionEn || "",
              descriptionAr: menu.descriptionAr || "",
              slug: menu.slug || "",
              logo: menu.logo || "",
              theme: menu.theme || "default",
              currency: menu.currency || "SAR",
              isActive: menu.isActive !== undefined ? menu.isActive : true,
            };
            setFormData(initialData);
            setOriginalData(initialData);
            setLogoPreview(menu.logo || null);
          } else {
            setNotFoundError(true);
          }
        } else {
          setNotFoundError(true);
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          setNotFoundError(true);
        }
      } finally {
        setLoading(false);
      }
    },
    [id, locale, t]
  );

  // Trigger notFound() when error is detected
  if (notFoundError) {
    notFound();
  }

  useEffect(() => {
    const abortController = new AbortController();
    fetchMenuSettings(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [fetchMenuSettings]);

  // استخدام useMemo لحساب القيم المشتقة
  const isPremiumUser = useMemo(() => {
    return user?.planType === "monthly" || user?.planType === "yearly";
  }, [user?.planType]);

  const hasChanges = useMemo(() => {
    return Object.keys(formData).some(
      (key) =>
        formData[key as keyof typeof formData] !==
        originalData[key as keyof typeof originalData]
    );
  }, [formData, originalData]);

  const handleLogoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!isPremiumUser) {
        toast.error(
          locale === "ar"
            ? "هذه الميزة متاحة للمستخدمين المدفوعين فقط"
            : "This feature is only available for premium users"
        );
        return;
      }

      // Validate file type
      const validTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/x-icon",
        "image/vnd.microsoft.icon",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error(
          locale === "ar"
            ? "يرجى رفع صورة بصيغة PNG, JPG أو ICO"
            : "Please upload an image in PNG, JPG or ICO format"
        );
        return;
      }

      // Validate file size (1MB max)
      const maxSize = 1 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(
          locale === "ar"
            ? "حجم الصورة يجب أن لا يتجاوز 1 ميجابايت"
            : "Image size must not exceed 1MB"
        );
        return;
      }

      setUploadingLogo(true);

      try {
        const uploadResponse = await api.uploadImage(file, "logos");
        if (uploadResponse.error) {
          toast.error(uploadResponse.error);
          return;
        }

        const logoUrl = uploadResponse.data?.url || "";
        setFormData((prev) => ({ ...prev, logo: logoUrl }));
        setLogoPreview(logoUrl);
        toast.success(
          locale === "ar" ? "تم رفع الشعار بنجاح" : "Logo uploaded successfully"
        );
      } catch (error) {
        toast.error(
          locale === "ar" ? "فشل رفع الشعار" : "Failed to upload logo"
        );
      } finally {
        setUploadingLogo(false);
      }
    },
    [isPremiumUser, locale]
  );

  const handleRemoveLogo = useCallback(() => {
    setFormData((prev) => ({ ...prev, logo: "" }));
    setLogoPreview(null);
    toast.success(locale === "ar" ? "تم إزالة الشعار" : "Logo removed");
  }, [locale]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Build update object with only changed fields
      const updates: any = {};
      const fields: (keyof typeof formData)[] = [
        "nameEn",
        "nameAr",
        "descriptionEn",
        "descriptionAr",
        "logo",
        "theme",
        "currency",
        "isActive",
      ];

      fields.forEach((field) => {
        if (formData[field] !== originalData[field]) {
          updates[field] = formData[field];
        }
      });

      // Only send request if there are changes
      if (Object.keys(updates).length === 0) {
        toast(
          locale === "ar" ? "لا توجد تغييرات لحفظها" : "No changes to save",
          { icon: "ℹ️" }
        );
        return;
      }

      setSaving(true);

      try {
        const token = localStorage.getItem("accessToken");
        
        console.log("📤 Sending update:", updates);
        
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

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("❌ Update failed:", response.status, errorData);
          throw new Error(errorData.error || "Failed to update menu");
        }

        toast.success(t("saveSuccess"));
        setOriginalData({ ...formData });
        router.push(`/${locale}/dashboard/menus/${id}`);
      } catch (error: any) {
        console.error("❌ Error:", error);
        toast.error(error.message || t("saveError"));
      } finally {
        setSaving(false);
      }
    },
    [formData, originalData, id, locale, t, router]
  );

  const handleIsActiveChange = useCallback(
    (checked: boolean) => {
      if (!checked && formData.isActive) {
        setModalState((prev) => ({
          ...prev,
          deactivateModal: { show: true, confirmText: "", isProcessing: false },
        }));
      } else {
        setFormData((prev) => ({ ...prev, isActive: checked }));
      }
    },
    [formData.isActive]
  );

  const handleDeactivateConfirm = useCallback(() => {
    if (modalState.deactivateModal.confirmText !== "DEACTIVATE") {
      toast.error(
        locale === "ar"
          ? 'يرجى كتابة "DEACTIVATE" للتأكيد'
          : 'Please type "DEACTIVATE" to confirm'
      );
      return;
    }

    setFormData((prev) => ({ ...prev, isActive: false }));
    setModalState((prev) => ({
      ...prev,
      deactivateModal: { show: false, confirmText: "", isProcessing: false },
    }));

    toast.success(
      locale === "ar"
        ? "تم تعطيل القائمة. لا تنسَ حفظ التغييرات."
        : "Menu deactivated. Don't forget to save changes."
    );
  }, [modalState.deactivateModal.confirmText, locale]);

  const handleDeleteClick = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      deleteModal: { show: true, confirmText: "", isProcessing: false },
    }));
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (modalState.deleteModal.confirmText !== "DELETE") {
      toast.error(
        locale === "ar"
          ? 'يرجى كتابة "DELETE" للتأكيد'
          : 'Please type "DELETE" to confirm'
      );
      return;
    }

    setModalState((prev) => ({
      ...prev,
      deleteModal: { ...prev.deleteModal, isProcessing: true },
    }));

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
      router.push(`/${locale}/dashboard/menus`);
    } catch (error) {
      toast.error(t("deleteError"));
      setModalState((prev) => ({
        ...prev,
        deleteModal: { ...prev.deleteModal, isProcessing: false },
      }));
    }
  }, [modalState.deleteModal.confirmText, id, locale, t, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
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
              {menuName || t("title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`flex-1 px-6 py-4 font-semibold text-base transition-all flex items-center justify-center gap-2 ${
              activeTab === "general"
                ? "bg-primary-500 text-white shadow-lg"
                : "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <i className="material-symbols-outlined !text-[24px]">settings</i>
            <span>الإعدادات العامة</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("appearance")}
            className={`flex-1 px-6 py-4 font-semibold text-base transition-all flex items-center justify-center gap-2 ${
              activeTab === "appearance"
                ? "bg-primary-500 text-white shadow-lg"
                : "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <i className="material-symbols-outlined !text-[24px]">palette</i>
            <span>{locale === "ar" ? "الشكل والتصميم" : "Appearance"}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Tab Content */}
        {activeTab === "general" && (
          <>
            {/* General Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <i className="material-symbols-outlined text-primary-500">
                  info
                </i>
                {t("sections.general")}
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <i className="material-symbols-outlined !text-[18px] text-primary-500">
                        language
                      </i>
                      {t("fields.nameEn")}
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) =>
                        setFormData({ ...formData, nameEn: e.target.value })
                      }
                      className="form-input"
                      placeholder="Restaurant Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <i className="material-symbols-outlined !text-[18px] text-primary-500">
                        translate
                      </i>
                      {t("fields.nameAr")}
                    </label>
                    <input
                      type="text"
                      value={formData.nameAr}
                      onChange={(e) =>
                        setFormData({ ...formData, nameAr: e.target.value })
                      }
                      className="form-input"
                      dir="rtl"
                      placeholder="اسم المطعم"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <i className="material-symbols-outlined !text-[18px] text-primary-500">
                      description
                    </i>
                    {t("fields.descriptionEn")}
                  </label>
                  <textarea
                    value={formData.descriptionEn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        descriptionEn: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-500 dark:bg-gray-700 dark:text-white resize-none transition-colors"
                    placeholder="Describe your menu in English..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <i className="material-symbols-outlined !text-[18px] text-primary-500">
                      article
                    </i>
                    {t("fields.descriptionAr")}
                  </label>
                  <textarea
                    value={formData.descriptionAr}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        descriptionAr: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-500 dark:bg-gray-700 dark:text-white resize-none transition-colors"
                    dir="rtl"
                    placeholder="صف قائمتك بالعربية..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <i className="material-symbols-outlined !text-[18px] text-blue-500">
                      link
                    </i>
                    {t("fields.slug")}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.slug}
                      className="form-input pl-12 cursor-not-allowed"
                      disabled
                    />
                    <i className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 !text-[20px]">
                      lock
                    </i>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <i className="material-symbols-outlined !text-[16px]">
                        info
                      </i>
                      {t("fields.slugHint")} - لا يمكن تغيير الرابط بعد الإنشاء
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Currency Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <i className="material-symbols-outlined text-green-500">
                  payments
                </i>
                {t("sections.currency")}
              </h2>

              <div className="max-w-2xl">
                <CurrencySelector
                  value={formData.currency}
                  onChange={(currency) =>
                    setFormData({ ...formData, currency })
                  }
                  label={t("fields.currency")}
                  hint={t("fields.currencyHint")}
                  showArabOnly={false}
                />

                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <i className="material-symbols-outlined text-blue-500 !text-[24px] mt-0.5">
                      info
                    </i>
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                        {locale === "ar" ? "ملاحظة" : "Note"}
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        {locale === "ar"
                          ? "العملة التي تختارها سيتم عرضها مع جميع الأسعار في قائمتك العامة."
                          : "The currency you select will be displayed with all prices in your public menu."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <i className="material-symbols-outlined text-green-500">
                  toggle_on
                </i>
                {t("sections.status")}
              </h2>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="flex items-center h-6">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => handleIsActiveChange(e.target.checked)}
                      className="w-6 h-6 text-green-500 rounded-lg focus:ring-2 focus:ring-green-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="isActive"
                      className="text-base font-semibold text-gray-900 dark:text-white cursor-pointer flex items-center gap-2"
                    >
                      <i className="material-symbols-outlined !text-[20px] text-green-500">
                        {formData.isActive ? "check_circle" : "cancel"}
                      </i>
                      {t("fields.isActive")}
                    </label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {t("fields.isActiveHint")}
                    </p>
                    {!formData.isActive && (
                      <div className="mt-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2">
                        <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1">
                          <i className="material-symbols-outlined !text-[14px]">
                            warning
                          </i>
                          القائمة غير مرئية للعملاء حالياً
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Favicon/Logo Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <i className="material-symbols-outlined text-blue-500">image</i>
                {locale === "ar"
                  ? "شعار القائمة (Favicon)"
                  : "Menu Logo (Favicon)"}
              </h2>

              {/* Premium Feature Check */}
              {!isPremiumUser ? (
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-6 border-2 border-amber-300 dark:border-amber-700">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="material-symbols-outlined text-white !text-[28px]">
                        lock
                      </i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-amber-900 dark:text-amber-400 mb-2">
                        {locale === "ar"
                          ? "ميزة حصرية للمشتركين"
                          : "Premium Feature"}
                      </h3>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                        {locale === "ar"
                          ? "قم بالترقية إلى الخطة المدفوعة لتتمكن من تخصيص شعار قائمتك وإضافة Favicon مخصص"
                          : "Upgrade to a premium plan to customize your menu logo and add a custom favicon"}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/${locale}/dashboard/profile/user-profile`
                          )
                        }
                        className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold"
                      >
                        <i className="material-symbols-outlined !text-[20px]">
                          upgrade
                        </i>
                        {locale === "ar" ? "ترقية الخطة" : "Upgrade Plan"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Current Logo Preview */}
                  {logoPreview && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
                        <img
                          src={logoPreview}
                          alt="Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {locale === "ar" ? "الشعار الحالي" : "Current Logo"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {locale === "ar"
                            ? "سيظهر كـ favicon في متصفح الزوار"
                            : "Will appear as favicon in visitors' browsers"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2 text-sm font-semibold"
                      >
                        <i className="material-symbols-outlined !text-[18px]">
                          delete
                        </i>
                        {locale === "ar" ? "إزالة" : "Remove"}
                      </button>
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="relative">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/png,image/jpeg,image/jpg,image/x-icon"
                      onChange={handleLogoChange}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                    <label
                      htmlFor="logo-upload"
                      className={`flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                        uploadingLogo
                          ? "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 cursor-not-allowed"
                          : "border-primary-300 dark:border-primary-700 hover:border-primary-500 dark:hover:border-primary-500 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30"
                      }`}
                    >
                      {uploadingLogo ? (
                        <>
                          <div className="w-6 h-6 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-gray-600 dark:text-gray-400 font-semibold">
                            {locale === "ar" ? "جاري الرفع..." : "Uploading..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <i className="material-symbols-outlined text-primary-500 !text-[28px]">
                            upload
                          </i>
                          <span className="text-primary-700 dark:text-primary-300 font-semibold">
                            {logoPreview
                              ? locale === "ar"
                                ? "تغيير الشعار"
                                : "Change Logo"
                              : locale === "ar"
                              ? "رفع شعار"
                              : "Upload Logo"}
                          </span>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <i className="material-symbols-outlined text-blue-500 !text-[24px] mt-0.5">
                        info
                      </i>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                          {locale === "ar" ? "نصائح" : "Tips"}
                        </h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                          <li>
                            {locale === "ar"
                              ? "الصيغ المدعومة: PNG, JPG, ICO"
                              : "Supported formats: PNG, JPG, ICO"}
                          </li>
                          <li>
                            {locale === "ar"
                              ? "الحجم الأقصى: 1 ميجابايت"
                              : "Maximum size: 1MB"}
                          </li>
                          <li>
                            {locale === "ar"
                              ? "يُنصح باستخدام صورة مربعة (مثل 512×512 بكسل)"
                              : "Recommended: Square image (e.g., 512×512 pixels)"}
                          </li>
                          <li>
                            {locale === "ar"
                              ? "سيظهر الشعار في علامة تبويب المتصفح"
                              : "Logo will appear in the browser tab"}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-6 border-2 border-red-300 dark:border-red-700 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="material-symbols-outlined text-white !text-[28px]">
                    warning
                  </i>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-red-900 dark:text-red-400 mb-2 flex items-center gap-2">
                    {t("dangerZone.title")}
                  </h2>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                    {t("dangerZone.description")}
                  </p>
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold"
                  >
                    <i className="material-symbols-outlined !text-[20px]">
                      delete
                    </i>
                    {t("dangerZone.deleteButton")}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Appearance Tab Content */}
        {activeTab === "appearance" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <i className="material-symbols-outlined text-purple-500">
                palette
              </i>
              اختر تصميم القائمة
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => {
                const isSelected = formData.theme === template.id;
                return (
                  <div
                    key={template.id}
                    onClick={() =>
                      setFormData({ ...formData, theme: template.id })
                    }
                    className={`relative group cursor-pointer rounded-xl overflow-hidden border-4 transition-all duration-300 ${
                      isSelected
                        ? "border-primary-500 shadow-2xl scale-105"
                        : "border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-xl"
                    }`}
                  >
                    {/* Preview Image/Placeholder */}
                    <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
                      {/* Template Preview Mockup */}
                      <div className="absolute inset-0 p-4 flex flex-col">
                        {/* Header */}
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 mb-3 shadow-md">
                          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                        {/* Content Grid/List based on template */}
                        {template.id === "default" && (
                          <div className="grid grid-cols-3 gap-2 flex-1">
                            {[...Array(6)].map((_, i) => (
                              <div
                                key={i}
                                className="bg-white dark:bg-gray-900 rounded-md shadow-sm"
                              ></div>
                            ))}
                          </div>
                        )}
                        {template.id === "template2" && (
                          <div className="grid grid-cols-2 gap-2 flex-1">
                            {[...Array(4)].map((_, i) => (
                              <div
                                key={i}
                                className="bg-white dark:bg-gray-900 rounded-md shadow-sm"
                              ></div>
                            ))}
                          </div>
                        )}
                        {template.id === "template3" && (
                          <div className="space-y-2 flex-1">
                            {[...Array(4)].map((_, i) => (
                              <div
                                key={i}
                                className="bg-white dark:bg-gray-900 rounded-md shadow-sm h-16"
                              ></div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Selected Badge */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                          <i className="material-symbols-outlined !text-[16px]">
                            check_circle
                          </i>
                          محدد
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div
                        className={`absolute inset-0 bg-primary-500/10 backdrop-blur-[1px] transition-opacity duration-300 ${
                          isSelected
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                      ></div>
                    </div>

                    {/* Template Info */}
                    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                        {locale === "ar" ? template.nameAr : template.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {locale === "ar"
                          ? template.descriptionAr
                          : template.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <i className="material-symbols-outlined text-blue-500 !text-[24px] mt-0.5">
                  lightbulb
                </i>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    نصيحة
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    اضغط على أي تصميم لمعاينته. التصميم المحدد سيظهر مباشرة في
                    قائمتك العامة.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold text-lg"
          >
            {saving ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                {t("buttons.saving")}
              </>
            ) : (
              <>
                <i className="material-symbols-outlined !text-[24px]">save</i>
                {t("buttons.save")}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/dashboard/menus/${id}`)}
            className="px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
          >
            <i className="material-symbols-outlined !text-[24px]">close</i>
            {t("buttons.cancel")}
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {modalState.deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-red-200 dark:border-red-800">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="material-symbols-outlined text-red-600 dark:text-red-400 !text-[32px]">
                  warning
                </i>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {locale === "ar"
                    ? "تأكيد حذف القائمة"
                    : "Confirm Menu Deletion"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {locale === "ar"
                    ? "هذا الإجراء لا يمكن التراجع عنه"
                    : "This action cannot be undone"}
                </p>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                {locale === "ar" ? (
                  <>
                    سيتم حذف <strong>{menuName}</strong> وجميع المنتجات والفئات
                    والإعلانات المرتبطة بها نهائياً.
                  </>
                ) : (
                  <>
                    <strong>{menuName}</strong> and all associated products,
                    categories, and ads will be permanently deleted.
                  </>
                )}
              </p>
              <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                {locale === "ar" ? (
                  <>
                    اكتب{" "}
                    <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">
                      DELETE
                    </span>{" "}
                    للتأكيد
                  </>
                ) : (
                  <>
                    Type{" "}
                    <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">
                      DELETE
                    </span>{" "}
                    to confirm
                  </>
                )}
              </p>
            </div>

            {/* Input Field */}
            <div className="mb-6">
              <input
                type="text"
                value={modalState.deleteModal.confirmText}
                onChange={(e) =>
                  setModalState((prev) => ({
                    ...prev,
                    deleteModal: {
                      ...prev.deleteModal,
                      confirmText: e.target.value,
                    },
                  }))
                }
                placeholder="DELETE"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-red-500 dark:bg-gray-700 dark:text-white font-mono text-center text-lg"
                disabled={modalState.deleteModal.isProcessing}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setModalState((prev) => ({
                    ...prev,
                    deleteModal: {
                      show: false,
                      confirmText: "",
                      isProcessing: false,
                    },
                  }))
                }
                disabled={modalState.deleteModal.isProcessing}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {locale === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={
                  modalState.deleteModal.isProcessing ||
                  modalState.deleteModal.confirmText !== "DELETE"
                }
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {modalState.deleteModal.isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {locale === "ar" ? "جاري الحذف..." : "Deleting..."}
                  </>
                ) : (
                  <>
                    <i className="material-symbols-outlined !text-[20px]">
                      delete_forever
                    </i>
                    {locale === "ar" ? "حذف نهائياً" : "Delete Forever"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {modalState.deactivateModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-amber-200 dark:border-amber-800">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="material-symbols-outlined text-amber-600 dark:text-amber-400 !text-[32px]">
                  pause_circle
                </i>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {locale === "ar"
                    ? "تأكيد تعطيل القائمة"
                    : "Confirm Menu Deactivation"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {locale === "ar"
                    ? "ستصبح القائمة غير مرئية للعملاء"
                    : "The menu will become invisible to customers"}
                </p>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
                {locale === "ar" ? (
                  <>
                    عند تعطيل القائمة <strong>{menuName}</strong>، لن يتمكن
                    العملاء من الوصول إليها أو مشاهدة المنتجات. يمكنك إعادة
                    تفعيلها في أي وقت.
                  </>
                ) : (
                  <>
                    When deactivating <strong>{menuName}</strong>, customers
                    will not be able to access it or view products. You can
                    reactivate it at any time.
                  </>
                )}
              </p>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                {locale === "ar" ? (
                  <>
                    اكتب{" "}
                    <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">
                      DEACTIVATE
                    </span>{" "}
                    للتأكيد
                  </>
                ) : (
                  <>
                    Type{" "}
                    <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">
                      DEACTIVATE
                    </span>{" "}
                    to confirm
                  </>
                )}
              </p>
            </div>

            {/* Input Field */}
            <div className="mb-6">
              <input
                type="text"
                value={modalState.deactivateModal.confirmText}
                onChange={(e) =>
                  setModalState((prev) => ({
                    ...prev,
                    deactivateModal: {
                      ...prev.deactivateModal,
                      confirmText: e.target.value,
                    },
                  }))
                }
                placeholder="DEACTIVATE"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-amber-500 dark:bg-gray-700 dark:text-white font-mono text-center text-lg"
                disabled={modalState.deactivateModal.isProcessing}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setModalState((prev) => ({
                    ...prev,
                    deactivateModal: {
                      show: false,
                      confirmText: "",
                      isProcessing: false,
                    },
                  }))
                }
                disabled={modalState.deactivateModal.isProcessing}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {locale === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleDeactivateConfirm}
                disabled={
                  modalState.deactivateModal.isProcessing ||
                  modalState.deactivateModal.confirmText !== "DEACTIVATE"
                }
                className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {modalState.deactivateModal.isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {locale === "ar" ? "جاري التعطيل..." : "Deactivating..."}
                  </>
                ) : (
                  <>
                    <i className="material-symbols-outlined !text-[20px]">
                      toggle_off
                    </i>
                    {locale === "ar" ? "تعطيل القائمة" : "Deactivate Menu"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
