"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";

interface Plan {
  id: number;
  name: string;
  nameAr: string;
  price: number;
  durationInDays: number;
  maxMenus: number;
  maxProductsPerMenu: number;
  hasAds: boolean;
  allowCustomDomain: boolean;
  isActive: boolean;
}

export default function PlansManagement() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // Check if user is admin
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }

    fetchPlans();
  }, [user, authLoading, router]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/plans`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan({ ...plan });
    setShowEditModal(true);
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    try {
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/plans/${editingPlan.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priceMonthly: editingPlan.price,
            maxMenus: editingPlan.maxMenus,
            maxProductsPerMenu: editingPlan.maxProductsPerMenu,
            allowCustomDomain: editingPlan.allowCustomDomain,
            hasAds: editingPlan.hasAds,
            isActive: editingPlan.isActive,
          }),
        }
      );

      if (response.ok) {
        setShowEditModal(false);
        setEditingPlan(null);
        fetchPlans(); // Refresh list
        alert("تم تحديث الخطة بنجاح");
      } else {
        const error = await response.json();
        alert(error.error || "فشل تحديث الخطة");
      }
    } catch (error) {
      console.error("Error updating plan:", error);
      alert("حدث خطأ أثناء تحديث الخطة");
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
                إدارة الخطط
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                عرض وإدارة خطط الاشتراك المتاحة
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

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="trezo-card bg-white dark:bg-[#0c1427] p-6 rounded-md hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {plan.nameAr}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      plan.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {plan.isActive ? "نشط" : "غير نشط"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {plan.name}
                </p>
              </div>

              {/* Price */}
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${plan.price}
                  <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                    {" "}
                    / {plan.durationInDays} يوم
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm">
                  <span className="text-green-500 ml-2">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {plan.maxMenus === -1
                      ? "قوائم غير محدودة"
                      : `${plan.maxMenus} قائمة`}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-green-500 ml-2">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {plan.maxProductsPerMenu === -1
                      ? "منتجات غير محدودة"
                      : `${plan.maxProductsPerMenu} منتج لكل قائمة`}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span
                    className={`ml-2 ${
                      plan.allowCustomDomain ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {plan.allowCustomDomain ? "✓" : "✗"}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    نطاق مخصص
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span
                    className={`ml-2 ${
                      !plan.hasAds ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {!plan.hasAds ? "✓" : "✗"}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    بدون إعلانات
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleEditPlan(plan)}
                  className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  تعديل
                </button>
                <button
                  className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors ${
                    plan.isActive
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {plan.isActive ? "تعطيل" : "تفعيل"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Plan Button */}
        <div className="mt-6 text-center">
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            + إضافة خطة جديدة
          </button>
        </div>

        {/* Edit Plan Modal */}
        {showEditModal && editingPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#0c1427] rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                تعديل الخطة: {editingPlan.nameAr}
              </h2>

              <div className="space-y-4">
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    السعر ($)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.price}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0c1427] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Max Menus */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الحد الأقصى للقوائم (-1 = غير محدود)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.maxMenus}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        maxMenus: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0c1427] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Max Products Per Menu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الحد الأقصى للمنتجات لكل قائمة (-1 = غير محدود)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.maxProductsPerMenu}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        maxProductsPerMenu: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0c1427] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Allow Custom Domain */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="allowCustomDomain"
                    checked={editingPlan.allowCustomDomain}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        allowCustomDomain: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="allowCustomDomain"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    السماح بنطاق مخصص
                  </label>
                </div>

                {/* Has Ads */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="hasAds"
                    checked={editingPlan.hasAds}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        hasAds: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="hasAds"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    يحتوي على إعلانات
                  </label>
                </div>

                {/* Is Active */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editingPlan.isActive}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        isActive: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    الخطة نشطة
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSavePlan}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  حفظ التعديلات
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPlan(null);
                  }}
                  className="flex-1 px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
