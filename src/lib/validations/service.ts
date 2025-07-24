import { z } from "zod";

// Service validation schema
export const serviceSchema = z.object({
  name: z.string().min(1, "Nazwa usługi jest wymagana"),
  description: z.string().optional().or(z.literal("")),
  duration_minutes: z
    .number()
    .min(15, "Czas trwania musi wynosić co najmniej 15 minut")
    .max(480, "Czas trwania nie może przekraczać 8 godzin"),
  price: z
    .number()
    .min(0, "Cena nie może być ujemna")
    .max(99999, "Cena jest zbyt wysoka"),
  active: z.boolean(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
