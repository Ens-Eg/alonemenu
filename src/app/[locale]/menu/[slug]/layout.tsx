import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/public/menu/${slug}?locale=${locale}`,
      {
        cache: "no-store", // Always fetch fresh data for metadata
      }
    );

    if (!response.ok) {
      return {
        title: "Menu Not Found",
        description: "The requested menu could not be found.",
      };
    }

    const data = await response.json();
    const menu = data.data?.menu;

    if (!menu) {
      return {
        title: "Menu Not Found",
        description: "The requested menu could not be found.",
      };
    }

    const metadata: Metadata = {
      title: menu.name || "Menu",
      description: menu.description || "",
    };

    // Add favicon if logo exists
    if (menu.logo) {
      metadata.icons = {
        icon: menu.logo,
        apple: menu.logo,
      };
    }

    return metadata;
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Menu",
      description: "Restaurant menu",
    };
  }
}

export default function MenuLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
