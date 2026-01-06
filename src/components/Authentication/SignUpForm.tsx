"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import {
  signupSchema,
  getZodErrorMessage,
} from "@/lib/validators/auth.validator";
import type { SignupFormData } from "@/lib/validators/auth.validator";
import { useAvailabilityCheck } from "@/hooks/useAvailabilityCheck";
import { FormInput } from "./FormInput";

/**
 * Sign Up Form Component
 * Features:
 * - Real-time email and phone availability checking
 * - Zod validation
 * - Password visibility toggle
 * - Loading states
 * - Accessibility support
 */
const SignUpForm: React.FC = () => {
  const locale = useLocale();
  const router = useRouter();
  const { signup } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Real-time availability checking with custom hooks
  const { isAvailable: emailAvailable, isChecking: checkingEmail } =
    useAvailabilityCheck({
      value: formData.email,
      type: "email",
    });

  const { isAvailable: phoneAvailable, isChecking: checkingPhone } =
    useAvailabilityCheck({
      value: formData.phoneNumber,
      type: "phone",
      minLength: 8,
    });

  // Update form field
  const updateFormField = useCallback(
    (field: keyof SignupFormData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Real-time password validation
        if (field === "password") {
          setPasswordValidation({
            minLength: value.length >= 8,
            hasUpperCase: /[A-Z]/.test(value),
            hasLowerCase: /[a-z]/.test(value),
            hasNumber: /\d/.test(value),
            hasSpecialChar: /[@$!%*?&#^()_+=\-\[\]{};:'",.<>\/\\|`~]/.test(
              value
            ),
          });
        }
      },
    []
  );

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate with Zod
    try {
      signupSchema.parse(formData);
    } catch (error: any) {
      const errorMessage = getZodErrorMessage(error);
      toast.error(errorMessage);
      return;
    }

    // Check availability before submitting
    if (emailAvailable === false) {
      toast.error("البريد الإلكتروني مستخدم بالفعل");
      return;
    }

    if (phoneAvailable === false) {
      toast.error("رقم الهاتف مستخدم بالفعل");
      return;
    }

    // Prevent submission while checking
    if (checkingEmail || checkingPhone) {
      toast.error("الرجاء الانتظار حتى يتم التحقق من البيانات");
      return;
    }

    setLoading(true);

    try {
      const success = await signup(
        formData.email,
        formData.password,
        formData.name,
        formData.phoneNumber
      );

      if (success) {
        toast.success("تم إنشاء الحساب بنجاح!");
        router.push(`/${locale}/authentication/confirm-email`);
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />

      <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] ">
        <div className="mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] items-center">
            {/* Image Section */}
            <div className="hidden lg:block xl:ltr:-mr-[25px] xl:rtl:-ml-[25px] 2xl:ltr:-mr-[45px] 2xl:rtl:-ml-[45px] rounded-[25px] order-2 lg:order-1">
              <Image
                src="/images/sign-up.jpg"
                alt="صورة التسجيل"
                className="rounded-[25px]"
                width={646}
                height={804}
                priority
              />
            </div>

            {/* Form Section */}
            <div className="xl:ltr:pl-[90px] xl:rtl:pr-[90px] 2xl:ltr:pl-[120px] 2xl:rtl:pr-[120px] order-1 lg:order-2">
              <div className="flex flex-row-reverse justify-between gap-4">
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

                {/* Title */}
                <div className="mb-[17px] md:mb-[25px]">
                  <h1 className="!font-semibold !text-[22px] md:!text-xl lg:!text-2xl !mb-[5px] md:!mb-[7px]">
                    إنشاء حساب جديد
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    أدخل بياناتك لإنشاء حساب جديد
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate>
                {/* Name Field */}
                <FormInput
                  label="الاسم الكامل"
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  value={formData.name}
                  onChange={updateFormField("name")}
                  disabled={loading}
                  required
                />

                {/* Email Field */}
                <FormInput
                  label="البريد الإلكتروني"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={updateFormField("email")}
                  disabled={loading}
                  required
                  isAvailable={emailAvailable}
                  isChecking={checkingEmail}
                  availableMessage="البريد الإلكتروني متاح ✓"
                  unavailableMessage="البريد الإلكتروني مستخدم بالفعل"
                />

                {/* Phone Field */}
                <FormInput
                  label="رقم الهاتف"
                  type="tel"
                  placeholder="+010 **** **** "
                  value={formData.phoneNumber}
                  onChange={updateFormField("phoneNumber")}
                  disabled={loading}
                  required
                  isAvailable={phoneAvailable}
                  isChecking={checkingPhone}
                  availableMessage="رقم الهاتف متاح ✓"
                  unavailableMessage="رقم الهاتف مستخدم بالفعل"
                />

                {/* Password Field */}
                <div className="mb-[15px]">
                  <FormInput
                    label="كلمة المرور"
                    type="password"
                    placeholder="8 أحرف (حرف كبير، صغير، رقم، رمز)"
                    value={formData.password}
                    onChange={updateFormField("password")}
                    disabled={loading}
                    required
                    minLength={8}
                    showToggle
                    onToggle={togglePasswordVisibility}
                    showValue={showPassword}
                  />

                  {/* Password Requirements Indicator */}
                  {formData.password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <i
                          className={`${
                            passwordValidation.minLength
                              ? "ri-checkbox-circle-fill text-green-500"
                              : "ri-close-circle-fill text-red-500"
                          }`}
                        ></i>
                        <span
                          className={
                            passwordValidation.minLength
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-600 dark:text-gray-400"
                          }
                        >
                          8 أحرف على الأقل
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <i
                          className={`${
                            passwordValidation.hasUpperCase
                              ? "ri-checkbox-circle-fill text-green-500"
                              : "ri-close-circle-fill text-red-500"
                          }`}
                        ></i>
                        <span
                          className={
                            passwordValidation.hasUpperCase
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-600 dark:text-gray-400"
                          }
                        >
                          حرف كبير (A-Z)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <i
                          className={`${
                            passwordValidation.hasLowerCase
                              ? "ri-checkbox-circle-fill text-green-500"
                              : "ri-close-circle-fill text-red-500"
                          }`}
                        ></i>
                        <span
                          className={
                            passwordValidation.hasLowerCase
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-600 dark:text-gray-400"
                          }
                        >
                          حرف صغير (a-z)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <i
                          className={`${
                            passwordValidation.hasNumber
                              ? "ri-checkbox-circle-fill text-green-500"
                              : "ri-close-circle-fill text-red-500"
                          }`}
                        ></i>
                        <span
                          className={
                            passwordValidation.hasNumber
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-600 dark:text-gray-400"
                          }
                        >
                          رقم واحد (0-9)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <i
                          className={`${
                            passwordValidation.hasSpecialChar
                              ? "ri-checkbox-circle-fill text-green-500"
                              : "ri-close-circle-fill text-red-500"
                          }`}
                        ></i>
                        <span
                          className={
                            passwordValidation.hasSpecialChar
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-600 dark:text-gray-400"
                          }
                        >
                          رمز خاص (@$!%*?&#...)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <FormInput
                  label="تأكيد كلمة المرور"
                  type="password"
                  placeholder="أعد إدخال كلمة المرور"
                  value={formData.confirmPassword}
                  onChange={updateFormField("confirmPassword")}
                  disabled={loading}
                  required
                  showToggle
                  onToggle={togglePasswordVisibility}
                  showValue={showPassword}
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  className="md:text-md block w-full text-center transition-all rounded-md font-medium my-[20px] md:my-[25px] py-[12px] px-[25px] text-white bg-primary-500 hover:bg-primary-400 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  disabled={loading || checkingEmail || checkingPhone}
                  aria-label="إنشاء حساب جديد"
                >
                  <span className="flex items-center justify-center gap-[5px]">
                    {loading ? (
                      <>
                        <i
                          className="ri-loader-4-line animate-spin"
                          aria-hidden="true"
                        ></i>
                        جاري إنشاء الحساب...
                      </>
                    ) : checkingEmail || checkingPhone ? (
                      <>
                        <i
                          className="ri-loader-4-line animate-spin"
                          aria-hidden="true"
                        ></i>
                        جاري التحقق...
                      </>
                    ) : (
                      <>
                        <i
                          className="material-symbols-outlined"
                          aria-hidden="true"
                        >
                          person_4
                        </i>
                        إنشاء حساب
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Sign In Link */}
              <p className="text-center text-gray-600 dark:text-gray-400">
                لديك حساب بالفعل؟{" "}
                <Link
                  href={`/${locale}/authentication/sign-in`}
                  className="text-primary-500 transition-all font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
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

export default SignUpForm;
