"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  planName: string;
  billingCycle: string;
  isSuspended: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export default function UsersManagement() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("AdminUsers");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    name: string;
    isSuspended: boolean;
  } | null>(null);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // Check if user is admin
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }

    fetchUsers();
  }, [user, authLoading, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users?limit=1000`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendToggle = (
    userId: number,
    name: string,
    isSuspended: boolean
  ) => {
    setSelectedUser({ id: userId, name, isSuspended });
    setShowConfirmModal(true);
  };

  const confirmSuspendToggle = async () => {
    if (!selectedUser) return;

    try {
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${selectedUser.id}/suspend`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isSuspended: !selectedUser.isSuspended }),
        }
      );

      if (response.ok) {
        fetchUsers(); // Refresh list
        setShowConfirmModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                {t("title")}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("subtitle")}
              </p>
            </div>
            <button
              onClick={() => router.push(`/${locale}/admin`)}
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {locale === "ar" ? "← " : ""}
              {t("backButton")}
              {locale === "en" ? " →" : ""}
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-4 rounded-md">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {t("stats.totalUsers")}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {users.length}
            </div>
          </div>
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-4 rounded-md">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {t("stats.activeUsers")}
            </div>
            <div className="text-2xl font-bold text-green-600">
              {users.filter((u) => !u.isSuspended).length}
            </div>
          </div>
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-4 rounded-md">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {t("stats.suspendedUsers")}
            </div>
            <div className="text-2xl font-bold text-red-600">
              {users.filter((u) => u.isSuspended).length}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="trezo-card bg-white dark:bg-[#0c1427] rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#15203c]">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {t("table.name")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {t("table.email")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {t("table.role")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {t("table.plan")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {t("table.status")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {t("table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      {t("noResults")}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {u.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {u.email}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {u.role === "admin"
                            ? t("roles.admin")
                            : t("roles.user")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            u.planName === "Yearly"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : u.planName === "Monthly"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {u.planName === "Yearly"
                            ? t("plans.yearly")
                            : u.planName === "Monthly"
                            ? t("plans.monthly")
                            : u.planName || t("plans.free")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            u.isSuspended
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          }`}
                        >
                          {u.isSuspended
                            ? t("status.suspended")
                            : t("status.active")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              router.push(`/${locale}/admin/users/${u.id}`)
                            }
                            className="font-normal inline-block transition-all rounded-md md:text-md py-[10px]  px-[20px]  bg-primary-500 text-white hover:bg-primary-400"
                          >
                            {t("actions.view")}
                          </button>
                          {u.role !== "admin" && (
                            <button
                              onClick={() =>
                                handleSuspendToggle(u.id, u.name, u.isSuspended)
                              }
                              className={` font-normal inline-block transition-all rounded-md md:text-md ltr:mr-[15px] rtl:ml-[15px] py-[10px] px-[20px] ]  text-white  ${
                                u.isSuspended
                                  ? "bg-green-600 text-white hover:bg-green-700"
                                  : "bg-red-600 text-white hover:bg-red-700"
                              }`}
                            >
                              {u.isSuspended
                                ? t("actions.activate")
                                : t("actions.suspend")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-[#0c1427] rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {t("confirmModal.title")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {selectedUser.isSuspended ? (
                  <>
                    {t("confirmModal.activateMessage")}{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {selectedUser.name}
                    </span>
                    ؟
                  </>
                ) : (
                  <>
                    {t("confirmModal.suspendMessage")}{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {selectedUser.name}
                    </span>
                    {t("confirmModal.suspendWarning")}
                  </>
                )}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {t("confirmModal.cancel")}
                </button>
                <button
                  onClick={confirmSuspendToggle}
                  className={`px-4 py-2 text-sm text-white rounded-lg transition-colors ${
                    selectedUser.isSuspended
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {selectedUser.isSuspended
                    ? t("actions.activate")
                    : t("actions.suspend")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
