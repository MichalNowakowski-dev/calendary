import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(1, "Imię i nazwisko jest wymagane."),
  email: z.string().email("Nieprawidłowy adres email."),
  message: z.string().min(1, "Wiadomość jest wymagana."),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
