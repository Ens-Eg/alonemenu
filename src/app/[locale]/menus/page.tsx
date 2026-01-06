"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMenus, useCreateMenu, useDeleteMenu } from "@/hooks/useApi";
import api from "@/lib/api";
import { getMenuPublicUrl } from "@/lib/menuUrl";
import toast from "react-hot-toast";
import Image from "next/image";

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
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null);

  // React Query hooks
  const { data: menus = [], isLoading: loadingMenus } = useMenus();
  const deleteMenu = useDeleteMenu();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/authentication/sign-in`);
    }
  }, [user, loading, router, locale]);

  const handleToggleStatus = async (menuId: number, currentStatus: boolean) => {
    try {
      const result = await api.patch(`/menus/${menuId}/status`, {
        isActive: !currentStatus,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(currentStatus ? t("menuPaused") : t("menuActivated"));
      window.location.reload();
    } catch (error) {
      console.error("Error toggling menu status:", error);
      toast.error(t("toggleError"));
    }
  };

  const handleDelete = (menu: Menu) => {
    setMenuToDelete(menu);
  };

  const confirmDelete = async () => {
    if (!menuToDelete) return;
    await deleteMenu.mutateAsync(menuToDelete.id);
    setMenuToDelete(null);
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 bg-gradient-to-br dark:from-gray-900 dark:via-[#0d1117] dark:to-gray-900">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {t("title")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                {t("subtitle")}
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl font-medium"
            >
              <i className="material-symbols-outlined !text-[20px]">add</i>
              {t("createMenu")}
            </button>
          </div>
        </div>
        {loadingMenus ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              جاري التحميل...
            </p>
          </div>
        ) : menus.length === 0 ? (
          <div className="trezo-card bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center border border-gray-100 dark:border-gray-700">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="material-symbols-outlined text-primary-500 dark:text-primary-400 !text-[48px]">
                restaurant_menu
              </i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t("noMenus")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {t("getStarted")}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-medium shadow-lg hover:shadow-xl"
            >
              {t("createFirst")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.map((menu: Menu) => (
              <div
                key={menu.id}
                className="trezo-card bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700 group"
              >
                {/* Logo and Header */}
                <div className="flex items-start gap-4 mb-4">
                  {menu.logoUrl ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 dark:border-gray-700 flex-shrink-0">
                      <Image
                        src={menu.logoUrl}
                        alt={menu.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center flex-shrink-0">
                      <i className="material-symbols-outlined text-primary-500 dark:text-primary-400 !text-[32px]">
                        restaurant_menu
                      </i>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                        {menu.name}
                      </h3>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                          menu.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {menu.isActive ? t("active") : t("inactive")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {menu.description || t("noDescription")}
                    </p>
                  </div>
                </div>

                {/* Menu Info */}
                <div className="mb-4 space-y-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <i className="material-symbols-outlined !text-[16px]">
                      link
                    </i>
                    <span className="font-mono truncate">{menu.slug}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <i className="material-symbols-outlined !text-[16px]">
                      calendar_today
                    </i>
                    <span>{new Date(menu.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() =>
                      router.push(`/${locale}/dashboard/menus/${menu.id}`)
                    }
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all text-sm font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <i className="material-symbols-outlined !text-[18px]">
                      dashboard
                    </i>
                    {t("openDashboard")}
                  </button>
                  <button
                    onClick={() => handleToggleStatus(menu.id, menu.isActive)}
                    className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm"
                    title={menu.isActive ? t("pause") : t("activate")}
                  >
                    <i
                      className={`material-symbols-outlined !text-[18px] ${
                        menu.isActive ? "text-yellow-600" : "text-green-600"
                      }`}
                    >
                      {menu.isActive ? "pause" : "play_arrow"}
                    </i>
                  </button>
                  <button
                    onClick={() => handleDelete(menu)}
                    className="px-4 py-2.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all text-sm"
                    title={t("delete")}
                  >
                    <i className="material-symbols-outlined !text-[18px]">
                      delete
                    </i>
                  </button>
                </div>

                {/* View Public Link */}
                <a
                  href={getMenuPublicUrl(menu.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all text-sm font-medium border border-green-200 dark:border-green-800/50 hover:border-green-300 dark:hover:border-green-700"
                >
                  <i className="material-symbols-outlined !text-[18px]">
                    open_in_new
                  </i>
                  {t("viewPublic")}
                </a>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {menuToDelete && (
        <DeleteConfirmModal
          menu={menuToDelete}
          onClose={() => setMenuToDelete(null)}
          onConfirm={confirmDelete}
          isDeleting={deleteMenu.isPending}
        />
      )}

      {/* Create Menu Modal */}
      {showCreateModal && (
        <CreateMenuModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

interface DeleteConfirmModalProps {
  menu: Menu;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

function DeleteConfirmModal({
  menu,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteConfirmModalProps) {
  const t = useTranslations("Menus.deleteModal");
  const [confirmText, setConfirmText] = useState("");
  const isConfirmValid = confirmText === "DELETE";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isConfirmValid && !isDeleting) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="trezo-card bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <i className="material-symbols-outlined text-red-600 dark:text-red-400 !text-[40px]">
              warning
            </i>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t("title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {t("subtitle")}
          </p>
        </div>

        {/* Menu Info */}
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50">
          <div className="flex items-center gap-3 mb-2">
            {menu.logoUrl ? (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-red-200 dark:border-red-800 flex-shrink-0">
                <Image
                  src={menu.logoUrl}
                  alt={menu.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50 flex items-center justify-center flex-shrink-0">
                <i className="material-symbols-outlined text-red-600 dark:text-red-400 !text-[24px]">
                  restaurant_menu
                </i>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 dark:text-white truncate">
                {menu.name}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-mono truncate">
                {menu.slug}
              </p>
            </div>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 font-medium flex items-start gap-2">
            <i className="material-symbols-outlined !text-[18px] mt-0.5 flex-shrink-0">
              info
            </i>
            <span>{t("warning")}</span>
          </p>
        </div>

        {/* Confirmation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t("confirmPrompt")}{" "}
              <span className="font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded">
                {t("confirmKeyword")}
              </span>{" "}
              {t("confirmText")}
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white transition-all font-mono text-center text-lg ${
                confirmText && !isConfirmValid
                  ? "border-red-300 dark:border-red-600 focus:ring-red-500"
                  : confirmText && isConfirmValid
                  ? "border-green-300 dark:border-green-600 focus:ring-green-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-primary-500"
              }`}
              placeholder={t("placeholder")}
              disabled={isDeleting}
              autoFocus
            />
            {confirmText && !isConfirmValid && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <i className="material-symbols-outlined !text-[16px]">error</i>
                {t("errorInvalid")}
              </p>
            )}
            {isConfirmValid && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <i className="material-symbols-outlined !text-[16px]">
                  check_circle
                </i>
                {t("successConfirmed")}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isDeleting}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={!isConfirmValid || isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t("deleting")}
                </>
              ) : (
                <>
                  <i className="material-symbols-outlined !text-[20px]">
                    delete_forever
                  </i>
                  {t("delete")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CreateMenuModalProps {
  onClose: () => void;
}

function CreateMenuModal({ onClose }: CreateMenuModalProps) {
  const t = useTranslations("Menus.createModal");
  const locale = useLocale();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    slug: "",
    logo: null as File | null,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    nameEn: false,
    descriptionEn: false,
    nameAr: false,
    descriptionAr: false,
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
        } else if (result.data && typeof result.data === "object") {
          setSlugStatus({
            checking: false,
            available: (result.data as any).available ?? false,
            suggestions: (result.data as any).suggestions ?? [],
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

    // Check for validation errors
    if (
      validationErrors.nameEn ||
      validationErrors.descriptionEn ||
      validationErrors.nameAr ||
      validationErrors.descriptionAr
    ) {
      toast.error(t("validationError"));
      return;
    }

    // Check slug availability before submitting
    if (formData.slug && slugStatus.available === false) {
      toast.error("هذا الرابط مستخدم بالفعل. يرجى اختيار رابط آخر.");
      return;
    }

    try {
      let logoUrl = null;

      // Upload logo if exists
      if (formData.logo) {
        setUploadingLogo(true);
        const uploadResult = await api.uploadImage(formData.logo, "logos");
        if (uploadResult.error) {
          toast.error(uploadResult.error);
          setUploadingLogo(false);
          return;
        }
        // Get full URL if relative path
        const url = uploadResult.data?.url || null;
        logoUrl =
          url && !url.startsWith("http")
            ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${url}`
            : url;
        setUploadingLogo(false);
      }

      // Transform data to match backend expectations
      const menuData = {
        nameEn: formData.name,
        nameAr: formData.nameAr,
        descriptionEn: formData.description,
        descriptionAr: formData.descriptionAr,
        slug: formData.slug,
        logo: logoUrl,
      };

      const result = await createMenu.mutateAsync(menuData);
      onClose();

      // Redirect to dashboard after creation
      if (result?.menuId) {
        router.push(`/${locale}/dashboard/menus/${result.menuId}`);
      }
    } catch (error) {
      // Error handled by React Query hook
      setUploadingLogo(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData({ ...formData, slug: suggestion });
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (only .ico files)
    if (!file.type.includes("icon") && !file.name.endsWith(".ico")) {
      toast.error("يجب اختيار ملف favicon بصيغة .ico فقط");
      return;
    }

    // Validate file size (max 1MB)
    if (file.size > 1 * 1024 * 1024) {
      toast.error("حجم الملف يجب أن يكون أقل من 1 ميجابايت");
      return;
    }

    setFormData({ ...formData, logo: file });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData({ ...formData, logo: null });
    setLogoPreview(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="trezo-card bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="material-symbols-outlined text-white !text-[28px]">
                restaurant_menu
              </i>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white !mb-0">
              {t("title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-110"
          >
            <i className="material-symbols-outlined text-gray-500 dark:text-gray-400">
              close
            </i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Names Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <i className="material-symbols-outlined text-primary-500 dark:text-primary-400 !text-[20px]">
                  label
                </i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white !mb-0">
                {t("menuNames")}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t("nameEn")} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // Check if contains non-English characters
                      const hasInvalidChars = /[^a-zA-Z0-9\s.,'-]/.test(
                        inputValue
                      );

                      if (hasInvalidChars) {
                        setValidationErrors({
                          ...validationErrors,
                          nameEn: true,
                        });
                      } else {
                        setValidationErrors({
                          ...validationErrors,
                          nameEn: false,
                        });
                      }

                      setFormData({ ...formData, name: inputValue });
                    }}
                    className={`form-input ${
                      validationErrors.nameEn
                        ? "border-red-300 dark:border-red-600 focus:ring-red-500"
                        : ""
                    }`}
                    placeholder="e.g., My Restaurant Menu"
                    required
                  />
                </div>
                {validationErrors.nameEn && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <i className="material-symbols-outlined !text-[16px]">
                      error
                    </i>
                    {t("englishOnlyError")}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t("nameAr")} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // Check if contains non-Arabic characters
                      const hasInvalidChars =
                        /[^ا-ي\u0600-\u06FF\s\u0660-\u0669\u06F0-\u06F90-9.,'-]/.test(
                          inputValue
                        );

                      if (hasInvalidChars) {
                        setValidationErrors({
                          ...validationErrors,
                          nameAr: true,
                        });
                      } else {
                        setValidationErrors({
                          ...validationErrors,
                          nameAr: false,
                        });
                      }

                      setFormData({ ...formData, nameAr: inputValue });
                    }}
                    className={`form-input ${
                      validationErrors.nameAr
                        ? "border-red-300 dark:border-red-600 focus:ring-red-500"
                        : ""
                    }`}
                    placeholder="مثال: قائمة مطعمي"
                    dir="rtl"
                    required
                  />
                </div>
                {validationErrors.nameAr && (
                  <p
                    className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    dir="rtl"
                  >
                    <i className="material-symbols-outlined !text-[16px]">
                      error
                    </i>
                    {t("arabicOnlyError")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Logo Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <i className="material-symbols-outlined text-primary-500 dark:text-primary-400 !text-[20px]">
                  image
                </i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white !mb-0">
                {t("logo") || "شعار القائمة"}
              </h3>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t("logoUpload") || "رفع الشعار"}{" "}
                <span className="text-gray-400 text-xs font-normal">
                  (اختياري)
                </span>
              </label>

              {logoPreview ? (
                <div className="relative inline-block">
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-md">
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg hover:scale-110"
                  >
                    <i className="material-symbols-outlined !text-[16px]">
                      close
                    </i>
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition-all bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <i className="material-symbols-outlined text-gray-400 dark:text-gray-500 !text-[48px] mb-2">
                        cloud_upload
                      </i>
                      <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">انقر للرفع</span> أو
                        اسحب الصورة هنا
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        ICO فقط (حد أقصى 1 ميجابايت)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".ico,image/x-icon"
                      onChange={handleLogoChange}
                      disabled={uploadingLogo}
                    />
                  </label>
                </div>
              )}

              {uploadingLogo && (
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                  جاري رفع الصورة...
                </div>
              )}

              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50 flex items-center gap-1">
                <i className="material-symbols-outlined !text-[16px]">info</i>
                <span>
                  {t("logoHint") ||
                    "سيتم استخدام هذه الصورة كـ favicon للصفحة العامة للمنيو"}
                </span>
              </div>
            </div>
          </div>

          {/* Descriptions Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <i className="material-symbols-outlined text-primary-500 dark:text-primary-400 !text-[20px]">
                  description
                </i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white !mb-0">
                {t("descriptions")}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t("descriptionEn")}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    // Check if contains non-English characters
                    const hasInvalidChars = /[^a-zA-Z0-9\s.,!?'-]/.test(
                      inputValue
                    );

                    if (hasInvalidChars) {
                      setValidationErrors({
                        ...validationErrors,
                        descriptionEn: true,
                      });
                    } else {
                      setValidationErrors({
                        ...validationErrors,
                        descriptionEn: false,
                      });
                    }

                    setFormData({ ...formData, description: inputValue });
                  }}
                  rows={3}
                  className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all resize-none ${
                    validationErrors.descriptionEn
                      ? "border-red-300 dark:border-red-600 focus:ring-red-500"
                      : ""
                  }`}
                  placeholder="Describe your menu in English..."
                />
                {validationErrors.descriptionEn && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <i className="material-symbols-outlined !text-[16px]">
                      error
                    </i>
                    {t("englishOnlyError")}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t("descriptionAr")}
                </label>
                <textarea
                  value={formData.descriptionAr}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    // Check if contains non-Arabic characters
                    const hasInvalidChars =
                      /[^ا-ي\u0600-\u06FF\s\u0660-\u0669\u06F0-\u06F90-9.,!?'-]/.test(
                        inputValue
                      );

                    if (hasInvalidChars) {
                      setValidationErrors({
                        ...validationErrors,
                        descriptionAr: true,
                      });
                    } else {
                      setValidationErrors({
                        ...validationErrors,
                        descriptionAr: false,
                      });
                    }

                    setFormData({ ...formData, descriptionAr: inputValue });
                  }}
                  rows={3}
                  className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all resize-none ${
                    validationErrors.descriptionAr
                      ? "border-red-300 dark:border-red-600 focus:ring-red-500"
                      : ""
                  }`}
                  placeholder="اكتب وصف القائمة بالعربية..."
                  dir="rtl"
                />
                {validationErrors.descriptionAr && (
                  <p
                    className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    dir="rtl"
                  >
                    <i className="material-symbols-outlined !text-[16px]">
                      error
                    </i>
                    {t("arabicOnlyError")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Slug Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <i className="material-symbols-outlined text-primary-500 dark:text-primary-400 !text-[20px]">
                  link
                </i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white !mb-0">
                {t("urlSettings")}
              </h3>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t("slug")} <span className="text-red-500">*</span>
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
                  className={`form-input pr-10 ${
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
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                  </div>
                )}
                {!slugStatus.checking && slugStatus.available === true && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
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
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                  جاري التحقق من الرابط...
                </div>
              )}
              {!slugStatus.checking && slugStatus.available === true && (
                <div className="mt-3 text-sm text-green-600 dark:text-green-400 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-200 dark:border-green-800/50">
                  <i className="material-symbols-outlined !text-[18px]">
                    check_circle
                  </i>
                  هذا الرابط متاح
                </div>
              )}
              {!slugStatus.checking && slugStatus.available === false && (
                <div className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-200 dark:border-red-800/50">
                  <i className="material-symbols-outlined !text-[18px]">
                    cancel
                  </i>
                  هذا الرابط مستخدم بالفعل
                </div>
              )}

              {/* Suggestions */}
              {!slugStatus.checking &&
                slugStatus.available === false &&
                slugStatus.suggestions.length > 0 && (
                  <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <i className="material-symbols-outlined !text-[16px]">
                        lightbulb
                      </i>
                      اقتراحات مشابهة:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {slugStatus.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1.5 text-xs font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-300 dark:hover:border-primary-600 text-gray-700 dark:text-gray-300 transition-all hover:scale-105"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/50">
                <div className="flex items-start gap-2">
                  <i className="material-symbols-outlined text-blue-500 dark:text-blue-400 !text-[20px] mt-0.5 flex-shrink-0">
                    info
                  </i>
                  <div className="flex-1">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-1">
                      {t("slugHint")}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded border border-blue-200 dark:border-blue-800/50 inline-block">
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
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={createMenu.isPending || uploadingLogo}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={createMenu.isPending || uploadingLogo}
            >
              {createMenu.isPending || uploadingLogo ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {uploadingLogo ? "جاري الرفع..." : t("creating")}
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
