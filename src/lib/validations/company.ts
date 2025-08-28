import { z } from "zod";

export const companyEditSchema = z.object({
  name: z.string().min(2, "Nazwa firmy musi mieć co najmniej 2 znaki"),
  slug: z.string().min(2, "Slug musi mieć co najmniej 2 znaki"),
  industry: z.string().min(1, "Wybierz branżę"),
  phone: z.string().optional(),
  address_street: z.string().optional(),
  address_city: z.string().optional(),
  description: z.string().optional(),
});

export type CompanyEditFormData = z.infer<typeof companyEditSchema>;

export const INDUSTRIES = [
  { value: "automotive", label: "Motoryzacja" },
  { value: "beauty", label: "Uroda" },
  { value: "barbershop", label: "Fryzjer męski" },
  { value: "massage", label: "Masaż" },
  { value: "spa", label: "Spa" },
  { value: "medical", label: "Medycyna" },
  { value: "fitness", label: "Fitness" },
  { value: "education", label: "Edukacja" },
  { value: "veterinary", label: "Weterynaria" },
  { value: "other", label: "Inne" },
] as const;

export const PLANS = [
  { value: "basic", label: "Podstawowy" },
  { value: "pro", label: "Profesjonalny" },
  { value: "enterprise", label: "Enterprise" },
] as const;

export const businessHoursSchema = z.object({
  day_of_week: z.number().min(0).max(6),
  open_time: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Nieprawidłowy format czasu (HH:MM)"
    )
    .optional()
    .nullable(),
  close_time: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Nieprawidłowy format czasu (HH:MM)"
    )
    .optional()
    .nullable(),
  is_open: z.boolean(),
});

export const businessHoursFormSchema = z.object({
  business_hours: z
    .array(businessHoursSchema)
    .length(7, "Musisz ustawić godziny dla wszystkich dni tygodnia"),
});

export type BusinessHoursFormData = z.infer<typeof businessHoursFormSchema>;
export type BusinessHoursData = z.infer<typeof businessHoursSchema>;

export const DAYS_OF_WEEK = [
  { value: 0, label: "Niedziela" },
  { value: 1, label: "Poniedziałek" },
  { value: 2, label: "Wtorek" },
  { value: 3, label: "Środa" },
  { value: 4, label: "Czwartek" },
  { value: 5, label: "Piątek" },
  { value: 6, label: "Sobota" },
] as const;
