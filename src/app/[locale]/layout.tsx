import "material-symbols";
import "remixicon/fonts/remixicon.css";
import "react-calendar/dist/Calendar.css";
import "swiper/css";
import "swiper/css/bundle";

// globals
import "./globals.css";

import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Toaster } from "react-hot-toast";

const tajawal = Tajawal({
  variable: "--font-body",
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Trezo - Tailwind Nextjs Admin Dashboard Templat",
  description: "Tailwind Nextjs Admin Dashboard Templat",
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Set the request locale for static rendering
  setRequestLocale(locale);

  // Load messages for the current locale directly
  const messages = (await import(`../../../messages/${locale}.json`)).default;

  // Set direction based on locale (RTL for Arabic, LTR for others)
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body className={`${tajawal.variable} antialiased`}>
        <ReactQueryProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <AuthProvider>
              {children}
              <Toaster position="top-right" />
            </AuthProvider>
          </NextIntlClientProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
