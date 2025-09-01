import { z } from "zod";

// Common action state type used across all action files
export type ActionState<T = unknown> = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: T;
};

// Specific typed action states for better type safety
export type CompanyActionState = ActionState<{
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address_street: string | null;
  address_city: string | null;
  phone: string | null;
  industry: string;
  created_at: string;
}>;

export type BusinessHoursActionState = ActionState<
  Array<{
    id: string;
    company_id: string;
    day_of_week: number;
    open_time: string | null;
    close_time: string | null;
    is_open: boolean;
    created_at: string;
    updated_at: string;
  }>
>;

// Form data validation result type
export type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      errors: Record<string, string[]>;
    };

// Validation schemas
export const companyFormDataSchema = z.object({
  name: z
    .string()
    .min(1, "Nazwa firmy jest wymagana")
    .max(100, "Nazwa firmy jest za długa"),
  slug: z
    .string()
    .min(1, "Slug jest wymagany")
    .max(50, "Slug jest za długi")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug może zawierać tylko małe litery, cyfry i myślniki"
    ),
  description: z.string().nullable(),
  address_street: z.string().nullable(),
  address_city: z.string().nullable(),
  phone: z
    .string()
    .nullable()
    .refine((val) => {
      if (val === null || val === "") return true;
      return /^[+]?[\d\s\-()]+$/.test(val);
    }, "Nieprawidłowy format numeru telefonu"),
  industry: z.string().min(1, "Branża jest wymagana"),
});

export const businessHoursFormDataSchema = z.object({
  company_id: z.string().min(1, "ID firmy jest wymagane"),
  day_of_week: z.coerce
    .number()
    .min(0)
    .max(6, "Dzień tygodnia musi być między 0 a 6"),
  open_time: z
    .string()
    .nullable()
    .refine((val) => {
      if (val === null || val === "") return true;
      return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val);
    }, "Nieprawidłowy format czasu otwarcia (HH:MM)"),
  close_time: z
    .string()
    .nullable()
    .refine((val) => {
      if (val === null || val === "") return true;
      return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val);
    }, "Nieprawidłowy format czasu zamknięcia (HH:MM)"),
  is_open: z.boolean(),
});

export type CompanyFormData = z.infer<typeof companyFormDataSchema>;
export type BusinessHoursFormData = z.infer<typeof businessHoursFormDataSchema>;

// Helper function to validate FormData
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  formData: FormData,
  fieldMapping: Record<keyof T, string>
): ValidationResult<T> {
  try {
    const data: Record<string, unknown> = {};

    for (const [key, formFieldName] of Object.entries(fieldMapping)) {
      const value = formData.get(formFieldName as string);
      if (value === null) {
        data[key] = null;
      } else if (typeof value === "string") {
        data[key] = value === "" ? null : value;
      } else {
        data[key] = value;
      }
    }

    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.issues.forEach((err) => {
        const path = err.path.join(".");
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return {
      success: false,
      errors: {
        _form: ["Wystąpił błąd podczas walidacji danych"],
      },
    };
  }
}
