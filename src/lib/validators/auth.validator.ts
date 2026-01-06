import { z } from "zod";

// Phone number regex - يقبل أرقام الهواتف بصيغ مختلفة
const phoneRegex =
  /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;

// Strong Password regex - يجب أن يحتوي على:
// - حرف كبير واحد على الأقل
// - حرف صغير واحد على الأقل
// - رقم واحد على الأقل
// - رمز خاص واحد على الأقل
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-\[\]{};:'",.<>\/\\|`~])[A-Za-z\d@$!%*?&#^()_+=\-\[\]{};:'",.<>\/\\|`~]{8,}$/;

/**
 * Schema for user signup validation
 * - Email: must be a valid email format
 * - Password: minimum 8 characters, must contain letters and numbers
 * - Name: required, max 255 characters
 * - Phone Number: required, must match phone number format
 * - Confirm Password: must match password
 */
export const signupSchema = z
  .object({
    email: z
      .string({
        message: "البريد الإلكتروني مطلوب",
      })
      .email("صيغة البريد الإلكتروني غير صحيحة")
      .toLowerCase()
      .trim(),

    password: z
      .string({
        message: "كلمة المرور مطلوبة",
      })
      .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
      .regex(
        passwordRegex,
        "كلمة المرور يجب أن تحتوي على: حرف كبير، حرف صغير، رقم، ورمز خاص (@$!%*?&#...)"
      ),

    confirmPassword: z.string({
      message: "تأكيد كلمة المرور مطلوب",
    }),

    name: z
      .string({
        message: "الاسم مطلوب",
      })
      .trim()
      .min(1, "الاسم لا يمكن أن يكون فارغاً")
      .max(255, "الاسم طويل جداً"),

    phoneNumber: z
      .string({
        message: "رقم الهاتف مطلوب",
      })
      .trim()
      .regex(phoneRegex, "صيغة رقم الهاتف غير صحيحة")
      .min(8, "رقم الهاتف قصير جداً")
      .max(50, "رقم الهاتف طويل جداً"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمة المرور غير متطابقة",
    path: ["confirmPassword"],
  });

/**
 * Schema for login validation
 */
export const loginSchema = z.object({
  email: z
    .string({
      message: "البريد الإلكتروني مطلوب",
    })
    .email("صيغة البريد الإلكتروني غير صحيحة")
    .toLowerCase()
    .trim(),

  password: z
    .string({
      message: "كلمة المرور مطلوبة",
    })
    .min(1, "كلمة المرور مطلوبة"),
});

/**
 * Types inferred from schemas
 */
export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Helper function to get error message from Zod validation
 */
export const getZodErrorMessage = (error: z.ZodError): string => {
  return (error as any).errors?.[0]?.message || "خطأ في التحقق من البيانات";
};
