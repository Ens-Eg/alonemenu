"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, notFound } from "next/navigation";
import { useEffect, useState, use } from "react";
import { useLocale, useTranslations } from "next-intl";
import toast from "react-hot-toast";
import Image from "next/image";

interface Ad {
  id: number;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  imageUrl: string | null;
  linkUrl: string | null;
  position: string;
  displayOrder: number;
  isActive: boolean;
  adType: "global" | "menu";
  menuId: number | null;
  impressionCount: number;
  clickCount: number;
  createdAt: string;
}

export default function AdsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { user, loading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [adToDelete, setAdToDelete] = useState<Ad | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [adToEdit, setAdToEdit] = useState<Ad | null>(null);

  // Check if user is on free plan
  const isFreePlan = user?.planType === "free" || !user?.planType;

  // Trigger notFound() when error is detected
  if (notFoundError) {
    notFound();
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/authentication/sign-in`);
    } else if (user) {
      fetchAds();
    }
  }, [user, loading, router, locale, id]);

  const fetchAds = async () => {
    try {
      setLoadingAds(true);

      if (isFreePlan) {
        // Free users: show only global ads
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/public/ads?position=banner&limit=20`
        );

        if (response.ok) {
          const data = await response.json();
          setAds(data.data?.ads || []);
        }
      } else {
        // Pro users: show only menu-specific ads (no global ads)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/menus/${id}/ads`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (response.status === 404) {
          setNotFoundError(true);
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setAds(data.data?.ads || []);
        } else if (response.status >= 400) {
          setNotFoundError(true);
        }
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
      setNotFoundError(true);
    } finally {
      setLoadingAds(false);
    }
  };

  const handleDeleteAd = async () => {
    if (!adToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ads/${adToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete ad");
      }

      toast.success(
        locale === "ar" ? "تم حذف الإعلان بنجاح!" : "Ad deleted successfully!"
      );
      setAdToDelete(null);
      fetchAds(); // Refresh the list
    } catch (error) {
      console.error("Error deleting ad:", error);
      toast.error(locale === "ar" ? "فشل حذف الإعلان" : "Failed to delete ad");
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {locale === "ar" ? "الإعلانات" : "Advertisements"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                {isFreePlan
                  ? locale === "ar"
                    ? "عرض الإعلانات العامة التي تظهر في قائمتك"
                    : "View global ads displayed on your public menu"
                  : locale === "ar"
                  ? "أضف إعلانات مخصصة لقائمتك - لن تظهر الإعلانات العامة"
                  : "Add custom ads for your menu - No global ads will be shown"}
              </p>
            </div>
            {!isFreePlan && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl font-medium"
              >
                <i className="material-symbols-outlined !text-[20px]">add</i>
                {locale === "ar" ? "إضافة إعلان" : "Add Advertisement"}
              </button>
            )}
          </div>
        </div>

        {/* Plan Notice - Only show for Free users */}
        {isFreePlan && (
          <div className="mb-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-amber-200 dark:border-amber-800/50 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="material-symbols-outlined text-amber-600 dark:text-amber-400 !text-[28px]">
                  workspace_premium
                </i>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {locale === "ar"
                    ? "قم بالترقية إلى خطة Pro"
                    : "Upgrade to Pro Plan"}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {locale === "ar"
                    ? "للتحكم في الإعلانات وإزالة الإعلانات العامة من قائمتك، قم بالترقية إلى خطة Pro."
                    : "To control advertisements and remove global ads from your menu, upgrade to Pro plan."}
                </p>
                <button
                  onClick={() =>
                    router.push(`/${locale}/dashboard/profile/edit`)
                  }
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <i className="material-symbols-outlined !text-[18px]">
                    upgrade
                  </i>
                  {locale === "ar" ? "ترقية الآن" : "Upgrade Now"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ads Grid */}
        {loadingAds ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {locale === "ar" ? "جاري التحميل..." : "Loading..."}
            </p>
          </div>
        ) : ads.length === 0 ? (
          <div className="trezo-card bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center border border-gray-100 dark:border-gray-700">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="material-symbols-outlined text-primary-500 dark:text-primary-400 !text-[48px]">
                ads_click
              </i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {isFreePlan
                ? locale === "ar"
                  ? "لا توجد إعلانات عامة حالياً"
                  : "No Global Ads Currently"
                : locale === "ar"
                ? "قم باضافة إعلاناتك المخصصة"
                : "Add your custom ads"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {isFreePlan
                ? locale === "ar"
                  ? "لا توجد إعلانات عامة متاحة في الوقت الحالي"
                  : "No global ads available at the moment"
                : locale === "ar"
                ? ""
                : ""}
            </p>
            {!isFreePlan && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <i className="material-symbols-outlined !text-[20px]">add</i>
                {locale === "ar" ? "إضافة إعلان مخصص" : "Add Custom Ad"}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className={`trezo-card bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700 ${
                  isFreePlan ? "opacity-75" : ""
                }`}
              >
                {/* Ad Header */}
                <div className="flex items-start gap-4 mb-4">
                  {ad.imageUrl ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-100 dark:border-gray-700 flex-shrink-0">
                      <Image
                        src={ad.imageUrl}
                        alt={locale === "ar" ? ad.titleAr : ad.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center flex-shrink-0">
                      <i className="material-symbols-outlined text-primary-500 dark:text-primary-400 !text-[40px]">
                        ads_click
                      </i>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                        {locale === "ar" ? ad.titleAr : ad.title}
                      </h3>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                          ad.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {ad.isActive
                          ? locale === "ar"
                            ? "نشط"
                            : "Active"
                          : locale === "ar"
                          ? "غير نشط"
                          : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {locale === "ar" ? ad.contentAr : ad.content}
                    </p>
                  </div>
                </div>

                {/* Ad Type & Position */}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      ad.adType === "global"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    }`}
                  >
                    {ad.adType === "global"
                      ? locale === "ar"
                        ? "إعلان عام"
                        : "Global Ad"
                      : locale === "ar"
                      ? "إعلان مخصص"
                      : "Custom Ad"}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    {locale === "ar"
                      ? ad.position === "banner"
                        ? "بانر"
                        : ad.position === "sidebar"
                        ? "شريط جانبي"
                        : ad.position === "header"
                        ? "رأس الصفحة"
                        : "تذييل"
                      : ad.position.charAt(0).toUpperCase() +
                        ad.position.slice(1)}
                  </span>
                </div>

                {/* Action Buttons - Only for Pro users */}
                {!isFreePlan && ad.adType === "menu" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAdToEdit(ad)}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all text-sm font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <i className="material-symbols-outlined !text-[18px]">
                        edit
                      </i>
                      {locale === "ar" ? "تعديل" : "Edit"}
                    </button>
                    <button
                      onClick={() => setAdToDelete(ad)}
                      className="px-4 py-2.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all text-sm"
                      title={locale === "ar" ? "حذف" : "Delete"}
                    >
                      <i className="material-symbols-outlined !text-[18px]">
                        delete
                      </i>
                    </button>
                  </div>
                )}

                {/* View Only Notice for Free Users */}
                {isFreePlan && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/50">
                    <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                      <i className="material-symbols-outlined !text-[16px]">
                        lock
                      </i>
                      {locale === "ar"
                        ? "قم بالترقية إلى Pro للتحكم في الإعلانات"
                        : "Upgrade to Pro to control ads"}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Ad Modal */}
      {showCreateModal && (
        <CreateAdModal
          menuId={id}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchAds();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {adToDelete && (
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
                {locale === "ar" ? "حذف الإعلان" : "Delete Advertisement"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {locale === "ar"
                  ? "هل أنت متأكد من حذف هذا الإعلان؟"
                  : "Are you sure you want to delete this advertisement?"}
              </p>
            </div>

            {/* Ad Info */}
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50">
              <p className="font-bold text-gray-900 dark:text-white truncate mb-1">
                {locale === "ar" ? adToDelete.titleAr : adToDelete.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {locale === "ar" ? adToDelete.contentAr : adToDelete.content}
              </p>
            </div>

            {/* Warning Message */}
            <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/50">
              <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium flex items-start gap-2">
                <i className="material-symbols-outlined !text-[18px] mt-0.5 flex-shrink-0">
                  info
                </i>
                <span>
                  {locale === "ar"
                    ? "هذا الإجراء لا يمكن التراجع عنه!"
                    : "This action cannot be undone!"}
                </span>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAdToDelete(null)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deleting}
              >
                {locale === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleDeleteAd}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {locale === "ar" ? "جاري الحذف..." : "Deleting..."}
                  </>
                ) : (
                  <>
                    <i className="material-symbols-outlined !text-[20px]">
                      delete_forever
                    </i>
                    {locale === "ar" ? "حذف" : "Delete"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Ad Modal */}
      {adToEdit && (
        <EditAdModal
          ad={adToEdit}
          onClose={() => setAdToEdit(null)}
          onSuccess={() => {
            setAdToEdit(null);
            fetchAds();
          }}
        />
      )}
    </div>
  );
}

// Create Ad Modal Component
interface CreateAdModalProps {
  menuId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateAdModal({ menuId, onClose, onSuccess }: CreateAdModalProps) {
  const locale = useLocale();
  const [formData, setFormData] = useState({
    title: "",
    titleAr: "",
    content: "",
    contentAr: "",
    imageUrl: "",
    linkUrl: "",
    position: "banner",
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(
        locale === "ar" ? "يجب اختيار صورة" : "Please select an image"
      );
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        locale === "ar"
          ? "حجم الصورة يجب أن يكون أقل من 5 ميجابايت"
          : "Image size must be less than 5MB"
      );
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.titleAr) {
      toast.error(
        locale === "ar"
          ? "الرجاء إدخال العنوان بالعربية والإنجليزية"
          : "Please enter title in both languages"
      );
      return;
    }

    if (!formData.content || !formData.contentAr) {
      toast.error(
        locale === "ar"
          ? "الرجاء إدخال المحتوى بالعربية والإنجليزية"
          : "Please enter content in both languages"
      );
      return;
    }

    // Validate image is required
    if (!imageFile) {
      toast.error(
        locale === "ar"
          ? "يجب رفع صورة للإعلان"
          : "Please upload an image for the advertisement"
      );
      return;
    }

    try {
      setLoading(true);

      // Upload image if exists
      let uploadedImageUrl = formData.imageUrl;
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("file", imageFile); // Changed from "image" to "file"
        imageFormData.append("type", "ads"); // Changed from "folder" to "type"

        const uploadResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/upload`, // Changed from "/upload/image" to "/upload"
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            body: imageFormData,
          }
        );

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          uploadedImageUrl = uploadData.data?.url || uploadData.url;
          // Make full URL if needed
          if (uploadedImageUrl && !uploadedImageUrl.startsWith("http")) {
            uploadedImageUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace(
              "/api",
              ""
            )}${uploadedImageUrl}`;
          }
        } else {
          throw new Error("Failed to upload image");
        }
      }

      // Create ad
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/menus/${menuId}/ads`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            ...formData,
            imageUrl: uploadedImageUrl,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create ad");
      }

      toast.success(
        locale === "ar" ? "تم إضافة الإعلان بنجاح!" : "Ad created successfully!"
      );
      onSuccess();
    } catch (error) {
      console.error("Error creating ad:", error);
      toast.error(
        locale === "ar" ? "فشل إضافة الإعلان" : "Failed to create ad"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="trezo-card bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="material-symbols-outlined text-white !text-[28px]">
                ads_click
              </i>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white !mb-0">
              {locale === "ar" ? "إضافة إعلان جديد" : "Add New Advertisement"}
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
          {/* Titles Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <i className="material-symbols-outlined text-amber-500 dark:text-amber-400 !text-[20px]">
                  label
                </i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white !mb-0">
                {locale === "ar" ? "عنوان الإعلان" : "Ad Title"}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {locale === "ar" ? "العنوان (English)" : "Title (English)"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="form-input"
                  placeholder="e.g., Special Offer!"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {locale === "ar" ? "العنوان (عربي)" : "Title (Arabic)"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.titleAr}
                  onChange={(e) =>
                    setFormData({ ...formData, titleAr: e.target.value })
                  }
                  className="form-input"
                  placeholder="مثال: عرض خاص!"
                  dir="rtl"
                  required
                />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <i className="material-symbols-outlined text-amber-500 dark:text-amber-400 !text-[20px]">
                  description
                </i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white !mb-0">
                {locale === "ar" ? "محتوى الإعلان" : "Ad Content"}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {locale === "ar" ? "المحتوى (English)" : "Content (English)"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all resize-none"
                  placeholder="Describe your advertisement..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {locale === "ar" ? "المحتوى (عربي)" : "Content (Arabic)"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.contentAr}
                  onChange={(e) =>
                    setFormData({ ...formData, contentAr: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all resize-none"
                  placeholder="اكتب وصف الإعلان..."
                  dir="rtl"
                  required
                />
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <i className="material-symbols-outlined text-amber-500 dark:text-amber-400 !text-[20px]">
                  image
                </i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white !mb-0">
                {locale === "ar" ? "صورة الإعلان" : "Ad Image"}{" "}
                <span className="text-red-500">*</span>
              </h3>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              {locale === "ar"
                ? "الصورة مطلوبة لإنشاء الإعلان"
                : "Image is required to create the advertisement"}
            </p>

            {imagePreview ? (
              <div className="relative inline-block">
                <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-md">
                  <Image
                    src={imagePreview}
                    alt="Ad preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg hover:scale-110"
                >
                  <i className="material-symbols-outlined !text-[16px]">
                    close
                  </i>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-amber-500 dark:hover:border-amber-500 transition-all bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <i className="material-symbols-outlined text-gray-400 dark:text-gray-500 !text-[48px] mb-2">
                    cloud_upload
                  </i>
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">
                      {locale === "ar" ? "انقر للرفع" : "Click to upload"}
                    </span>{" "}
                    {locale === "ar"
                      ? "أو اسحب الصورة هنا"
                      : "or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    PNG, JPG, GIF{" "}
                    {locale === "ar" ? "(حد أقصى 5 ميجابايت)" : "(max 5MB)"}
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {locale === "ar"
                ? "رابط الإعلان (اختياري)"
                : "Ad Link (Optional)"}
            </label>
            <input
              type="url"
              value={formData.linkUrl}
              onChange={(e) =>
                setFormData({ ...formData, linkUrl: e.target.value })
              }
              className="form-input"
              placeholder="https://example.com"
            />
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {locale === "ar" ? "موقع عرض الإعلان" : "Ad Position"}
            </label>
            <select
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              className="form-input"
            >
              <option value="banner">
                {locale === "ar" ? "بانر" : "Banner"}
              </option>
              <option value="sidebar">
                {locale === "ar" ? "شريط جانبي" : "Sidebar"}
              </option>
              <option value="header">
                {locale === "ar" ? "رأس الصفحة" : "Header"}
              </option>
              <option value="footer">
                {locale === "ar" ? "تذييل" : "Footer"}
              </option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {locale === "ar" ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {locale === "ar" ? "جاري الإضافة..." : "Creating..."}
                </>
              ) : (
                <>
                  <i className="material-symbols-outlined !text-[20px]">
                    add_circle
                  </i>
                  {locale === "ar" ? "إضافة الإعلان" : "Create Ad"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Ad Modal Component
interface EditAdModalProps {
  ad: Ad;
  onClose: () => void;
  onSuccess: () => void;
}

function EditAdModal({ ad, onClose, onSuccess }: EditAdModalProps) {
  const locale = useLocale();
  const [formData, setFormData] = useState({
    title: ad.title,
    titleAr: ad.titleAr,
    content: ad.content,
    contentAr: ad.contentAr,
    imageUrl: ad.imageUrl || "",
    linkUrl: ad.linkUrl || "",
    position: ad.position,
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(ad.imageUrl);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(
        locale === "ar" ? "يجب اختيار صورة" : "Please select an image"
      );
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        locale === "ar"
          ? "حجم الصورة يجب أن يكون أقل من 5 ميجابايت"
          : "Image size must be less than 5MB"
      );
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.titleAr) {
      toast.error(
        locale === "ar"
          ? "الرجاء إدخال العنوان بالعربية والإنجليزية"
          : "Please enter title in both languages"
      );
      return;
    }

    if (!formData.content || !formData.contentAr) {
      toast.error(
        locale === "ar"
          ? "الرجاء إدخال المحتوى بالعربية والإنجليزية"
          : "Please enter content in both languages"
      );
      return;
    }

    try {
      setLoading(true);

      // Upload new image if exists
      let uploadedImageUrl = formData.imageUrl;
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("file", imageFile);
        imageFormData.append("type", "ads");

        const uploadResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            body: imageFormData,
          }
        );

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          uploadedImageUrl = uploadData.data?.url || uploadData.url;
          // Make full URL if needed
          if (uploadedImageUrl && !uploadedImageUrl.startsWith("http")) {
            uploadedImageUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace(
              "/api",
              ""
            )}${uploadedImageUrl}`;
          }
        } else {
          throw new Error("Failed to upload image");
        }
      }

      // Update ad
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ads/${ad.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            ...formData,
            imageUrl: uploadedImageUrl,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update ad");
      }

      toast.success(
        locale === "ar" ? "تم تحديث الإعلان بنجاح!" : "Ad updated successfully!"
      );
      onSuccess();
    } catch (error) {
      console.error("Error updating ad:", error);
      toast.error(
        locale === "ar" ? "فشل تحديث الإعلان" : "Failed to update ad"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="trezo-card bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="material-symbols-outlined text-white !text-[28px]">
                edit
              </i>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white !mb-0">
              {locale === "ar" ? "تعديل الإعلان" : "Edit Advertisement"}
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
          {/* Titles Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <i className="material-symbols-outlined text-amber-500 dark:text-amber-400 !text-[20px]">
                  label
                </i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white !mb-0">
                {locale === "ar" ? "عنوان الإعلان" : "Ad Title"}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {locale === "ar" ? "العنوان (English)" : "Title (English)"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="e.g., Special Offer!"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {locale === "ar" ? "العنوان (عربي)" : "Title (Arabic)"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.titleAr}
                  onChange={(e) =>
                    setFormData({ ...formData, titleAr: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="مثال: عرض خاص!"
                  dir="rtl"
                  required
                />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <i className="material-symbols-outlined text-amber-500 dark:text-amber-400 !text-[20px]">
                  description
                </i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white !mb-0">
                {locale === "ar" ? "محتوى الإعلان" : "Ad Content"}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {locale === "ar" ? "المحتوى (English)" : "Content (English)"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all resize-none"
                  placeholder="Describe your advertisement..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {locale === "ar" ? "المحتوى (عربي)" : "Content (Arabic)"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.contentAr}
                  onChange={(e) =>
                    setFormData({ ...formData, contentAr: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all resize-none"
                  placeholder="اكتب وصف الإعلان..."
                  dir="rtl"
                  required
                />
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <i className="material-symbols-outlined text-amber-500 dark:text-amber-400 !text-[20px]">
                  image
                </i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white !mb-0">
                {locale === "ar" ? "صورة الإعلان" : "Ad Image"}
              </h3>
            </div>

            {imagePreview ? (
              <div className="relative inline-block w-full">
                <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-md">
                  <Image
                    src={imagePreview}
                    alt="Ad preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg hover:scale-110"
                >
                  <i className="material-symbols-outlined !text-[16px]">
                    close
                  </i>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-amber-500 dark:hover:border-amber-500 transition-all bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <i className="material-symbols-outlined text-gray-400 dark:text-gray-500 !text-[48px] mb-2">
                    cloud_upload
                  </i>
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">
                      {locale === "ar" ? "انقر للرفع" : "Click to upload"}
                    </span>{" "}
                    {locale === "ar"
                      ? "أو اسحب الصورة هنا"
                      : "or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    PNG, JPG, GIF{" "}
                    {locale === "ar" ? "(حد أقصى 5 ميجابايت)" : "(max 5MB)"}
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {locale === "ar"
                ? "رابط الإعلان (اختياري)"
                : "Ad Link (Optional)"}
            </label>
            <input
              type="url"
              value={formData.linkUrl}
              onChange={(e) =>
                setFormData({ ...formData, linkUrl: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              placeholder="https://example.com"
            />
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {locale === "ar" ? "موقع عرض الإعلان" : "Ad Position"}
            </label>
            <select
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
            >
              <option value="banner">
                {locale === "ar" ? "بانر" : "Banner"}
              </option>
              <option value="sidebar">
                {locale === "ar" ? "شريط جانبي" : "Sidebar"}
              </option>
              <option value="header">
                {locale === "ar" ? "رأس الصفحة" : "Header"}
              </option>
              <option value="footer">
                {locale === "ar" ? "تذييل" : "Footer"}
              </option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {locale === "ar" ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {locale === "ar" ? "جاري التحديث..." : "Updating..."}
                </>
              ) : (
                <>
                  <i className="material-symbols-outlined !text-[20px]">save</i>
                  {locale === "ar" ? "حفظ التعديلات" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
