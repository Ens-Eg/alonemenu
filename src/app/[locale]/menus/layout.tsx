"use client";

import React from "react";
import Navbar from "@/components/Layout/menus_layout/Navbar";
import Footer from "@/components/Layout/menus_layout/Footer";

function MenusLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default MenusLayout;
