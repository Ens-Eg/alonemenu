"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useCategories } from "@/hooks/useApi";
import api from "@/lib/api";

interface MenuItemFormProps {
  menuId: number;
  item?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({
  menuId,
  item,
  onSuccess,
  onCancel,
}) => {
  const t = useTranslations("MenuItems");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const { data: categories = [], isLoading: categoriesLoading } = useCategories(menuId);

  const [formData, setFormData] = useState({
    nameAr: item?.nameAr || item?.translations?.ar?.name || "",
    nameEn: item?.nameEn || item?.translations?.en?.name || "",
    descriptionAr: item?.descriptionAr || item?.translations?.ar?.description || "",
    descriptionEn: item?.descriptionEn || item?.translations?.en?.description || "",
    categoryId: item?.categoryId || null,
    category: item?.category || "",
    originalPrice: item?.originalPrice || "",
    discountPercent: item?.discountPercent || 0,
    price: item?.price || "",
    image: item?.image || "",
    available: item?.available !== undefined ? item.available : true,
  });

  // حساب السعر النهائي تلقائياً
  useEffect(() => {
    if (formData.originalPrice && formData.discountPercent > 0) {
      const original = parseFloat(formData.originalPrice);
      const discount = parseFloat(formData.discountPercent.toString());
      const final = original * (1 - discount / 100);
      setFormData(prev => ({ ...prev, price: final.toFixed(2) }));
    } else if (formData.originalPrice) {
      setFormData(prev => ({ ...prev, price: formData.originalPrice }));
    }
  }, [formData.originalPrice, formData.discountPercent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nameAr || !formData.nameEn) {
      toast.error(t("nameRequired"));
      return;
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      toast.error(t("priceRequired"));
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        nameAr: formData.nameAr,
        nameEn: formData.nameEn,
        descriptionAr: formData.descriptionAr || null,
        descriptionEn: formData.descriptionEn || null,
        price: parseFloat(formData.price),
        image: formData.image || null,
        available: formData.available,
      };

      // إضافة التصنيف إذا تم اختياره
      if (formData.categoryId) {
        payload.categoryId = formData.categoryId;
        // احصل على اسم التصنيف من القائمة
        const selectedCategory = categories.find((cat: any) => cat.id === formData.categoryId);
        payload.category = selectedCategory?.nameAr || selectedCategory?.name || "main";
      } else if (formData.category) {
        payload.category = formData.category;
      } else {
        // قيم افتراضية إذا لم يتم اختيار تصنيف
        payload.category = "main";
      }

      // إضافة الخصم إذا كان موجوداً
      if (formData.originalPrice) {
        payload.originalPrice = parseFloat(formData.originalPrice);
      }
      if (formData.discountPercent > 0) {
        payload.discountPercent = parseInt(formData.discountPercent.toString());
      }

      const result = item
        ? await api.put(`/menus/${menuId}/items/${item.id}`, payload)
        : await api.post(`/menus/${menuId}/items`, payload);

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success(item ? t("updateSuccess") : t("createSuccess"));
      onSuccess();
    } catch (error: any) {
      console.error("Error saving menu item:", error);
      toast.error(error.message || t("saveError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Preview */}
      {formData.image && (
        <div className="flex justify-center">
          <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <Image
              src={formData.image}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("imageUrl")}
        </label>
        <input
          type="url"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          placeholder={t("imagePlaceholder")}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {t("imageHint")}
        </p>
      </div>

      {/* Arabic Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("nameAr")} *
        </label>
        <input
          type="text"
          value={formData.nameAr}
          onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          placeholder={t("nameArPlaceholder")}
          required
          dir="rtl"
        />
      </div>

      {/* English Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("nameEn")} *
        </label>
        <input
          type="text"
          value={formData.nameEn}
          onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          placeholder={t("nameEnPlaceholder")}
          required
        />
      </div>

      {/* Arabic Description */}
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
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          placeholder={t("descriptionPlaceholder")}
          dir="rtl"
        />
      </div>

      {/* English Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("descriptionEn")}
        </label>
        <textarea
          value={formData.descriptionEn}
          onChange={(e) =>
            setFormData({ ...formData, descriptionEn: e.target.value })
          }
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          placeholder={t("descriptionPlaceholder")}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("category")} *
        </label>
        {categoriesLoading ? (
          <div className="text-sm text-gray-500">جاري تحميل التصنيفات...</div>
        ) : categories.length > 0 ? (
          <select
            value={formData.categoryId || ""}
            onChange={(e) =>
              setFormData({ ...formData, categoryId: e.target.value ? parseInt(e.target.value) : null })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            required
          >
            <option value="">{t("selectCategory")}</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {t("noCategoriesHint")}
            </p>
          </div>
        )}
      </div>

      {/* Price Section */}
      <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("pricing")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Original Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("originalPrice")}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.originalPrice}
              onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder="0.00"
            />
          </div>

          {/* Discount Percent */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("discountPercent")} (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.discountPercent}
              onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder="0"
            />
          </div>

          {/* Final Price (Calculated) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("finalPrice")} *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white bg-primary-50 dark:bg-primary-900/20"
              placeholder="0.00"
              required
            />
            {formData.originalPrice && formData.discountPercent > 0 && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                {t("calculatedPrice")}
              </p>
            )}
          </div>
        </div>

        {/* Discount Badge Preview */}
        {formData.originalPrice && formData.discountPercent > 0 && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <span className="line-through text-gray-500 dark:text-gray-400">
                ${formData.originalPrice}
              </span>
              <span className="px-2 py-1 bg-red-500 text-white rounded text-sm font-semibold">
                -{formData.discountPercent}%
              </span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                ${formData.price}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Available Toggle */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="available"
          checked={formData.available}
          onChange={(e) =>
            setFormData({ ...formData, available: e.target.checked })
          }
          className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
        />
        <label
          htmlFor="available"
          className="ltr:ml-2 rtl:mr-2 text-sm text-gray-700 dark:text-gray-300"
        >
          {t("available")}
        </label>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          disabled={loading}
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? t("saving") : item ? t("update") : t("create")}
        </button>
      </div>
    </form>
  );
};

export default MenuItemForm;

