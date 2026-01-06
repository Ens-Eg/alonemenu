"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

const SignInForm: React.FC = () => {
  const locale = useLocale();
  const router = useRouter();
  const { login, user: contextUser } = useAuth();
  const t = useTranslations("SignIn");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error(t("fillAllFields"));
      return;
    }

    setLoading(true);
    console.log("📝 Form submitted, attempting login...");

    try {
      const result = await login(email, password);

      // Login successful
      toast.success("Login successful!");

      // Small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Navigate based on user role from login response
      if (result?.user?.role === "admin") {
        router.push(`/${locale}/admin`);
      } else {
        router.push(`/${locale}/menus`);
      }
    } catch (error) {
      console.error("❌ Login failed:", error);
      // Error already handled by React Query hook with toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px]">
        <div className="mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] items-center">
            <div className="xl:ltr:-mr-[25px] xl:rtl:-ml-[25px] 2xl:ltr:-mr-[45px] 2xl:rtl:-ml-[45px] rounded-[25px] order-2 lg:order-1">
              <Image
                src="/images/sign-in.jpg"
                alt="sign-in-image"
                className="rounded-[25px]"
                width={646}
                height={804}
              />
            </div>

            <div className=" xl:ltr:pl-[90px] xl:rtl:pr-[90px] 2xl:ltr:pl-[120px] 2xl:rtl:pr-[120px] order-1 lg:order-2">
              <div className="flex justify-between flex-row-reverse gap-2 items-center">
                {/* Logo */}
                <div className="mb-[17px] md:mb-[25px]">
                  <Image
                    src="/images/ENS-copy.png"
                    alt="شعار الموقع"
                    className="inline-block "
                    width={142}
                    height={38}
                  />
                </div>

                <div className="my-[17px] md:my-[25px]">
                  <h1 className="!font-semibold !text-[22px] md:!text-xl lg:!text-2xl !mb-[5px] md:!mb-[7px]">
                    {t("title")}
                  </h1>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-[15px] relative">
                  <label className="mb-[10px] md:mb-[12px] text-black dark:text-white font-medium block">
                    {t("email")}
                  </label>
                  <input
                    type="email"
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    placeholder={t("emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="mb-[15px] relative">
                  <label className="mb-[10px] md:mb-[12px] text-black dark:text-white font-medium block">
                    {t("password")}
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    placeholder={t("passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    className="absolute text-lg ltr:right-[20px] rtl:left-[20px] bottom-[12px] transition-all hover:text-primary-500"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={
                        showPassword ? "ri-eye-line" : "ri-eye-off-line"
                      }
                    ></i>
                  </button>
                </div>

                <Link
                  href={`/${locale}/authentication/forgot-password`}
                  className="inline-block text-primary-500 transition-all font-semibold hover:underline"
                >
                  {t("forgotPassword")}
                </Link>

                <button
                  type="submit"
                  className="md:text-md block w-full text-center transition-all rounded-md font-medium mt-[20px] md:mt-[25px] py-[12px] px-[25px] text-white bg-primary-500 hover:bg-primary-400 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  <span className="flex items-center justify-center gap-[5px]">
                    {loading ? (
                      <>
                        <i className="ri-loader-4-line animate-spin"></i>
                        {t("signingIn")}
                      </>
                    ) : (
                      <>
                        <i className="material-symbols-outlined">login</i>
                        {t("signInButton")}
                      </>
                    )}
                  </span>
                </button>
              </form>

              <p className="mt-[15px] md:mt-[20px]">
                {t("noAccount")}{" "}
                <Link
                  href={`/${locale}/authentication/sign-up`}
                  className="text-primary-500 transition-all font-semibold hover:underline"
                >
                  {t("createAccount")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInForm;
