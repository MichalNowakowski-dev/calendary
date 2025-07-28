import { z } from "zod";

// Enhanced booking validation schema
export const bookingSchema = z.object({
  customerName: z
    .string()
    .min(2, "Imię i nazwisko musi mieć co najmniej 2 znaki")
    .max(100, "Imię i nazwisko nie może przekraczać 100 znaków")
    .regex(
      /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s]+$/,
      "Imię i nazwisko może zawierać tylko litery"
    ),

  customerEmail: z
    .string()
    .min(1, "Adres email jest wymagany")
    .email("Nieprawidłowy format adresu email")
    .max(255, "Adres email jest zbyt długi"),

  customerPhone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true; // Optional field
      const phoneRegex =
        /^(\+48\s?)?(\d{3}\s?\d{3}\s?\d{3}|\d{9})$|^(\d{3}\s?\d{3}\s?\d{3})$/;
      return phoneRegex.test(val.replace(/\s/g, ""));
    }, "Nieprawidłowy format numeru telefonu (np. +48 123 456 789 lub 123 456 789)"),

  date: z
    .string()
    .min(1, "Wybierz datę wizyty")
    .refine((date) => {
      const selectedDate = new Date(date);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return selectedDate >= tomorrow;
    }, "Data wizyty musi być co najmniej jutro"),

  time: z.string().min(1, "Wybierz godzinę wizyty"),

  employeeId: z.string().optional(),

  notes: z
    .string()
    .max(500, "Notatki nie mogą przekraczać 500 znaków")
    .optional(),

  termsAccepted: z
    .boolean()
    .refine((val) => val === true, "Musisz zaakceptować regulamin"),

  privacyAccepted: z
    .boolean()
    .refine((val) => val === true, "Musisz zaakceptować politykę prywatności"),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

// Time slot validation
export const timeSlotSchema = z.object({
  date: z.string(),
  time: z.string(),
  employeeId: z.string().optional(),
});

export type TimeSlotData = z.infer<typeof timeSlotSchema>;
