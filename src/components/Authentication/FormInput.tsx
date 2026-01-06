import React from "react";

interface FormInputProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  minLength?: number;
  className?: string;
  isAvailable?: boolean | null;
  isChecking?: boolean;
  availableMessage?: string;
  unavailableMessage?: string;
  showToggle?: boolean;
  onToggle?: () => void;
  showValue?: boolean;
}

/**
 * Reusable form input component with validation feedback
 */
export const FormInput: React.FC<FormInputProps> = ({
  label,
  type,
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  minLength,
  isAvailable = null,
  isChecking = false,
  availableMessage,
  unavailableMessage,
  showToggle = false,
  onToggle,
  showValue = false,
}) => {
  // Dynamic border color based on availability
  const getBorderColor = () => {
    if (isAvailable === false) return "border-red-500";
    if (isAvailable === true) return "border-green-500";
    return "border-gray-200 dark:border-[#172036]";
  };

  return (
    <div className="mb-[15px] relative">
      <label
        htmlFor={label}
        className="mb-[10px] md:mb-[12px] text-black dark:text-white font-medium block"
      >
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>

      <input
        id={label}
        type={showToggle && showValue ? "text" : type}
        className={`h-[55px] rounded-md text-black dark:text-white border ${getBorderColor()} bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500 ${
          showToggle ? "ltr:pr-[50px] rtl:pl-[50px]" : ""
        }`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        minLength={minLength}
        aria-label={label}
        aria-required={required}
        aria-invalid={isAvailable === false}
        autoComplete={
          type === "email" ? "email" : type === "tel" ? "tel" : "off"
        }
      />

      {/* Toggle button for password fields */}
      {showToggle && onToggle && (
        <button
          className="absolute text-lg ltr:right-[20px] rtl:left-[20px] top-[48px] transition-all hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
          type="button"
          onClick={onToggle}
          aria-label={showValue ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        >
          <i className={showValue ? "ri-eye-line" : "ri-eye-off-line"}></i>
        </button>
      )}

      {/* Loading indicator */}
      {isChecking && (
        <div
          className="absolute ltr:right-[15px] rtl:left-[15px] top-[48px] text-gray-400"
          aria-label="جاري التحقق..."
        >
          <i className="ri-loader-4-line animate-spin"></i>
        </div>
      )}

      {/* Validation messages */}
      {!isChecking && isAvailable === false && unavailableMessage && (
        <p className="text-red-500 text-sm mt-1" role="alert">
          {unavailableMessage}
        </p>
      )}

      {!isChecking && isAvailable === true && availableMessage && (
        <p className="text-green-500 text-sm mt-1" role="status">
          {availableMessage}
        </p>
      )}
    </div>
  );
};
