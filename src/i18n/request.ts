import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { IntlErrorCode } from "next-intl";

export default getRequestConfig(async () => {
  // For static export, we return default locale
  // The actual locale will be handled by setRequestLocale in layout
  const locale = routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    getMessageFallback({ namespace, key, error }) {
      const path = [namespace, key].filter((part) => part != null).join(".");

      if (error.code === IntlErrorCode.MISSING_MESSAGE) {
        // Return the key itself or a fallback value
        // Extract the last part of the key as fallback
        const keyParts = key?.split(".") || [];
        return keyParts[keyParts.length - 1] || path;
      }

      return path;
    },
  };
});
