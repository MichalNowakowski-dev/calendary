"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { revalidatePath } from "next/cache";

const translateAuthError = (errorMessage: string): string => {
  const errorTranslations: Record<string, string> = {
    "Invalid login credentials": "Nieprawidłowe dane logowania",
    "Email not confirmed": "Email nie został potwierdzony",
    "Too many requests": "Zbyt wiele prób logowania",
    "User not found": "Użytkownik nie został znaleziony",
    "Invalid email": "Nieprawidłowy adres email",
    "Invalid password": "Nieprawidłowe hasło",
    "Email already registered": "Email jest już zarejestrowany",
    "Password too short": "Hasło jest za krótkie",
    "Network error": "Błąd połączenia sieciowego",
    "Server error": "Błąd serwera",
    "Authentication failed": "Uwierzytelnienie nie powiodło się",
    "Account locked": "Konto zostało zablokowane",
    "Account disabled": "Konto zostało wyłączone",
    "Session expired": "Sesja wygasła",
    "Access denied": "Dostęp zabroniony",
  };

  // Check for exact matches first
  if (errorTranslations[errorMessage]) {
    return errorTranslations[errorMessage];
  }

  // Check for partial matches (case insensitive)
  const lowerErrorMessage = errorMessage.toLowerCase();
  for (const [englishError, polishError] of Object.entries(errorTranslations)) {
    if (lowerErrorMessage.includes(englishError.toLowerCase())) {
      return polishError;
    }
  }

  // Return default message if no translation found
  return "Wystąpił błąd podczas logowania";
};

export async function loginAction(
  prevState: {
    message: string;
    errors?: Record<string, string[]>;
    redirectTo?: string;
  },
  formData: FormData
) {
  // Validate form data
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      message: "Wystąpił błąd walidacji",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;
  const redirectTo = formData.get("redirectTo") as string | null;

  try {
    const supabase = createClient();
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        message: translateAuthError(error.message),
        errors: {},
      };
    }

    if (authData.user) {
      const userRole = authData.user.user_metadata?.role;

      // Revalidate relevant paths
      revalidatePath("/");
      revalidatePath(`/${userRole}`);

      // Return success with redirect information
      return {
        message: "",
        errors: {},
        redirectTo: redirectTo || `/${userRole}`,
      };
    }

    return {
      message: "Logowanie nie powiodło się",
      errors: {},
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      message: translateAuthError(
        (error as { message?: string })?.message || "Nieznany błąd"
      ),
      errors: {},
    };
  }
}
