"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { serviceSchema } from "@/lib/validations/service";

// Server-side validation schema (same as client-side for consistency)
const serverServiceSchema = serviceSchema;

// Action state type
export type ServiceActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// Create service action
export async function createServiceAction(
  prevState: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  try {
    // Get current user and company
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "Nie jesteś zalogowany",
      };
    }

    // Get user's company
    const { data: companyUsers, error: companyError } = await supabase
      .from("company_users")
      .select("company_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (companyError || !companyUsers) {
      return {
        success: false,
        message: "Nie znaleziono firmy",
      };
    }

    // Parse and validate form data
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      duration_minutes: Number(formData.get("duration_minutes")),
      price: Number(formData.get("price")),
      active: formData.get("active") === "on",
    };

    const validationResult = serverServiceSchema.safeParse(rawData);

    if (!validationResult.success) {
      const errors: Record<string, string[]> = {};
      validationResult.error.issues.forEach((error: z.core.$ZodIssue) => {
        const field = error.path.join(".");
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(error.message);
      });

      return {
        success: false,
        message: "Błąd walidacji danych",
        errors,
      };
    }

    const validatedData = validationResult.data;

    // Create service
    const { error: createError } = await supabase.from("services").insert({
      company_id: companyUsers.company_id,
      name: validatedData.name,
      description: validatedData.description || null,
      duration_minutes: validatedData.duration_minutes,
      price: validatedData.price,
      active: validatedData.active,
    });

    if (createError) {
      console.error("Error creating service:", createError);
      return {
        success: false,
        message: `Błąd podczas tworzenia usługi: ${createError.message}`,
      };
    }

    // Revalidate the services page
    revalidatePath("/dashboard/services");

    return {
      success: true,
      message: "Usługa została utworzona pomyślnie",
    };
  } catch (error) {
    console.error("Unexpected error in createServiceAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}

// Update service action
export async function updateServiceAction(
  prevState: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  try {
    // Get current user
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "Nie jesteś zalogowany",
      };
    }

    // Get service ID from form data
    const serviceId = formData.get("serviceId") as string;
    if (!serviceId) {
      return {
        success: false,
        message: "Brak ID usługi",
      };
    }

    // Parse and validate form data
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      duration_minutes: Number(formData.get("duration_minutes")),
      price: Number(formData.get("price")),
      active: formData.get("active") === "on",
    };

    const validationResult = serverServiceSchema.safeParse(rawData);

    if (!validationResult.success) {
      const errors: Record<string, string[]> = {};
      validationResult.error.issues.forEach((error: z.ZodIssue) => {
        const field = error.path.join(".");
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(error.message);
      });

      return {
        success: false,
        message: "Błąd walidacji danych",
        errors,
      };
    }

    const validatedData = validationResult.data;

    // Update service
    const { error: updateError } = await supabase
      .from("services")
      .update({
        name: validatedData.name,
        description: validatedData.description || null,
        duration_minutes: validatedData.duration_minutes,
        price: validatedData.price,
        active: validatedData.active,
      })
      .eq("id", serviceId);

    if (updateError) {
      console.error("Error updating service:", updateError);
      return {
        success: false,
        message: `Błąd podczas aktualizacji usługi: ${updateError.message}`,
      };
    }

    // Revalidate the services page
    revalidatePath("/dashboard/services");

    return {
      success: true,
      message: "Usługa została zaktualizowana pomyślnie",
    };
  } catch (error) {
    console.error("Unexpected error in updateServiceAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}
