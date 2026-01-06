"use client";

import { useEffect } from "react";
import { routing } from "@/i18n/routing";

export default function RootPage() {
  useEffect(() => {
    // Redirect to default locale
    window.location.href = `/${routing.defaultLocale}/`;
  }, []);

  return null;
}
