"use client";

import CategoriesTable from "./CategoriesTable";
import { useTranslations } from "next-intl";

export default function CategoriesPage() {
  const t = useTranslations();

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
          {t("Categories.title")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t("Categories.subtitle")}
        </p>
      </div>

      <CategoriesTable />
    </div>
  );
}
