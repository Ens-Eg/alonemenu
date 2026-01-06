"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useUpdateProfile, useChangePassword } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import UserAvatar from "@/components/UserAvatar";
import toast from "react-hot-toast";

export default function EditProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Profile.edit");
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    country: "",
    dateOfBirth: "",
    gender: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [selectedPlan, setSelectedPlan] = useState<string>("free");
  const [upgradingPlan, setUpgradingPlan] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // React Query hooks
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword((field, message) => {
    if (field === "currentPassword" || field === "newPassword") {
      setPasswordErrors((prev) => ({ ...prev, [field]: message }));
    }
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/authentication/sign-in`);
    }
  }, [user, loading, router, locale]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
        country: user.country || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        gender: user.gender || "",
        address: user.address || "",
      });

      // Try to load profile image from localStorage (temporary solution)
      const savedImage = localStorage.getItem(`profileImage_${user.id}`);
      setProfileImage(savedImage || user.profileImage || null);
    }
  }, [user]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const processImageFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("imageTypeError"));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("imageSizeError"));
      return;
    }

    setUploadingImage(true);

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append("image", file);

      // TODO: Replace with actual API call
      // const response = await api.post("/user/profile/image", formData);
      // const newImageUrl = response.data.imageUrl;

      // Temporary: Create local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImageUrl = reader.result as string;
        setProfileImage(newImageUrl);

        // Save to localStorage (temporary until backend integration)
        if (user?.id) {
          localStorage.setItem(`profileImage_${user.id}`, newImageUrl);
        }

        // Update the user in React Query cache
        queryClient.setQueryData(["currentUser"], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            profileImage: newImageUrl,
          };
        });

        toast.success(t("imageUploadSuccess"));
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast.error(error.message || t("imageUploadError"));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImageFile(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processImageFile(file);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);

    // Remove from localStorage
    if (user?.id) {
      localStorage.removeItem(`profileImage_${user.id}`);
    }

    // Update the user in React Query cache
    queryClient.setQueryData(["currentUser"], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        profileImage: null,
      };
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success(t("imageRemoveSuccess"));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Send updated data to backend
    await updateProfile.mutateAsync({
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      country: formData.country,
      dateOfBirth: formData.dateOfBirth || null,
      gender: formData.gender || null,
      address: formData.address,
    });
  };

  // Validation functions for password fields
  const validateCurrentPassword = () => {
    if (!passwordData.currentPassword) {
      setPasswordErrors((prev) => ({ ...prev, currentPassword: "" }));
      return true;
    }
    if (passwordData.currentPassword.length < 1) {
      setPasswordErrors((prev) => ({
        ...prev,
        currentPassword: "كلمة المرور الحالية مطلوبة",
      }));
      return false;
    }
    setPasswordErrors((prev) => ({ ...prev, currentPassword: "" }));
    return true;
  };

  const validateNewPassword = () => {
    if (!passwordData.newPassword) {
      setPasswordErrors((prev) => ({ ...prev, newPassword: "" }));
      return true;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordErrors((prev) => ({
        ...prev,
        newPassword: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
      }));
      return false;
    }

    const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
    const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
    const hasNumber = /\d/.test(passwordData.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setPasswordErrors((prev) => ({
        ...prev,
        newPassword: "كلمة المرور يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام",
      }));
      return false;
    }

    setPasswordErrors((prev) => ({ ...prev, newPassword: "" }));
    return true;
  };

  const validateConfirmPassword = () => {
    if (!passwordData.confirmPassword) {
      setPasswordErrors((prev) => ({ ...prev, confirmPassword: "" }));
      return true;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors((prev) => ({
        ...prev,
        confirmPassword: "كلمة المرور غير متطابقة",
      }));
      return false;
    }

    setPasswordErrors((prev) => ({ ...prev, confirmPassword: "" }));
    return true;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const isCurrentValid = validateCurrentPassword();
    const isNewValid = validateNewPassword();
    const isConfirmValid = validateConfirmPassword();

    if (!isCurrentValid || !isNewValid || !isConfirmValid) {
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      // Reset form on success
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.log("Password change error:", error);
    }
  };

  const handleChangePlan = async () => {
    if (selectedPlan === "free") {
      return;
    }

    setUpgradingPlan(true);

    try {
      // TODO: Integrate with payment gateway
      // await api.post("/user/subscription/change", { plan: selectedPlan });
    } catch (error: any) {
      // Error handling
    } finally {
      setUpgradingPlan(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "1 Menu",
        "Up to 20 items",
        "Basic customization",
        "Ads supported",
      ],
    },
    {
      id: "starter",
      name: "Starter",
      price: "$9",
      period: "/month",
      features: [
        "3 Menus",
        "Unlimited items",
        "Advanced customization",
        "No ads",
        "Analytics",
      ],
      popular: true,
    },
    {
      id: "professional",
      name: "Professional",
      price: "$29",
      period: "/month",
      features: [
        "Unlimited menus",
        "Full customization",
        "Priority support",
        "Advanced analytics",
        "Custom domain",
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t("subtitle")}
            </p>
          </div>
          <button
            onClick={() => router.push(`/${locale}/menus/profile/user-profile`)}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors flex items-center gap-2"
          >
            <i className="material-symbols-outlined !text-[20px]">arrow_back</i>
            {t("backToProfile")}
          </button>
        </div>

        {/* Profile Image */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {t("profilePicture")}
          </h2>

          <div className="flex items-start gap-6">
            {/* Avatar Preview */}
            <div className="relative">
              <UserAvatar
                src={profileImage}
                name={user.name}
                size="xl"
                showBorder
                onClick={handleImageClick}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
              {uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* Upload Area */}
            <div className="flex-1">
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleImageClick}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                } ${uploadingImage ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex flex-col items-center">
                  {uploadingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {t("uploading")}...
                      </p>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-12 h-12 text-gray-400 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {isDragging ? t("dropImageHere") : t("dragDropOrClick")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t("supportedFormats")}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={uploadingImage}
              />

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleImageClick}
                  disabled={uploadingImage}
                  className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400"
                >
                  <i className="ri-upload-2-line mr-2"></i>
                  {uploadingImage ? t("uploading") : t("uploadPhoto")}
                </button>

                {profileImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={uploadingImage}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="ri-delete-bin-line mr-2"></i>
                    {t("remove")}
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-300 mt-3">
                {t("recommendedSize")}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white dark:bg-transparent rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {t("personalInformation")}
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex justify-between gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  {t("fullName")}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>

              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  {t("emailAddress")}
                </label>
                <input
                  type="email"
                  value={user.email}
                  className="form-input"
                  disabled
                />
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                  {t("emailCannotBeChanged")}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                {t("phoneNumber")}
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="form-input"
                placeholder="+966 50 123 4567"
              />
            </div>

            <div className="flex justify-between gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  {t("country")}
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="form-input"
                  placeholder={t("countryPlaceholder")}
                />
              </div>

              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  {t("dateOfBirth")}
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                  className="form-input"
                />
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  {t("gender")}
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="form-input"
                >
                  <option value="">{t("selectGender")}</option>
                  <option value="male">{t("male")}</option>
                  <option value="female">{t("female")}</option>
                  <option value="other">{t("other")}</option>
                </select>
              </div>

              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  {t("address")}
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="form-input"
                  placeholder={t("addressPlaceholder")}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400"
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? t("saving") : t("saveChanges")}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-transparent rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {t("changePassword")}
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("currentPassword")}
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => {
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  });
                  if (passwordErrors.currentPassword) {
                    setPasswordErrors((prev) => ({
                      ...prev,
                      currentPassword: "",
                    }));
                  }
                }}
                onBlur={validateCurrentPassword}
                className={`form-input ${
                  passwordErrors.currentPassword
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                required
              />
              {passwordErrors.currentPassword && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <i className="material-symbols-outlined !text-[16px]">
                    error
                  </i>
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("newPassword")}
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => {
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  });
                  if (passwordErrors.newPassword) {
                    setPasswordErrors((prev) => ({ ...prev, newPassword: "" }));
                  }
                }}
                onBlur={validateNewPassword}
                className={`form-input ${
                  passwordErrors.newPassword
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                minLength={8}
                required
              />
              {passwordErrors.newPassword ? (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <i className="material-symbols-outlined !text-[16px]">
                    error
                  </i>
                  {passwordErrors.newPassword}
                </p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                  {t("passwordMinLength")}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("confirmNewPassword")}
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => {
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  });
                  if (passwordErrors.confirmPassword) {
                    setPasswordErrors((prev) => ({
                      ...prev,
                      confirmPassword: "",
                    }));
                  }
                }}
                onBlur={validateConfirmPassword}
                className={`form-input ${
                  passwordErrors.confirmPassword
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                minLength={8}
                required
              />
              {passwordErrors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <i className="material-symbols-outlined !text-[16px]">
                    error
                  </i>
                  {passwordErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-danger-500 text-white hover:bg-danger-400"
                disabled={changePassword.isPending}
              >
                {changePassword.isPending
                  ? t("changing")
                  : t("changePasswordButton")}
              </button>
            </div>
          </form>
        </div>

        {/* Subscription Management */}
        <div
          id="subscription"
          className="bg-white dark:bg-transparent rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {t("manageSubscription")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                } ${plan.popular ? "ring-2 ring-blue-500" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <span className="bg-blue-500 text-white dark:text-white text-xs px-2 py-1 rounded-full mb-2 inline-block">
                    {t("mostPopular")}
                  </span>
                )}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {t(`plans.${plan.id}.name`)}
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-white">
                    {t(`plans.${plan.id}.period`)}
                  </span>
                </div>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start text-sm text-gray-600 dark:text-white"
                    >
                      <svg
                        className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t(`plans.${plan.id}.features.${index}`)}
                    </li>
                  ))}
                </ul>
                <input
                  type="radio"
                  name="plan"
                  value={plan.id}
                  checked={selectedPlan === plan.id}
                  onChange={() => setSelectedPlan(plan.id)}
                  className="w-4 h-4"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={handleChangePlan}
              className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400"
              disabled={upgradingPlan || selectedPlan === "free"}
            >
              {upgradingPlan ? t("processing") : t("upgradePlan")}
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-300 py-2">
              {selectedPlan === "free"
                ? t("onFreePlan")
                : t("paymentConfirmation")}
            </p>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>{t("note")}:</strong> {t("paymentGatewayNote")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
