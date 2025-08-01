"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { serverAuth } from "@/lib/auth/server";
import type { CompanyInsert, CompanyUpdate } from "@/lib/types/database";
import type {
  BusinessHoursInsert,
  BusinessHoursUpdate,
} from "@/lib/types/database";

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

export const createCompany = async (data: CompanyInsert) => {
  const supabase = createClient();
  const user = await serverAuth.getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: company, error } = await supabase
    .from("companies")
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  // Create company_user relationship
  const { error: userError } = await supabase.from("company_users").insert({
    company_id: company.id,
    user_id: user.id,
    role: "owner",
    status: "active",
  });

  if (userError) throw userError;

  return company;
};

export const updateCompany = async (id: string, data: CompanyUpdate) => {
  const supabase = createClient();
  const user = await serverAuth.getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if user has access to this company
  const { data: companyUser } = await supabase
    .from("company_users")
    .select("role")
    .eq("company_id", id)
    .eq("user_id", user.id)
    .single();

  if (!companyUser) {
    throw new Error("Access denied");
  }

  const { data: company, error } = await supabase
    .from("companies")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return company;
};

export const getCompanyBySlug = async (slug: string) => {
  const supabase = createClient();

  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;

  return company;
};

export const getUserCompany = async () => {
  const supabase = createClient();
  const user = await serverAuth.getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: companyUser, error } = await supabase
    .from("company_users")
    .select(
      `
      company:companies(*)
    `
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (error) throw error;

  return companyUser?.company;
};

// Business Hours Actions
export const getBusinessHours = async (companyId: string) => {
  const supabase = createClient();
  const user = await serverAuth.getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if user has access to this company
  const { data: companyUser } = await supabase
    .from("company_users")
    .select("role")
    .eq("company_id", companyId)
    .eq("user_id", user.id)
    .single();

  if (!companyUser) {
    throw new Error("Access denied");
  }

  const { data: businessHours, error } = await supabase
    .from("business_hours")
    .select("*")
    .eq("company_id", companyId)
    .order("day_of_week");

  if (error) throw error;

  return businessHours;
};

export const upsertBusinessHours = async (
  companyId: string,
  businessHours: BusinessHoursInsert[]
) => {
  const supabase = createClient();
  const user = await serverAuth.getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if user has access to this company
  const { data: companyUser } = await supabase
    .from("company_users")
    .select("role")
    .eq("company_id", companyId)
    .eq("user_id", user.id)
    .single();

  if (!companyUser) {
    throw new Error("Access denied");
  }

  // Delete existing business hours for this company
  const { error: deleteError } = await supabase
    .from("business_hours")
    .delete()
    .eq("company_id", companyId);

  if (deleteError) throw deleteError;

  // Insert new business hours
  const { data: newBusinessHours, error } = await supabase
    .from("business_hours")
    .insert(businessHours)
    .select();

  if (error) throw error;

  return newBusinessHours;
};

export const getPublicBusinessHours = async (companyId: string) => {
  const supabase = createClient();

  const { data: businessHours, error } = await supabase
    .from("business_hours")
    .select("*")
    .eq("company_id", companyId)
    .order("day_of_week");

  if (error) throw error;

  return businessHours;
};
