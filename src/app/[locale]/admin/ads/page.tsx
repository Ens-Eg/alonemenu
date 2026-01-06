"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Ad {
  id: number;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  imageUrl?: string;
  linkUrl?: string;
  position: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  clickCount: number;
  impressionCount: number;
}

export default function AdsManagement() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adToDelete, setAdToDelete] = useState<Ad | null>(null);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [adToToggle, setAdToToggle] = useState<Ad | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    titleAr: "",
    content: "",
    contentAr: "",
    imageUrl: "",
    linkUrl: "",
    position: "banner",
    isActive: true,
    displayOrder: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // Check if user is admin
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }

    fetchAds();
  }, [user, authLoading, router]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/ads`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAds(data.ads || []);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = (ad: Ad) => {
    setAdToToggle(ad);
    setShowToggleModal(true);
  };

  const confirmToggleActive = async () => {
    if (!adToToggle) return;

    try {
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/ads/${adToToggle.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: !adToToggle.isActive }),
        }
      );

      if (response.ok) {
        toast.success(
          adToToggle.isActive ? "تم تعطيل الإعلان ✓" : "تم تفعيل الإعلان ✓"
        );
        fetchAds();
        setShowToggleModal(false);
        setAdToToggle(null);
      } else {
        toast.error("فشل تحديث الإعلان");
      }
    } catch (error) {
      console.error("Error updating ad:", error);
      toast.error("حدث خطأ أثناء تحديث الإعلان");
    }
  };

  const handleDeleteAd = (ad: Ad) => {
    setAdToDelete(ad);
    setShowDeleteModal(true);
  };

  const confirmDeleteAd = async () => {
    if (!adToDelete) return;

    try {
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/ads/${adToDelete.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        toast.success("تم حذف الإعلان بنجاح ✓");
        fetchAds();
        setShowDeleteModal(false);
        setAdToDelete(null);
      } else {
        toast.error("فشل حذف الإعلان");
      }
    } catch (error) {
      console.error("Error deleting ad:", error);
      toast.error("حدث خطأ أثناء حذف الإعلان");
    }
  };

  const handleEditAd = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title || "",
      titleAr: ad.titleAr || "",
      content: ad.content || "",
      contentAr: ad.contentAr || "",
      imageUrl: ad.imageUrl || "",
      linkUrl: ad.linkUrl || "",
      position: ad.position || "banner",
      isActive: ad.isActive,
      displayOrder: 0,
    });
    setImagePreview(ad.imageUrl || "");
    setShowEditModal(true);
  };

  const handleUpdateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;

    try {
      // Upload image first if exists
      let uploadedImageUrl = formData.imageUrl;
      if (imageFile) {
        const url = await uploadImageFile();
        if (!url) {
          toast.error("فشل رفع الصورة");
          return;
        }
        uploadedImageUrl = url;
      }

      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/ads/${editingAd.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            imageUrl: uploadedImageUrl,
          }),
        }
      );

      if (response.ok) {
        toast.success("تم تحديث الإعلان بنجاح ✨");
        setShowEditModal(false);
        setEditingAd(null);
        setFormData({
          title: "",
          titleAr: "",
          content: "",
          contentAr: "",
          imageUrl: "",
          linkUrl: "",
          position: "banner",
          isActive: true,
          displayOrder: 0,
        });
        setImageFile(null);
        setImagePreview("");
        fetchAds();
      } else {
        const error = await response.json();
        toast.error(error.error || "فشل تحديث الإعلان");
      }
    } catch (error) {
      console.error("Error updating ad:", error);
      toast.error("حدث خطأ أثناء تحديث الإعلان");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("حجم الصورة يجب أن لا يتجاوز 5 ميجابايت");
        e.target.value = ""; // Reset input
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("يجب اختيار ملف صورة صالح");
        e.target.value = "";
        return;
      }

      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageFile = async (): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      setUploadingImage(true);
      const uploadResponse = await api.uploadImage(imageFile, "ads");

      if (uploadResponse.error) {
        toast.error(uploadResponse.error);
        return null;
      }

      return uploadResponse.data?.imageUrl || uploadResponse.data?.url || null;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("حدث خطأ أثناء رفع الصورة");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Upload image first if exists
      let uploadedImageUrl = formData.imageUrl;
      if (imageFile) {
        const url = await uploadImageFile();
        if (!url) {
          toast.error("فشل رفع الصورة");
          return;
        }
        uploadedImageUrl = url;
      }

      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/ads`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            imageUrl: uploadedImageUrl,
          }),
        }
      );

      if (response.ok) {
        setShowAddForm(false);
        setFormData({
          title: "",
          titleAr: "",
          content: "",
          contentAr: "",
          imageUrl: "",
          linkUrl: "",
          position: "banner",
          isActive: true,
          displayOrder: 0,
        });
        setImageFile(null);
        setImagePreview("");
        fetchAds(); // Refresh list
        toast.success("تم إنشاء الإعلان بنجاح ✨");
      } else {
        const error = await response.json();
        toast.error(error.error || "فشل إنشاء الإعلان");
      }
    } catch (error) {
      console.error("Error creating ad:", error);
      toast.error("حدث خطأ أثناء إنشاء الإعلان");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-5 px-5 sm:px-5 md:px-5 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                إدارة الإعلانات
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                عرض وإدارة الإعلانات المعروضة للمستخدمين المجانيين
              </p>
            </div>
            <button
              onClick={() => router.push(`/${locale}/admin`)}
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              ← رجوع
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-4 rounded-md">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              إجمالي الإعلانات
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {ads.length}
            </div>
          </div>
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-4 rounded-md">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              الإعلانات النشطة
            </div>
            <div className="text-2xl font-bold text-green-600">
              {ads.filter((a) => a.isActive).length}
            </div>
          </div>
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-4 rounded-md">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              إجمالي النقرات
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {ads.reduce((sum, a) => sum + a.clickCount, 0)}
            </div>
          </div>
        </div>

        {/* Add New Ad Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            {showAddForm ? "✕ إلغاء" : "+ إضافة إعلان جديد"}
          </button>
        </div>

        {/* Add Ad Form */}
        {showAddForm && (
          <div className="mb-6 trezo-card bg-white dark:bg-[#0c1427] p-6 rounded-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              إضافة إعلان جديد
            </h2>
            <form onSubmit={handleCreateAd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* English Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    العنوان بالإنجليزية
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="form-input"
                  />
                </div>

                {/* Arabic Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    العنوان بالعربية *
                  </label>
                  <input
                    type="text"
                    value={formData.titleAr}
                    onChange={(e) =>
                      setFormData({ ...formData, titleAr: e.target.value })
                    }
                    required
                    className="form-input"
                  />
                </div>

                {/* English Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    المحتوى بالإنجليزية
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Arabic Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    المحتوى بالعربية
                  </label>
                  <textarea
                    value={formData.contentAr}
                    onChange={(e) =>
                      setFormData({ ...formData, contentAr: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    صورة الإعلان
                    <span className="text-xs text-gray-500 mr-2">
                      (حد أقصى 5 ميجابايت)
                    </span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        معاينة الصورة:
                      </p>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  )}
                </div>

                {/* Link URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    رابط الإعلان
                  </label>
                  <input
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, linkUrl: e.target.value })
                    }
                    placeholder="https://example.com"
                    className="form-input"
                  />
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    موضع الإعلان
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className="form-input"
                  >
                    <option value="banner">بانر</option>
                    <option value="header">رأس الصفحة</option>
                    <option value="sidebar">الشريط الجانبي</option>
                    <option value="footer">تذييل الصفحة</option>
                  </select>
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ترتيب العرض
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        displayOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className="form-input"
                  />
                </div>

                {/* Is Active */}
                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isActive"
                    className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    تفعيل الإعلان
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImage ? "جاري رفع الصورة..." : "إنشاء الإعلان"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setImageFile(null);
                    setImagePreview("");
                  }}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ads List */}
        <div className="space-y-4">
          {ads.length === 0 ? (
            <div className="trezo-card bg-white dark:bg-[#0c1427] p-8 rounded-md text-center">
              <p className="text-gray-600 dark:text-gray-400">
                لا توجد إعلانات بعد
              </p>
            </div>
          ) : (
            ads.map((ad) => (
              <div
                key={ad.id}
                className="trezo-card bg-white dark:bg-[#0c1427] p-6 rounded-md"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Image */}
                  {ad.imageUrl && (
                    <div className="w-full md:w-48 h-32 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={ad.imageUrl}
                        alt={ad.titleAr}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {ad.titleAr}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {ad.title}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ad.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {ad.isActive ? "نشط" : "غير نشط"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {ad.contentAr}
                    </p>

                    {/* Stats */}
                    <div className="flex gap-4 mb-3 text-sm">
                      <div className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">المكان:</span>{" "}
                        {ad.position}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">النقرات:</span>{" "}
                        {ad.clickCount}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">المشاهدات:</span>{" "}
                        {ad.impressionCount}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditAd(ad)}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleToggleActive(ad)}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                          ad.isActive
                            ? "bg-yellow-600 text-white hover:bg-yellow-700"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {ad.isActive ? "تعطيل" : "تفعيل"}
                      </button>
                      <button
                        onClick={() => handleDeleteAd(ad)}
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        حذف
                      </button>
                      {ad.linkUrl && (
                        <a
                          href={ad.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          عرض الرابط
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && editingAd && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#0c1427] rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                تعديل الإعلان
              </h2>
              <form onSubmit={handleUpdateAd} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* English Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      العنوان بالإنجليزية
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>

                  {/* Arabic Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      العنوان بالعربية *
                    </label>
                    <input
                      type="text"
                      value={formData.titleAr}
                      onChange={(e) =>
                        setFormData({ ...formData, titleAr: e.target.value })
                      }
                      required
                      className="form-input"
                    />
                  </div>

                  {/* English Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المحتوى بالإنجليزية
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Arabic Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المحتوى بالعربية
                    </label>
                    <textarea
                      value={formData.contentAr}
                      onChange={(e) =>
                        setFormData({ ...formData, contentAr: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      تغيير صورة الإعلان
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {imagePreview && (
                      <div className="mt-3">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full max-w-md h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  {/* Link URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      رابط الإعلان
                    </label>
                    <input
                      type="url"
                      value={formData.linkUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, linkUrl: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      موضع الإعلان
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                      className="form-input"
                    >
                      <option value="banner">بانر</option>
                      <option value="header">رأس الصفحة</option>
                      <option value="sidebar">الشريط الجانبي</option>
                      <option value="footer">تذييل الصفحة</option>
                    </select>
                  </div>

                  {/* Is Active */}
                  <div className="flex items-center pt-8">
                    <input
                      type="checkbox"
                      id="isActiveEdit"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <label
                      htmlFor="isActiveEdit"
                      className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      تفعيل الإعلان
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={uploadingImage}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {uploadingImage ? "جاري رفع الصورة..." : "حفظ التعديلات"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingAd(null);
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toggle Confirmation Modal */}
        {showToggleModal && adToToggle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-[#0c1427] rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                تأكيد العملية
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                هل أنت متأكد من{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {adToToggle.isActive ? "تعطيل" : "تفعيل"}
                </span>{" "}
                الإعلان:{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {adToToggle.titleAr}
                </span>
                ؟
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowToggleModal(false);
                    setAdToToggle(null);
                  }}
                  className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmToggleActive}
                  className={`px-4 py-2 text-sm text-white rounded-lg transition-colors ${
                    adToToggle.isActive
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {adToToggle.isActive ? "تعطيل" : "تفعيل"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && adToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-[#0c1427] rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                تأكيد الحذف
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                هل أنت متأكد من حذف الإعلان:{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {adToDelete.titleAr}
                </span>
                ؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setAdToDelete(null);
                  }}
                  className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmDeleteAd}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
