import { z } from "zod";

// Common validations
const emailValidation = z.email("Nieprawidłowy format email");

const passwordValidation = z
  .string()
  .min(6, "Hasło musi mieć co najmniej 6 znaków")
  .min(1, "Hasło jest wymagane");

const phoneValidation = z.string().optional().or(z.literal(""));

const nameValidation = z
  .string()
  .min(1, "To pole jest wymagane")
  .min(2, "Minimum 2 znaki");

// Login form schema
export const loginSchema = z.object({
  email: emailValidation,
  password: z.string().min(1, "Hasło jest wymagane"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Customer registration schema
export const customerRegistrationSchema = z
  .object({
    firstName: nameValidation,
    lastName: nameValidation,
    email: emailValidation,
    phone: phoneValidation,
    password: passwordValidation,
    confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie pasują do siebie",
    path: ["confirmPassword"],
  });

export type CustomerRegistrationFormData = z.infer<
  typeof customerRegistrationSchema
>;

// Company owner registration schema
export const companyOwnerRegistrationSchema = z
  .object({
    // Personal information
    firstName: nameValidation,
    lastName: nameValidation,

    // Account information
    email: emailValidation,
    password: passwordValidation,
    confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),

    // Company information
    companyName: z.string().min(1, "Nazwa firmy jest wymagana"),
    companySlug: z
      .string()
      .min(1, "Adres strony jest wymagany")
      .regex(
        /^[a-z0-9-]+$/,
        "Adres może zawierać tylko małe litery, cyfry i myślniki"
      )
      .min(3, "Adres musi mieć co najmniej 3 znaki"),
    industry: z.string().min(1, "Branża jest wymagana"),
    phone: z.string().min(1, "Telefon jest wymagany"),
    address_street: z.string().optional().or(z.literal("")),
    address_city: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie pasują do siebie",
    path: ["confirmPassword"],
  });

export type CompanyOwnerRegistrationFormData = z.infer<
  typeof companyOwnerRegistrationSchema
>;

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailValidation,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
