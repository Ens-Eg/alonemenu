"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { use } from "react";

interface Menu {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  itemsCount?: number;
}

interface Plan {
  id: number;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxMenus: number;
  maxProductsPerMenu: number;
}

interface Subscription {
  planName: string;
  billingCycle: string;
  startDate: string;
  endDate?: string;
  status: string;
}

interface UserDetails {
  id: number;
  email: string;
  name: string;
  role: string;
  planType: string;
  isSuspended: boolean;
  phoneNumber?: string;
  country?: string;
  createdAt: string;
  lastLoginAt?: string;
  emailVerified: boolean;
  menusCount?: number;
  menus?: Menu[];
  planName?: string;
  subscriptionStatus?: string;
  startDate?: string;
  endDate?: string;
  billingCycle?: string;
}

export default function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptionForm, setSubscriptionForm] = useState({
    planId: 1,
    billingCycle: "free" as "free" | "monthly" | "yearly",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // Check if user is admin
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }

    fetchUserDetails();
    fetchPlans();
  }, [user, authLoading, router, resolvedParams.id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${resolvedParams.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Combine user data with menus
        setUserDetails({
          ...data.user,
          menus: data.menus || [],
        });
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/plans/subscription`,
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
    }
  };

  const handleUpdateSubscription = async () => {
    try {
      setSubmitting(true);
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${resolvedParams.id}/subscription`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId: subscriptionForm.planId,
            billingCycle: subscriptionForm.billingCycle,
            startDate: subscriptionForm.startDate,
            endDate: subscriptionForm.endDate || null,
          }),
        }
      );

      if (response.ok) {
        alert("تم تحديث الاشتراك بنجاح!");
        setShowSubscriptionModal(false);
        fetchUserDetails(); // Refresh user details
      } else {
        const error = await response.json();
        alert(error.error || "فشل تحديث الاشتراك");
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      alert("حدث خطأ أثناء تحديث الاشتراك");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyFreeLimits = async () => {
    if (
      !confirm(
        "هل أنت متأكد من تطبيق قيود الخطة المجانية؟\n\nسيتم:\n• تعطيل القوائم الزائدة\n• حذف المنتجات الزائدة\n• حذف جميع الإعلانات\n• حذف جميع الفروع\n\nهذا الإجراء لا يمكن التراجع عنه!"
      )
    ) {
      return;
    }

    try {
      setSubmitting(true);
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${resolvedParams.id}/apply-free-limits`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const changes = result.changes;

        let message = "✅ تم تطبيق قيود الخطة المجانية بنجاح!\n\n";
        message += "التغييرات:\n";
        message += `• القوائم المعطلة: ${changes.menusDeactivated}\n`;
        message += `• المنتجات المحذوفة: ${changes.productsDeleted}\n`;
        message += `• الإعلانات المحذوفة: ${changes.adsDeleted}\n`;
        message += `• الفروع المحذوفة: ${changes.branchesDeleted}`;

        alert(message);
        fetchUserDetails(); // Refresh user details
      } else {
        const error = await response.json();
        alert(error.error || "فشل تطبيق قيود الخطة المجانية");
      }
    } catch (error) {
      console.error("Error applying free limits:", error);
      alert("حدث خطأ أثناء تطبيق القيود");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleMenuStatus = async (
    menuId: number,
    currentStatus: boolean
  ) => {
    try {
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/menus/${menuId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );

      if (response.ok) {
        // Update local state
        if (userDetails && userDetails.menus) {
          const updatedMenus = userDetails.menus.map((menu) =>
            menu.id === menuId ? { ...menu, isActive: !currentStatus } : menu
          );
          setUserDetails({ ...userDetails, menus: updatedMenus });
        }
        alert(`تم ${!currentStatus ? "تفعيل" : "إيقاف"} القائمة بنجاح`);
      } else {
        const error = await response.json();
        alert(error.error || "فشل تحديث حالة القائمة");
      }
    } catch (error) {
      console.error("Error toggling menu status:", error);
      alert("حدث خطأ أثناء تحديث حالة القائمة");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="py-5 px-5 sm:px-5 md:px-5 lg:px-8">
        <div className="text-center py-20">
          <p className="text-gray-600 dark:text-gray-400">المستخدم غير موجود</p>
          <button
            onClick={() => router.push(`/${locale}/admin/users`)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            رجوع للقائمة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5 px-5 sm:px-5 md:px-5 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                تفاصيل المستخدم
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                عرض معلومات المستخدم التفصيلية
              </p>
            </div>
            <button
              onClick={() => router.push(`/${locale}/admin/users`)}
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              ← رجوع
            </button>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="trezo-card bg-white dark:bg-[#0c1427] p-6 rounded-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              معلومات الاشتراك
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleApplyFreeLimits}
                disabled={submitting}
                className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="تطبيق قيود الخطة المجانية"
              >
                {submitting ? "جاري التطبيق..." : "تطبيق قيود Free"}
              </button>
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                تغيير الاشتراك
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">
                الخطة الحالية
              </label>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {userDetails.planName || "غير محدد"}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">
                نوع الدفع
              </label>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {userDetails.billingCycle === "monthly"
                  ? "شهري"
                  : userDetails.billingCycle === "yearly"
                  ? "سنوي"
                  : "مجاني"}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">
                تاريخ البدء
              </label>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {userDetails.startDate
                  ? new Date(userDetails.startDate).toLocaleDateString("ar-EG")
                  : "-"}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">
                تاريخ الانتهاء
              </label>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {userDetails.endDate
                  ? new Date(userDetails.endDate).toLocaleDateString("ar-EG")
                  : "غير محدد"}
              </p>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="trezo-card bg-white dark:bg-[#0c1427] p-6 rounded-md mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            المعلومات الأساسية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">
                الاسم
              </label>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {userDetails.name}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">
                البريد الإلكتروني
              </label>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {userDetails.email}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">
                الخطة
              </label>
              <p>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    userDetails.planType === "yearly"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : userDetails.planType === "monthly"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {userDetails.planType === "yearly"
                    ? "سنوي"
                    : userDetails.planType === "monthly"
                    ? "شهري"
                    : "مجاني"}
                </span>
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">
                الحالة
              </label>
              <p>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    userDetails.isSuspended
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  }`}
                >
                  {userDetails.isSuspended ? "موقوف" : "نشط"}
                </span>
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">
                حالة البريد
              </label>
              <p>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    userDetails.emailVerified
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}
                >
                  {userDetails.emailVerified ? "موثق" : "غير موثق"}
                </span>
              </p>
            </div>
            {userDetails.phoneNumber && (
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  رقم الهاتف
                </label>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {userDetails.phoneNumber}
                </p>
              </div>
            )}
            {userDetails.country && (
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  الدولة
                </label>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {userDetails.country}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">
                تاريخ التسجيل
              </label>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {new Date(userDetails.createdAt).toLocaleDateString("ar-EG")}
              </p>
            </div>
            {userDetails.lastLoginAt && (
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  آخر تسجيل دخول
                </label>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {new Date(userDetails.lastLoginAt).toLocaleDateString(
                    "ar-EG"
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Card */}
        <div className="trezo-card bg-white dark:bg-[#0c1427] p-6 rounded-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            الإحصائيات
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {userDetails.menus?.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                عدد القوائم
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {userDetails.emailVerified ? "✓" : "✗"}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                توثيق البريد
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {userDetails.planType === "yearly"
                  ? "سنوي"
                  : userDetails.planType === "monthly"
                  ? "شهري"
                  : "مجاني"}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                نوع الاشتراك
              </div>
            </div>
          </div>
        </div>

        {/* Menus Card */}
        <div className="trezo-card bg-white dark:bg-[#0c1427] p-6 rounded-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            القوائم ({userDetails.menus?.length || 0})
          </h2>

          {!userDetails.menus || userDetails.menus.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                لا توجد قوائم لهذا المستخدم
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {userDetails.menus.map((menu) => (
                <div
                  key={menu.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#15203c] rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {menu.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          menu.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {menu.isActive ? "نشط" : "موقوف"}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>
                        <strong>الرابط:</strong> {menu.slug}
                      </span>
                      <span>
                        <strong>المنتجات:</strong> {menu.itemsCount || 0}
                      </span>
                      <span>
                        <strong>التاريخ:</strong>{" "}
                        {new Date(menu.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() =>
                        window.open(`/${locale}/menu/${menu.slug}`, "_blank")
                      }
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      عرض
                    </button>
                    <button
                      onClick={() =>
                        handleToggleMenuStatus(menu.id, menu.isActive)
                      }
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        menu.isActive
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {menu.isActive ? "إيقاف" : "تفعيل"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0c1427] rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                تغيير اشتراك المستخدم
              </h3>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Plan Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اختر الخطة
                </label>
                <select
                  value={subscriptionForm.planId}
                  onChange={(e) => {
                    const selectedPlan = plans.find(
                      (p) => p.id === Number(e.target.value)
                    );
                    setSubscriptionForm({
                      ...subscriptionForm,
                      planId: Number(e.target.value),
                      billingCycle:
                        selectedPlan?.name === "Free" ? "free" : "monthly",
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#15203c] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {plan.maxMenus} قوائم
                    </option>
                  ))}
                </select>
              </div>

              {/* Billing Cycle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  دورة الفوترة
                </label>
                <select
                  value={subscriptionForm.billingCycle}
                  onChange={(e) =>
                    setSubscriptionForm({
                      ...subscriptionForm,
                      billingCycle: e.target.value as
                        | "free"
                        | "monthly"
                        | "yearly",
                    })
                  }
                  disabled={
                    plans.find((p) => p.id === subscriptionForm.planId)
                      ?.name === "Free"
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#15203c] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="free">مجاني</option>
                  <option value="monthly">شهري</option>
                  <option value="yearly">سنوي</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تاريخ البدء
                </label>
                <input
                  type="date"
                  value={subscriptionForm.startDate}
                  onChange={(e) =>
                    setSubscriptionForm({
                      ...subscriptionForm,
                      startDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#15203c] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* End Date */}
              {subscriptionForm.billingCycle !== "free" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    تاريخ الانتهاء (اختياري)
                  </label>
                  <input
                    type="date"
                    value={subscriptionForm.endDate}
                    onChange={(e) =>
                      setSubscriptionForm({
                        ...subscriptionForm,
                        endDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#15203c] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    إذا تُرك فارغاً، سيتم حساب التاريخ تلقائياً (شهر/سنة من
                    تاريخ البدء)
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdateSubscription}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "جاري التحديث..." : "تحديث الاشتراك"}
                </button>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
