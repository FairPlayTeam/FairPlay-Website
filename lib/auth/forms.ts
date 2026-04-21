import { z } from "zod";

export const PASSWORD_RULES = [
  { label: "At least 6 characters", test: (password: string) => password.length >= 6 },
  { label: "At least one uppercase letter", test: (password: string) => /[A-Z]/.test(password) },
  { label: "At least one number", test: (password: string) => /[0-9]/.test(password) },
  {
    label: "At least one special character (!@#$...)",
    test: (password: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  },
] as const;

export const loginFormSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email or username is required")
    .transform((value) => (value.includes("@") ? value.toLowerCase() : value)),
  password: z.string().min(1, "Password is required"),
});

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .superRefine((value, ctx) => {
    for (const rule of PASSWORD_RULES) {
      if (!rule.test(value)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: rule.label });
      }
    }
  });

export const forgotPasswordFormSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email")
    .transform((value) => value.toLowerCase()),
});

export const registerFormSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("Invalid email")
      .transform((value) => value.toLowerCase()),
    username: z
      .string()
      .trim()
      .min(3, "Username is too short")
      .transform((v) => v.toLowerCase()),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const resetPasswordFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
