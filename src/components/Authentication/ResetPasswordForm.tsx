"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import api from "@/lib/api";
import toast, { Toaster } from 'react-hot-toast';

const ResetPasswordForm: React.FC = () => {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    const tokenParam = searchParams?.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('رابط غير صالح');
      return;
    }
    
    if (!password || !confirmPassword) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    
    if (password.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('كلمة المرور غير متطابقة');
      return;
    }
    
    setLoading(true);
    
    const result = await api.resetPassword(token, password);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('تم تغيير كلمة المرور بنجاح');
      setSuccess(true);
      
      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        router.push(`/${locale}/authentication/sign-in`);
      }, 2000);
    }
    
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] md:py-[80px] lg:py-[135px]">
        <div className="mx-auto px-[12.5px] md:max-w-[720px]">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-6 text-center">
            <i className="ri-error-warning-line text-5xl text-red-600 dark:text-red-400 mb-4"></i>
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
              رابط غير صالح
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-4">
              الرابط منتهي الصلاحية أو غير صحيح
            </p>
            <Link
              href={`/${locale}/authentication/forgot-password`}
              className="inline-block px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-400"
            >
              طلب رابط جديد
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      
      <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] md:py-[80px] lg:py-[135px]">
        <div className="mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] items-center">
            <div className="xl:ltr:-mr-[25px] xl:rtl:-ml-[25px] 2xl:ltr:-mr-[45px] 2xl:rtl:-ml-[45px] rounded-[25px] order-2 lg:order-1">
              <Image
                src="/images/reset-password.jpg"
                alt="reset-password"
                className="rounded-[25px]"
                width={646}
                height={804}
              />
            </div>

            <div className="xl:ltr:pl-[90px] xl:rtl:pr-[90px] 2xl:ltr:pl-[120px] 2xl:rtl:pr-[120px] order-1 lg:order-2">
              <Image
                src="/images/logo-big.svg"
                alt="logo"
                className="inline-block dark:hidden"
                width={142}
                height={38}
              />
              <Image
                src="/images/white-logo-big.svg"
                alt="logo"
                className="hidden dark:inline-block"
                width={142}
                height={38}
              />

              <div className="my-[17px] md:my-[25px]">
                <h1 className="!font-semibold !text-[22px] md:!text-xl lg:!text-2xl !mb-[5px] md:!mb-[7px]">
                  {success ? "تم التغيير بنجاح!" : "إعادة تعيين كلمة المرور"}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {success 
                    ? "سيتم تحويلك لصفحة تسجيل الدخول..."
                    : "أدخل كلمة المرور الجديدة"
                  }
                </p>
              </div>

              {!success ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-[15px] relative">
                    <label className="mb-[10px] md:mb-[12px] text-black dark:text-white font-medium block">
                      كلمة المرور الجديدة
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                      placeholder="8 أحرف على الأقل"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                      minLength={8}
                    />
                    <button
                      className="absolute text-lg ltr:right-[20px] rtl:left-[20px] bottom-[12px] transition-all hover:text-primary-500"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={showPassword ? "ri-eye-line" : "ri-eye-off-line"}></i>
                    </button>
                  </div>

                  <div className="mb-[15px] relative">
                    <label className="mb-[10px] md:mb-[12px] text-black dark:text-white font-medium block">
                      تأكيد كلمة المرور
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                      placeholder="أعد إدخال كلمة المرور"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="md:text-md block w-full text-center transition-all rounded-md font-medium mt-[20px] md:mt-[25px] py-[12px] px-[25px] text-white bg-primary-500 hover:bg-primary-400 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    <span className="flex items-center justify-center gap-[5px]">
                      {loading ? (
                        <>
                          <i className="ri-loader-4-line animate-spin"></i>
                          جاري التغيير...
                        </>
                      ) : (
                        <>
                          <i className="ri-lock-password-line"></i>
                          تغيير كلمة المرور
                        </>
                      )}
                    </span>
                  </button>
                </form>
              ) : (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-6 text-center">
                  <i className="ri-checkbox-circle-line text-5xl text-green-600 dark:text-green-400 mb-4"></i>
                  <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
                    تم تغيير كلمة المرور
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة
                  </p>
                </div>
              )}

              <p className="mt-[15px] md:mt-[20px] text-center">
                <Link
                  href={`/${locale}/authentication/sign-in`}
                  className="text-primary-500 transition-all font-semibold hover:underline"
                >
                  العودة لتسجيل الدخول
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordForm;
