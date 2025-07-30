"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

import type { ActionState } from "./types";

export async function createCompanyAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = createClient();

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

    const companyData = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      address_street: formData.get("address_street") as string,
      address_city: formData.get("address_city") as string,
      phone: formData.get("phone") as string,
      industry: formData.get("industry") as string,
    };

    // Create company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert(companyData)
      .select()
      .single();

    if (companyError) {
      return {
        success: false,
        message: `Błąd podczas tworzenia firmy: ${companyError.message}`,
      };
    }

    // Link user to company as owner
    const { error: linkError } = await supabase.from("company_users").insert({
      company_id: company.id,
      user_id: user.id,
      role: "owner",
      status: "active",
    });

    if (linkError) {
      return {
        success: false,
        message: `Błąd podczas łączenia użytkownika z firmą: ${linkError.message}`,
      };
    }

    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Firma została utworzona pomyślnie",
      data: company,
    };
  } catch (error) {
    console.error("Error in createCompanyAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}

export async function updateCompanyAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = createClient();

    const companyId = formData.get("companyId") as string;
    if (!companyId) {
      return {
        success: false,
        message: "Brak ID firmy",
      };
    }

    const updates = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      address_street: formData.get("address_street") as string,
      address_city: formData.get("address_city") as string,
      phone: formData.get("phone") as string,
      industry: formData.get("industry") as string,
    };

    const { data, error } = await supabase
      .from("companies")
      .update(updates)
      .eq("id", companyId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: `Błąd podczas aktualizacji firmy: ${error.message}`,
      };
    }

    revalidatePath("/dashboard/settings");
    return {
      success: true,
      message: "Firma została zaktualizowana pomyślnie",
      data,
    };
  } catch (error) {
    console.error("Error in updateCompanyAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}
