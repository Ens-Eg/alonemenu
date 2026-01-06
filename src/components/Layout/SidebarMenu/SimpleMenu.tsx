"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarMenuProps {
  toggleActive: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ toggleActive }) => {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Sidebar");
  const { user } = useAuth();

  // Extract menu ID from pathname if in menu context
  const menuIdMatch = pathname.match(/\/menus\/(\d+)/);
  const currentMenuId = menuIdMatch ? menuIdMatch[1] : null;

  // Save menuId to localStorage when in menu context
  React.useEffect(() => {
    if (currentMenuId && typeof window !== "undefined") {
      localStorage.setItem("lastMenuId", currentMenuId);
    }
  }, [currentMenuId]);

  // Get last menu ID from localStorage for profile pages
  const [lastMenuId, setLastMenuId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("lastMenuId");
      setLastMenuId(stored);
    }
  }, []);

  // Use current menu ID if available, otherwise use last menu ID for profile pages
  // Admin users should never see menu-specific sidebar
  const isProfilePage = pathname.includes("/profile/");
  const menuId =
    currentMenuId || (isProfilePage && lastMenuId && user?.role !== "admin" ? lastMenuId : null);

  // Determine menu items based on context
  const menuItems = menuId
    ? [
        {
          title: t("overview"),
          icon: "dashboard",
          href: `/${locale}/dashboard/menus/${menuId}`,
          badge: null,
        },
        {
          title: t("categories"), // التصنيفات
          icon: "category",
          href: `/${locale}/dashboard/menus/${menuId}/categories`,
          badge: null,
        },
        {
          title: t("products"), // المنتجات
          icon: "restaurant_menu",
          href: `/${locale}/dashboard/menus/${menuId}/products`,
          badge: null,
        },
        {
          title: t("ads"), // الإعلانات
          icon: "ads_click",
          href: `/${locale}/dashboard/menus/${menuId}/ads`,
          badge: "✨",
          isSpecial: true,
        },
        {
          title: t("settings"),
          icon: "settings",
          href: `/${locale}/dashboard/menus/${menuId}/settings`,
          badge: null,
        },
        {
          title: t("profile"),
          icon: "account_circle",
          href: `/${locale}/dashboard/profile/user-profile`,
          badge: null,
        },
      ]
    : user?.role === "admin"
    ? [
        // Admin users only see profile, not menus
        {
          title: t("profile"),
          icon: "account_circle",
          href: `/${locale}/dashboard/profile/user-profile`,
          badge: null,
        },
      ]
    : [
        {
          title: t("dashboard"),
          icon: "dashboard",
          href: `/${locale}/dashboard`,
          badge: null,
        },
        {
          title: t("menus"),
          icon: "restaurant_menu",
          href: `/${locale}/dashboard/menus`,
          badge: null,
        },
        {
          title: t("profile"),
          icon: "account_circle",
          href: `/${locale}/dashboard/profile/user-profile`,
          badge: null,
        },
      ];

  return (
    <>
      <div className="sidebar-area bg-white dark:bg-[#0c1427] fixed z-[7] top-0 h-screen transition-all rounded-r-md">
        <div className="logo bg-white dark:bg-[#0c1427] border-b border-gray-100 dark:border-[#172036] px-[25px] pt-[19px] pb-[15px] absolute z-[2] right-0 top-0 left-0">
          <div className="transition-none relative flex items-center outline-none">
            <Image
              src="/images/logo-icon.svg"
              alt="logo-icon"
              width={26}
              height={26}
            />
            <span className="font-bold text-black dark:text-white relative ltr:ml-[8px] rtl:mr-[8px] top-px text-xl">
              SaaS Menu
            </span>
          </div>

          <button
            type="button"
            className="burger-menu inline-block absolute z-[3] top-[24px] ltr:right-[25px] rtl:left-[25px] transition-all hover:text-primary-500"
            onClick={toggleActive}
          >
            <i className="material-symbols-outlined">close</i>
          </button>
        </div>

        <div className="pt-[89px] px-[22px] pb-[20px] h-screen overflow-y-scroll sidebar-custom-scrollbar">
          <div className="menu-section">
            <span className="block relative font-medium uppercase text-gray-400 mb-[8px] text-xs">
              {t("main")}
            </span>

            <ul className="space-y-1">
              {menuItems.map((item, index) => {
                // For menu context, only highlight exact matches
                // For general context, allow parent path highlighting
                const isActive = menuId
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(item.href + "/");

                const isSpecialItem = (item as any).isSpecial;

                return (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className={`flex items-center transition-all py-[10px] px-[14px] rounded-md font-medium w-full relative ${
                        isSpecialItem
                          ? isActive
                            ? "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 text-amber-600 dark:text-amber-400 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30"
                            : "hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-orange-50/50 dark:hover:from-amber-900/10 dark:hover:to-orange-900/10 text-gray-700 dark:text-gray-300"
                          : isActive
                          ? "bg-primary-50 dark:bg-[#15203c] text-primary-500 hover:bg-gray-50 dark:hover:bg-[#15203c]"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#15203c]"
                      }`}
                    >
                      <i
                        className={`material-symbols-outlined transition-all ltr:mr-[10px] rtl:ml-[10px] !text-[22px] leading-none relative -top-px ${
                          isSpecialItem
                            ? isActive
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-amber-500 dark:text-amber-500/70"
                            : isActive
                            ? "text-primary-500"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {item.icon}
                      </i>
                      <span className="title leading-none">{item.title}</span>
                      {item.badge && (
                        <span className={`rounded-full font-medium inline-block text-center min-w-[20px] h-[20px] px-[6px] text-[11px] leading-[20px] ltr:ml-auto rtl:mr-auto ${
                          isSpecialItem
                            ? "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 animate-pulse"
                            : "text-orange-500 bg-orange-50 dark:bg-[#ffffff14]"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Admin Section - only show for admin users */}
          {!menuId && user?.role === "admin" && (
            <div className="menu-section mt-8 pt-6 border-t border-gray-100 dark:border-[#172036]">
              <span className="block relative font-medium uppercase text-gray-400 mb-[8px] text-xs">
                {t("admin")}
              </span>

              <ul className="space-y-1">
                <li>
                  <Link
                    href={`/${locale}/admin`}
                    className={`flex items-center transition-all py-[10px] px-[14px] rounded-md font-medium w-full relative hover:bg-gray-50 dark:hover:bg-[#15203c] ${
                      pathname === `/${locale}/admin` &&
                      !pathname.includes("/admin/users") &&
                      !pathname.includes("/admin/plans") &&
                      !pathname.includes("/admin/ads") &&
                      !pathname.includes("/admin/admins")
                        ? "bg-primary-50 dark:bg-[#15203c] text-primary-500"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <i
                      className={`material-symbols-outlined transition-all ltr:mr-[10px] rtl:ml-[10px] !text-[22px] leading-none relative -top-px ${
                        pathname === `/${locale}/admin` &&
                        !pathname.includes("/admin/users") &&
                        !pathname.includes("/admin/plans") &&
                        !pathname.includes("/admin/ads") &&
                        !pathname.includes("/admin/admins")
                          ? "text-primary-500"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      dashboard
                    </i>
                    <span className="title leading-none">
                      {t("adminDashboard")}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/admin/users`}
                    className={`flex items-center transition-all py-[10px] px-[14px] rounded-md font-medium w-full relative hover:bg-gray-50 dark:hover:bg-[#15203c] ${
                      pathname.includes("/admin/users")
                        ? "bg-primary-50 dark:bg-[#15203c] text-primary-500"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <i
                      className={`material-symbols-outlined transition-all ltr:mr-[10px] rtl:ml-[10px] !text-[22px] leading-none relative -top-px ${
                        pathname.includes("/admin/users")
                          ? "text-primary-500"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      group
                    </i>
                    <span className="title leading-none">
                      {t("adminUsers")}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/admin/plans`}
                    className={`flex items-center transition-all py-[10px] px-[14px] rounded-md font-medium w-full relative hover:bg-gray-50 dark:hover:bg-[#15203c] ${
                      pathname.includes("/admin/plans")
                        ? "bg-primary-50 dark:bg-[#15203c] text-primary-500"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <i
                      className={`material-symbols-outlined transition-all ltr:mr-[10px] rtl:ml-[10px] !text-[22px] leading-none relative -top-px ${
                        pathname.includes("/admin/plans")
                          ? "text-primary-500"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      credit_card
                    </i>
                    <span className="title leading-none">
                      {t("adminPlans")}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/admin/ads`}
                    className={`flex items-center transition-all py-[10px] px-[14px] rounded-md font-medium w-full relative hover:bg-gray-50 dark:hover:bg-[#15203c] ${
                      pathname.includes("/admin/ads")
                        ? "bg-primary-50 dark:bg-[#15203c] text-primary-500"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <i
                      className={`material-symbols-outlined transition-all ltr:mr-[10px] rtl:ml-[10px] !text-[22px] leading-none relative -top-px ${
                        pathname.includes("/admin/ads")
                          ? "text-primary-500"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      campaign
                    </i>
                    <span className="title leading-none">{t("adminAds")}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/admin/admins`}
                    className={`flex items-center transition-all py-[10px] px-[14px] rounded-md font-medium w-full relative hover:bg-gray-50 dark:hover:bg-[#15203c] ${
                      pathname.includes("/admin/admins")
                        ? "bg-primary-50 dark:bg-[#15203c] text-primary-500"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <i
                      className={`material-symbols-outlined transition-all ltr:mr-[10px] rtl:ml-[10px] !text-[22px] leading-none relative -top-px ${
                        pathname.includes("/admin/admins")
                          ? "text-primary-500"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      admin_panel_settings
                    </i>
                    <span className="title leading-none">
                      {t("adminAdmins")}
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Settings Section - only show when NOT in menu context */}
          {!menuId && (
            <div className="menu-section mt-8 pt-6 border-t border-gray-100 dark:border-[#172036]">
              <span className="block relative font-medium uppercase text-gray-400 mb-[8px] text-xs">
                {t("other")}
              </span>

              <ul className="space-y-1">
                <li>
                  <Link
                    href={`/${locale}/dashboard/profile/edit`}
                    className={`flex items-center transition-all py-[10px] px-[14px] rounded-md font-medium w-full relative hover:bg-gray-50 dark:hover:bg-[#15203c] ${
                      pathname === `/${locale}/dashboard/profile/edit`
                        ? "bg-primary-50 dark:bg-[#15203c] text-primary-500"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <i
                      className={`material-symbols-outlined transition-all ltr:mr-[10px] rtl:ml-[10px] !text-[22px] leading-none relative -top-px ${
                        pathname === `/${locale}/dashboard/profile/edit`
                          ? "text-primary-500"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      settings
                    </i>
                    <span className="title leading-none">
                      {t("accountSettings")}
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Help & Support */}
          <div className="mt-auto pt-6">
            <div className="bg-primary-50 dark:bg-[#15203c] rounded-lg p-4">
              <div className="flex items-center mb-2">
                <i className="material-symbols-outlined text-primary-500 !text-[28px]">
                  help_outline
                </i>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                {t("needHelp")}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                {t("helpDescription")}
              </p>
              <Link
                href={`/${locale}/support`}
                className="inline-block text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
              >
                {t("contactSupport")} →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
