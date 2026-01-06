"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import api from "@/lib/api";
import toast, { Toaster } from 'react-hot-toast';

const ForgotPasswordForm: React.FC = () => {
  const locale = useLocale();
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('يرجى إدخال البريد الإلكتروني');
      return;
    }
    
    setLoading(true);
    
    const result = await api.forgotPassword(email);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك');
      setSuccess(true);
    }
    
    setLoading(false);
  };

  return (
    <>
      <Toaster position="top-center" />
      
      <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] md:py-[80px] lg:py-[135px]">
        <div className="mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] items-center">
            <div className="xl:ltr:-mr-[25px] xl:rtl:-ml-[25px] 2xl:ltr:-mr-[45px] 2xl:rtl:-ml-[45px] rounded-[25px] order-2 lg:order-1">
              <Image
                src="/images/forgot-password.jpg"
                alt="forgot-password"
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
                  نسيت كلمة المرور؟
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {success 
                    ? "تم إرسال الرابط! تحقق من بريدك الإلكتروني"
                    : "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين"
                  }
                </p>
              </div>

              {!success ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-[15px] relative">
                    <label className="mb-[10px] md:mb-[12px] text-black dark:text-white font-medium block">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                      placeholder="example@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <i className="ri-mail-send-line"></i>
                          إرسال رابط إعادة التعيين
                        </>
                      )}
                    </span>
                  </button>
                </form>
              ) : (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <i className="ri-checkbox-circle-line text-2xl text-green-600 dark:text-green-400"></i>
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                        تم الإرسال بنجاح!
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        تحقق من صندوق الوارد واضغط على الرابط لإعادة تعيين كلمة المرور
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <p className="mt-[15px] md:mt-[20px] text-center">
                تذكرت كلمة المرور؟{" "}
                <Link
                  href={`/${locale}/authentication/sign-in`}
                  className="text-primary-500 transition-all font-semibold hover:underline"
                >
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordForm;
