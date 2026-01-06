"use client";

import React, { useEffect } from "react";
import Settings from "./Settings";
import DarkMode from "./DarkMode";
import Fullscreen from "./Fullscreen";
import ProfileMenu from "./ProfileMenu";
import NotificationBell from "../../Notifications/NotificationBell";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

interface HeaderProps {
  toggleActive: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleActive }) => {
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    const elementId = document.getElementById("header");
    const handleScroll = () => {
      if (window.scrollY > 100) {
        elementId?.classList.add("shadow-sm");
      } else {
        elementId?.classList.remove("shadow-sm");
      }
    };

    document.addEventListener("scroll", handleScroll);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, []); // Added empty dependency array to avoid repeated effect calls

  const handleLanguageChange = (newLocale: string) => {
    // Get pathname without locale prefix
    const pathnameWithoutLocale = pathname.replace(/^\/(ar|en)/, "") || "/";
    // Navigate to the same page with the new locale
    window.location.href = `/${newLocale}${pathnameWithoutLocale}`;
  };

  // Check if we should hide the sidebar toggle button
  const pathnameWithoutLocale = pathname.replace(/^\/(ar|en)/, "") || "/";
  const shouldHideSidebarToggle =
    pathnameWithoutLocale === "/menus" ||
    pathnameWithoutLocale === "/dashboard/menus" ||
    pathnameWithoutLocale === "/dashboard";

  return (
    <>
      <div
        id="header"
        className="header-area bg-white dark:bg-[#0c1427] py-[13px] px-[20px] md:px-[25px] fixed top-0 z-[6] rounded-b-md transition-all"
      >
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex items-center justify-center md:justify-normal">
            {!shouldHideSidebarToggle && (
              <div className="relative leading-none top-px ltr:mr-[13px] ltr:md:mr-[18px] ltr:lg:mr-[23px] rtl:ml-[13px] rtl:md:ml-[18px] rtl:lg:ml-[23px]">
                <button
                  type="button"
                  className="hide-sidebar-toggle transition-all inline-block hover:text-primary-500"
                  onClick={toggleActive}
                >
                  <i className="material-symbols-outlined !text-[20px]">menu</i>
                </button>
              </div>
            )}

            {/* <SearchForm /> */}

            {/* <AppsMenu /> */}
          </div>

          <div className="flex items-center justify-center md:justify-normal mt-[13px] md:mt-0">
            {/* <ChooseLanguage /> */}

            {/* Language Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  handleLanguageChange(locale === "ar" ? "en" : "ar")
                }
                className="inline-flex items-center justify-center w-[40px] h-[40px] rounded-md transition-all hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                title={
                  locale === "ar" ? "Switch to English" : "التبديل إلى العربية"
                }
              >
                <i className="material-symbols-outlined !text-[20px] md:!text-[22px]">
                  translate
                </i>
              </button>
            </div>

            <DarkMode />

            <Fullscreen />

            <NotificationBell locale={locale} />

            <ProfileMenu />
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
