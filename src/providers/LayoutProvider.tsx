"use client";

import React, { useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import SidebarMenu from "@/components/Layout/SidebarMenu/SimpleMenu";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { routing } from "@/i18n/routing";

interface LayoutProviderProps {
  children: ReactNode;
}

const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const pathname = usePathname();

  const [active, setActive] = useState<boolean>(false);

  const toggleActive = () => {
    setActive(!active);
  };

  // Remove locale prefix from pathname to check against routes
  const pathnameWithoutLocale =
    pathname.replace(new RegExp(`^/(${routing.locales.join("|")})`), "") || "/";

  // Check if current page is authentication or public page (no header/sidebar/footer)
  const isAuthPage =
    pathnameWithoutLocale.startsWith("/authentication/") ||
    pathnameWithoutLocale.startsWith("/menu/") || // Public menu pages
    pathnameWithoutLocale === "/" ||
    pathnameWithoutLocale.startsWith("/coming-soon") ||
    pathnameWithoutLocale.startsWith("/front-pages/");

  // Check if current page should hide sidebar (but keep header)
  const shouldHideSidebar =
    pathnameWithoutLocale === "/menus" || // Menu selection page (OUTSIDE dashboard)
    pathnameWithoutLocale === "/dashboard/menus";

  // Check if we're in a menu dashboard context (show sidebar)
  const isInMenuContext =
    pathnameWithoutLocale.startsWith("/menus/") &&
    pathnameWithoutLocale !== "/menus";

  return (
    <>
      <div
        className={`main-content-wrap transition-all ${active ? "active" : ""}`}
      >
        {!isAuthPage && (
          <>
            {/* Show Sidebar only if not in sidebar-hidden pages OR if in menu context */}
            {(!shouldHideSidebar || isInMenuContext) && (
              <SidebarMenu toggleActive={toggleActive} />
            )}

            {/* Always show Header for authenticated pages */}
            <Header toggleActive={toggleActive} />
          </>
        )}

        <div className="main-content transition-all flex flex-col overflow-hidden min-h-screen">
          {children}

          {!isAuthPage && <Footer />}
        </div>
      </div>
    </>
  );
};

export default LayoutProvider;
