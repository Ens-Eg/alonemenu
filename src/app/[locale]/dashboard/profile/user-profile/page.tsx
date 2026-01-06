"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSubscription } from "@/hooks/useApi";
import UserAvatar from "@/components/UserAvatar";

interface Subscription {
  plan: string;
  status: string;
  startDate: string;
  endDate: string | null;
  billingCycle: string;
}

export default function UserProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Profile.view");
  const tCommon = useTranslations("Common");

  // React Query hook
  const { data: subscription, isLoading: loadingSubscription } =
    useSubscription();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/authentication/sign-in`);
    }
  }, [user, loading, router, locale]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const planInfo = {
    free: { name: t("freePlan"), color: "gray", price: "$0/month" },
    monthly: {
      name: t("professionalPlan"),
      color: "purple",
      price: "$29/month",
    },
    yearly: {
      name: t("professionalPlan"),
      color: "purple",
      price: "$199/year",
    },
  };

  // Use billingCycle to determine the plan type
  const currentPlan = subscription?.billingCycle?.toLowerCase() || "free";
  const plan = planInfo[currentPlan as keyof typeof planInfo] || planInfo.free;

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t("subtitle")}
            </p>
          </div>
          <button
            onClick={() => router.push(`/${locale}/dashboard/profile/edit`)}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <i className="material-symbols-outlined !text-[20px]">edit</i>
            {t("editProfile")}
          </button>
        </div>

        {/* Profile Card */}
        <div className="rounded-lg shadow overflow-hidden mb-6 bg-white dark:bg-gray-800">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex items-end -mt-16 mb-4">
              <div className="w-32 h-32  rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                <UserAvatar
                  src={user.profileImage}
                  name={user.name}
                  size="xl"
                  className="!w-full !h-full"
                />
              </div>
              <div className="ml-4 mb-5">
                <h2 className="text-2xl font-bold !text-white">{user.name}</h2>
                <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              </div>
            </div>

            {/* User Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Left Column - Contact & Personal Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-3">
                  {t("personalInfo")}
                </h3>
                <div className="space-y-3">
                  {/* Email */}
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <div className="mr-2">
                      <p className="text-xs text-gray-500 dark:text-gray-300 !mb-0">
                        {t("email")}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <div className="mr-2">
                      <p className="text-xs text-gray-500 dark:text-gray-300 !mb-0">
                        {t("phone")}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.phoneNumber || t("notProvided")}
                      </p>
                    </div>
                  </div>

                  {/* Country */}
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="mr-2">
                      <p className="text-xs text-gray-500 dark:text-gray-300 !mb-0">
                        {t("country")}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.country || t("notProvided")}
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-300 !mb-0">
                        {t("address")}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.address || t("notProvided")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Account & Demographics Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-3">
                  {t("accountStatus")}
                </h3>
                <div className="space-y-3">
                  {/* Role */}
                  {/* <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <div className="mr-2">
                      <p className="text-xs text-gray-500 dark:text-gray-300 !mb-0">
                        {t("role")}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div> */}

                  {/* Member Since */}
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div className="mr-2">
                      <p className="text-xs text-gray-500 dark:text-gray-300 !mb-0">
                        {t("memberSince")}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(
                          user.createdAt || Date.now()
                        ).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div className="mr-2">
                      <p className="text-xs text-gray-500 dark:text-gray-300 !mb-0">
                        {t("dateOfBirth")}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.dateOfBirth
                          ? new Date(user.dateOfBirth).toLocaleDateString()
                          : t("notProvided")}
                      </p>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <div className="mr-2">
                      <p className="text-xs text-gray-500 dark:text-gray-300 !mb-0 ">
                        {t("gender")}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {user.gender ? t(user.gender) : t("notProvided")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Email Verification */}
            <div className="flex mt-10 items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {t("emailVerification")}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                {t("verified")}
              </span>
            </div>

            {/* Account Active */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {t("accountActive")}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                {t("active")}
              </span>
            </div>
          </div>
        </div>

        {/* Subscription Card - Only for regular users, not admins */}
        {user.role !== "admin" && (
          <div className="rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("subscription")}
              </h3>
              <button
                onClick={() =>
                  router.push(`/${locale}/dashboard/profile/edit#subscription`)
                }
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {t("manageSubscription")} →
              </button>
            </div>

            {loadingSubscription ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div>
                {/* Current Plan */}
                <div className={`border-2  rounded-lg p-6 mb-4`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {plan.name}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {plan.price}
                      </p>
                    </div>
                    <div
                      className={`px-4 py-2  text-black dark:text-white rounded-lg font-semibold`}
                    >
                      {t("currentPlan")}
                    </div>
                  </div>

                  {subscription && (
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600 dark:text-gray-300">
                        <span className="font-medium">{t("status")}:</span>{" "}
                        <span className="capitalize">
                          {subscription.status}
                        </span>
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        <span className="font-medium">
                          {t("billingCycle")}:
                        </span>{" "}
                        <span className="capitalize">
                          {subscription.billingCycle}
                        </span>
                      </p>
                      {subscription.billingCycle !== "free" && (
                        <>
                          <p className="text-gray-600 dark:text-gray-300">
                            <span className="font-medium">{t("started")}:</span>{" "}
                            {new Date(
                              subscription.startDate
                            ).toLocaleDateString("ar-EG", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          {subscription.endDate && (
                            <p className="text-gray-600 dark:text-gray-300">
                              <span className="font-medium">
                                {t("renews")}:
                              </span>{" "}
                              {new Date(
                                subscription.endDate
                              ).toLocaleDateString("ar-EG", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Upgrade Options */}
                {currentPlan === "free" && (
                  <div className=" border border-blue-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {t("upgradeTitle")}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {t("upgradeDescription")}
                    </p>
                    <button
                      onClick={() =>
                        router.push(
                          `/${locale}/dashboard/profile/edit#subscription`
                        )
                      }
                      className="px-6 py-2  text-black dark:text-white rounded-md hover:bg-blue-700 hover:text-white transition-colors"
                    >
                      {t("viewPlans")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
