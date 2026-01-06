// قائمة العملات العربية والعالمية
export interface Currency {
  code: string;
  nameAr: string;
  nameEn: string;
  symbol: string;
  country: string;
}

export const arabCurrencies: Currency[] = [
  {
    code: "SAR",
    nameAr: "الريال السعودي",
    nameEn: "Saudi Riyal",
    symbol: "ر.س",
    country: "المملكة العربية السعودية",
  },
  {
    code: "AED",
    nameAr: "الدرهم الإماراتي",
    nameEn: "UAE Dirham",
    symbol: "د.إ",
    country: "الإمارات العربية المتحدة",
  },
  {
    code: "EGP",
    nameAr: "الجنيه المصري",
    nameEn: "Egyptian Pound",
    symbol: "ج.م",
    country: "مصر",
  },
  {
    code: "KWD",
    nameAr: "الدينار الكويتي",
    nameEn: "Kuwaiti Dinar",
    symbol: "د.ك",
    country: "الكويت",
  },
  {
    code: "BHD",
    nameAr: "الدينار البحريني",
    nameEn: "Bahraini Dinar",
    symbol: "د.ب",
    country: "البحرين",
  },
  {
    code: "OMR",
    nameAr: "الريال العماني",
    nameEn: "Omani Rial",
    symbol: "ر.ع",
    country: "عمان",
  },
  {
    code: "QAR",
    nameAr: "الريال القطري",
    nameEn: "Qatari Riyal",
    symbol: "ر.ق",
    country: "قطر",
  },
  {
    code: "JOD",
    nameAr: "الدينار الأردني",
    nameEn: "Jordanian Dinar",
    symbol: "د.أ",
    country: "الأردن",
  },
  {
    code: "LBP",
    nameAr: "الليرة اللبنانية",
    nameEn: "Lebanese Pound",
    symbol: "ل.ل",
    country: "لبنان",
  },
  {
    code: "IQD",
    nameAr: "الدينار العراقي",
    nameEn: "Iraqi Dinar",
    symbol: "د.ع",
    country: "العراق",
  },
  {
    code: "SYP",
    nameAr: "الليرة السورية",
    nameEn: "Syrian Pound",
    symbol: "ل.س",
    country: "سوريا",
  },
  {
    code: "YER",
    nameAr: "الريال اليمني",
    nameEn: "Yemeni Rial",
    symbol: "ر.ي",
    country: "اليمن",
  },
  {
    code: "LYD",
    nameAr: "الدينار الليبي",
    nameEn: "Libyan Dinar",
    symbol: "د.ل",
    country: "ليبيا",
  },
  {
    code: "TND",
    nameAr: "الدينار التونسي",
    nameEn: "Tunisian Dinar",
    symbol: "د.ت",
    country: "تونس",
  },
  {
    code: "DZD",
    nameAr: "الدينار الجزائري",
    nameEn: "Algerian Dinar",
    symbol: "د.ج",
    country: "الجزائر",
  },
  {
    code: "MAD",
    nameAr: "الدرهم المغربي",
    nameEn: "Moroccan Dirham",
    symbol: "د.م",
    country: "المغرب",
  },
  {
    code: "MRU",
    nameAr: "الأوقية الموريتانية",
    nameEn: "Mauritanian Ouguiya",
    symbol: "أ.م",
    country: "موريتانيا",
  },
  {
    code: "SDG",
    nameAr: "الجنيه السوداني",
    nameEn: "Sudanese Pound",
    symbol: "ج.س",
    country: "السودان",
  },
  {
    code: "SOS",
    nameAr: "الشلن الصومالي",
    nameEn: "Somali Shilling",
    symbol: "ش.ص",
    country: "الصومال",
  },
  {
    code: "DJF",
    nameAr: "الفرنك الجيبوتي",
    nameEn: "Djiboutian Franc",
    symbol: "ف.ج",
    country: "جيبوتي",
  },
  {
    code: "KMF",
    nameAr: "الفرنك القمري",
    nameEn: "Comorian Franc",
    symbol: "ف.ق",
    country: "جزر القمر",
  },
];

// العملات العالمية الشائعة
export const internationalCurrencies: Currency[] = [
  {
    code: "USD",
    nameAr: "الدولار الأمريكي",
    nameEn: "US Dollar",
    symbol: "$",
    country: "الولايات المتحدة",
  },
  {
    code: "EUR",
    nameAr: "اليورو",
    nameEn: "Euro",
    symbol: "€",
    country: "الاتحاد الأوروبي",
  },
  {
    code: "GBP",
    nameAr: "الجنيه الإسترليني",
    nameEn: "British Pound",
    symbol: "£",
    country: "المملكة المتحدة",
  },
  {
    code: "TRY",
    nameAr: "الليرة التركية",
    nameEn: "Turkish Lira",
    symbol: "₺",
    country: "تركيا",
  },
];

// جميع العملات
export const allCurrencies: Currency[] = [
  ...arabCurrencies,
  ...internationalCurrencies,
];

// دالة للحصول على العملة حسب الكود
export const getCurrencyByCode = (code: string): Currency | undefined => {
  return allCurrencies.find((currency) => currency.code === code);
};

// دالة لتنسيق السعر مع العملة
export const formatPrice = (
  price: number,
  currencyCode: string,
  locale: string = "ar"
): string => {
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) return `${price.toFixed(2)} ${currencyCode}`;

  return `${price.toFixed(2)} ${currency.symbol}`;
};


