import { z } from "zod";

// Company editing schema (separate from registration)
export const companyEditSchema = z.object({
  name: z.string().min(1, "Nazwa firmy jest wymagana"),
  slug: z
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
});

export type CompanyEditFormData = z.infer<typeof companyEditSchema>;

// Industry options for the form
export const INDUSTRIES = [
  { value: "automotive", label: "Warsztat samochodowy" },
  { value: "beauty", label: "Salon piękności" },
  { value: "barbershop", label: "Fryzjer/Barber" },
  { value: "massage", label: "Masaż" },
  { value: "spa", label: "SPA & Wellness" },
  { value: "medical", label: "Medycyna estetyczna" },
  { value: "fitness", label: "Fitness/Trening personalny" },
  { value: "education", label: "Edukacja/Korepetycje" },
  { value: "veterinary", label: "Weterynarz" },
  { value: "other", label: "Inne" },
] as const;
