"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { allCurrencies, arabCurrencies, internationalCurrencies, Currency } from "@/constants/currencies";

interface CurrencySelectorProps {
  value: string;
  onChange: (currencyCode: string) => void;
  label?: string;
  hint?: string;
  showArabOnly?: boolean;
}

export default function CurrencySelector({
  value,
  onChange,
  label,
  hint,
  showArabOnly = false,
}: CurrencySelectorProps) {
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const currencies = showArabOnly ? arabCurrencies : allCurrencies;
  
  const selectedCurrency = currencies.find((c) => c.code === value);

  const filteredCurrencies = currencies.filter((currency) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      currency.code.toLowerCase().includes(searchLower) ||
      currency.nameAr.toLowerCase().includes(searchLower) ||
      currency.nameEn.toLowerCase().includes(searchLower) ||
      currency.country.toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = (currency: Currency) => {
    onChange(currency.code);
    setShowDropdown(false);
    setSearchQuery("");
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      {/* Selected Currency Display */}
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full px-4 py-3 bg-white dark:bg-[#0c1427] border border-gray-300 dark:border-gray-600 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
      >
        {selectedCurrency ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedCurrency.symbol}</span>
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">
                  {locale === "ar" ? selectedCurrency.nameAr : selectedCurrency.nameEn}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedCurrency.code} - {selectedCurrency.country}
                </div>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                showDropdown ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">
            {locale === "ar" ? "اختر العملة" : "Select Currency"}
          </span>
        )}
      </button>

      {hint && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{hint}</p>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute z-20 mt-2 w-full bg-white dark:bg-[#0c1427] border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-96 overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={locale === "ar" ? "بحث..." : "Search..."}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#15203c] border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
            </div>

            {/* Currency Groups */}
            <div className="overflow-y-auto max-h-80">
              {/* Arab Currencies */}
              {!showArabOnly && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    {locale === "ar" ? "العملات العربية" : "Arab Currencies"}
                  </div>
                  {filteredCurrencies
                    .filter((c) => arabCurrencies.some((ac) => ac.code === c.code))
                    .map((currency) => (
                      <CurrencyOption
                        key={currency.code}
                        currency={currency}
                        locale={locale}
                        isSelected={currency.code === value}
                        onSelect={handleSelect}
                      />
                    ))}
                </div>
              )}

              {/* International Currencies */}
              {!showArabOnly && (
                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    {locale === "ar" ? "العملات الدولية" : "International Currencies"}
                  </div>
                  {filteredCurrencies
                    .filter((c) => internationalCurrencies.some((ic) => ic.code === c.code))
                    .map((currency) => (
                      <CurrencyOption
                        key={currency.code}
                        currency={currency}
                        locale={locale}
                        isSelected={currency.code === value}
                        onSelect={handleSelect}
                      />
                    ))}
                </div>
              )}

              {/* If showing Arab only */}
              {showArabOnly &&
                filteredCurrencies.map((currency) => (
                  <CurrencyOption
                    key={currency.code}
                    currency={currency}
                    locale={locale}
                    isSelected={currency.code === value}
                    onSelect={handleSelect}
                  />
                ))}

              {/* No results */}
              {filteredCurrencies.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  {locale === "ar" ? "لا توجد نتائج" : "No results found"}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Currency Option Component
function CurrencyOption({
  currency,
  locale,
  isSelected,
  onSelect,
}: {
  currency: Currency;
  locale: string;
  isSelected: boolean;
  onSelect: (currency: Currency) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(currency)}
      className={`w-full px-3 py-2 rounded-md text-right hover:bg-gray-100 dark:hover:bg-[#15203c] transition-colors ${
        isSelected ? "bg-primary-50 dark:bg-primary-900/20" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">{currency.symbol}</span>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {locale === "ar" ? currency.nameAr : currency.nameEn}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {currency.code} - {currency.country}
            </div>
          </div>
        </div>
        {isSelected && (
          <svg
            className="w-5 h-5 text-primary-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    </button>
  );
}


