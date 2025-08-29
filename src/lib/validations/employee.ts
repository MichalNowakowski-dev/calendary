import { z } from "zod";
import { Employee } from "../types/database";

// Common validations
const emailValidation = z
  .string()
  .min(1, "Email jest wymagany")
  .email("Nieprawidłowy format email");

const nameValidation = z
  .string()
  .min(1, "To pole jest wymagane")
  .min(2, "Minimum 2 znaki")
  .max(50, "Maksymalnie 50 znaków");

const phoneValidation = z
  .string()
  .optional()
  .or(z.literal(""))
  .refine(
    (val) => !val || /^[\+]?[0-9\s\-\(\)]{9,}$/.test(val),
    "Nieprawidłowy format numeru telefonu"
  );

// Employee form schema
export const employeeFormSchema = z.object({
  first_name: nameValidation,
  last_name: nameValidation,
  email: emailValidation,
  phone_number: phoneValidation,
  visible: z.boolean(),
  selectedServices: z
    .array(z.string())
    .min(1, "Wybierz co najmniej jedną usługę"),
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;

// Server action result type
export type EmployeeActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  employee?: Employee;
};
