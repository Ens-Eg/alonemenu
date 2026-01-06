"use client";

import LayoutProvider from "@/providers/LayoutProvider";
import React from "react";

function MenusLayout({ children }: { children: React.ReactNode }) {
  return <LayoutProvider>{children}</LayoutProvider>;
}

export default MenusLayout;
