"use client";

import LayoutProvider from "@/providers/LayoutProvider";
import React from "react";

function AdminLayout({ children }: { children: React.ReactNode }) {
  return <LayoutProvider>{children}</LayoutProvider>;
}

export default AdminLayout;

