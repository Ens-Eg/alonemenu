"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export default function NotFound() {
  const router = useRouter();
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:via-[#0d1117] dark:to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full shadow-lg">
            <i className="material-symbols-outlined text-red-600 dark:text-red-400 !text-[80px]">
              error
            </i>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
          404
        </h1>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          {locale === "ar" ? "القائمة غير موجودة" : "Menu Not Found"}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          {locale === "ar"
            ? "عذراً، القائمة التي تبحث عنها غير موجودة أو ليس لديك صلاحية للوصول إليها."
            : "Sorry, the menu you're looking for doesn't exist or you don't have permission to access it."}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push(`/${locale}/dashboard/menus`)}
            className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2"
          >
            <i className="material-symbols-outlined !text-[24px]">arrow_back</i>
            {locale === "ar" ? "العودة للقوائم" : "Back to Menus"}
          </button>
          <button
            onClick={() => router.push(`/${locale}/dashboard`)}
            className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-semibold flex items-center justify-center gap-2"
          >
            <i className="material-symbols-outlined !text-[24px]">home</i>
            {locale === "ar" ? "الصفحة الرئيسية" : "Home"}
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 inline-block">
          <div className="flex items-start gap-3 text-left">
            <i className="material-symbols-outlined text-blue-500 !text-[24px] mt-0.5">
              info
            </i>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                {locale === "ar" ? "ملاحظة" : "Note"}
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                {locale === "ar"
                  ? "إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع الدعم الفني أو التحقق من صلاحياتك."
                  : "If you believe this is an error, please contact support or verify your permissions."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
