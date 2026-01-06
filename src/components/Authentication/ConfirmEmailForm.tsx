"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import toast, { Toaster } from 'react-hot-toast';

const ConfirmEmailForm: React.FC = () => {
  const locale = useLocale();
  const searchParams = useSearchParams();
  
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  
  useEffect(() => {
    const tokenParam = searchParams?.get('token');
    const emailParam = searchParams?.get('email');
    
    if (tokenParam) {
      setToken(tokenParam);
      verifyEmail(tokenParam);
    }
    
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);
  
  const verifyEmail = async (verificationToken: string) => {
    setLoading(true);
    
    const result = await api.verifyEmail(verificationToken);
    
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
    } else {
      setVerified(true);
      toast.success('تم التحقق من البريد بنجاح!');
    }
    
    setLoading(false);
  };
  
  const handleResend = async () => {
    if (!email) {
      toast.error('يرجى إدخال البريد الإلكتروني');
      return;
    }
    
    setResendLoading(true);
    
    const result = await api.resendVerification(email);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('تم إرسال رابط التحقق مرة أخرى');
    }
    
    setResendLoading(false);
  };

  // Still loading
  if (token && loading) {
    return (
      <>
        <Toaster position="top-center" />
        <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] md:py-[80px] lg:py-[135px]">
          <div className="mx-auto px-[12.5px] md:max-w-[720px]">
            <div className="text-center py-12">
              <i className="ri-loader-4-line animate-spin text-6xl text-primary-500 mb-4"></i>
              <h2 className="text-2xl font-semibold mb-2">جاري التحقق...</h2>
              <p className="text-gray-500">يرجى الانتظار</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Verification successful
  if (verified) {
    return (
      <>
        <Toaster position="top-center" />
        <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] md:py-[80px] lg:py-[135px]">
          <div className="mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] items-center">
              <div className="xl:ltr:-mr-[25px] xl:rtl:-ml-[25px] 2xl:ltr:-mr-[45px] 2xl:rtl:-ml-[45px] rounded-[25px] order-2 lg:order-1">
                <Image
                  src="/images/confirm-email.jpg"
                  alt="email-verified"
                  className="rounded-[25px]"
                  width={646}
                  height={804}
                />
              </div>

              <div className="xl:ltr:pl-[90px] xl:rtl:pr-[90px] 2xl:ltr:pl-[120px] 2xl:rtl:pr-[120px] order-1 lg:order-2">
                <div className="text-center lg:text-right">
                  <div className="inline-block p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
                    <i className="ri-checkbox-circle-line text-6xl text-green-600 dark:text-green-400"></i>
                  </div>
                  
                  <h1 className="!font-semibold !text-[22px] md:!text-xl lg:!text-2xl mb-4">
                    تم التحقق بنجاح!
                  </h1>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    تم التحقق من بريدك الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول والبدء في استخدام التطبيق.
                  </p>
                  
                  <Link
                    href={`/${locale}/authentication/sign-in`}
                    className="inline-block px-8 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-400 transition-all font-semibold"
                  >
                    تسجيل الدخول
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Verification failed or no token
  return (
    <>
      <Toaster position="top-center" />
      
      <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] md:py-[80px] lg:py-[135px]">
        <div className="mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] items-center">
            <div className="xl:ltr:-mr-[25px] xl:rtl:-ml-[25px] 2xl:ltr:-mr-[45px] 2xl:rtl:-ml-[45px] rounded-[25px] order-2 lg:order-1">
              <Image
                src="/images/confirm-email.jpg"
                alt="confirm-email"
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
                  التحقق من البريد الإلكتروني
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {error 
                    ? "حدث خطأ في التحقق. يرجى طلب رابط جديد."
                    : "تحقق من بريدك الإلكتروني واضغط على الرابط"}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <i className="ri-error-warning-line text-2xl text-red-600 dark:text-red-400"></i>
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                        فشل التحقق
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-6 mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <i className="ri-mail-line text-3xl text-blue-600 dark:text-blue-400"></i>
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      لم تستلم البريد؟
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                      تحقق من مجلد الرسائل غير المرغوب فيها، أو يمكنك طلب إرسال الرابط مرة أخرى
                    </p>
                    
                    <div className="flex flex-col gap-3">
                      <input
                        type="email"
                        className="h-[45px] rounded-md text-black dark:text-white border border-blue-200 dark:border-blue-800 bg-white dark:bg-[#0c1427] px-[15px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        placeholder="أدخل بريدك الإلكتروني"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={resendLoading}
                      />
                      
                      <button
                        onClick={handleResend}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all disabled:bg-gray-400"
                        disabled={resendLoading}
                      >
                        {resendLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <i className="ri-loader-4-line animate-spin"></i>
                            جاري الإرسال...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <i className="ri-mail-send-line"></i>
                            إعادة إرسال الرابط
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-center">
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

export default ConfirmEmailForm;

