"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { serverAuth } from "@/lib/auth/server";
import type {
  Company,
  CompanyInsert,
  CompanyUpdate,
  BusinessHours,
  BusinessHoursInsert,
  BusinessHoursUpdate,
  CompanyWithSubscription,
} from "@/lib/types/database";

import type {
  ActionState,
  CompanyActionState,
  BusinessHoursActionState,
  CompanyFormData,
  BusinessHoursFormData,
} from "./types";
import { validateFormData, companyFormDataSchema } from "./types";

export const getAllCompanies = async (): Promise<Company[]> => {
  const supabase = await createClient();
  const { data: companies, error } = await supabase
    .from("companies")
    .select("*");
  if (error) throw error;
  return companies as Company[];
};

export async function createCompanyAction(
  prevState: ActionState,
  formData: FormData
): Promise<CompanyActionState> {
  try {
    const supabase = await createClient();

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

    // Validate form data
    const fieldMapping: Record<keyof CompanyFormData, string> = {
      name: "name",
      slug: "slug",
      description: "description",
      address_street: "address_street",
      address_city: "address_city",
      phone: "phone",
      industry: "industry",
    };

    const validation = validateFormData(
      companyFormDataSchema,
      formData,
      fieldMapping
    );
    if (!validation.success) {
      return {
        success: false,
        message: "Dane formularza są nieprawidłowe",
        errors: validation.errors,
      };
    }

    const companyData: CompanyInsert = validation.data;

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

    // Create company_owners record
    const { data: ownerData, error: ownerError } = await supabase
      .from("company_owners")
      .insert({
        company_id: company.id,
        user_id: user.id,
        first_name: user.user_metadata?.first_name || 'Unknown',
        last_name: user.user_metadata?.last_name || 'Owner',
        email: user.email || 'unknown@example.com',
        phone: user.user_metadata?.phone,
      })
      .select()
      .single();

    if (ownerError) {
      return {
        success: false,
        message: `Błąd podczas tworzenia właściciela firmy: ${ownerError.message}`,
      };
    }

    // Update company with owner_id reference
    const { error: updateError } = await supabase
      .from("companies")
      .update({ owner_id: ownerData.id })
      .eq("id", company.id);

    if (updateError) {
      return {
        success: false,
        message: `Błąd podczas łączenia właściciela z firmą: ${updateError.message}`,
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
): Promise<CompanyActionState> {
  try {
    const supabase = await createClient();

    const companyId = formData.get("companyId");
    if (!companyId || typeof companyId !== "string") {
      return {
        success: false,
        message: "Brak ID firmy",
      };
    }

    // Validate form data
    const fieldMapping: Record<keyof CompanyFormData, string> = {
      name: "name",
      slug: "slug",
      description: "description",
      address_street: "address_street",
      address_city: "address_city",
      phone: "phone",
      industry: "industry",
    };

    const validation = validateFormData(
      companyFormDataSchema,
      formData,
      fieldMapping
    );
    if (!validation.success) {
      return {
        success: false,
        message: "Dane formularza są nieprawidłowe",
        errors: validation.errors,
      };
    }

    const updates: CompanyUpdate = validation.data;

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

export const createCompany = async (data: CompanyInsert): Promise<Company> => {
  const supabase = await createClient();
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

  // Create company_owners record
  const { data: ownerData, error: ownerError } = await supabase
    .from("company_owners")
    .insert({
      company_id: company.id,
      user_id: user.id,
      first_name: user.first_name || 'Unknown',
      last_name: user.last_name || 'Owner',
      email: user.email,
      phone: user.phone,
    })
    .select()
    .single();

  if (ownerError) throw ownerError;

  // Update company with owner_id reference
  const { error: updateError } = await supabase
    .from("companies")
    .update({ owner_id: ownerData.id })
    .eq("id", company.id);

  if (updateError) throw updateError;

  return company;
};

export const updateCompany = async (
  id: string,
  data: CompanyUpdate
): Promise<Company> => {
  const supabase = await createClient();
  const user = await serverAuth.getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if user is the owner of this company
  const { data: companyOwner } = await supabase
    .from("company_owners")
    .select("id")
    .eq("company_id", id)
    .eq("user_id", user.id)
    .single();

  if (!companyOwner) {
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

export const getCompanyBySlug = async (slug: string): Promise<Company> => {
  const supabase = await createClient();

  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;

  return company;
};

export const getUserCompany = async (): Promise<Company | null> => {
  const supabase = await createClient();
  const user = await serverAuth.getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: companyOwner, error } = await supabase
    .from("company_owners")
    .select(
      `
      company:companies(*)
    `
    )
    .eq("user_id", user.id)
    .single();

  if (error) throw error;

  // Type the companyOwner correctly - company is an array in Supabase joins
  const typedCompanyOwner = companyOwner as {
    company: Company[];
  } | null;

  return typedCompanyOwner?.company?.[0] || null;
};

export const getUserCompanyWithSubscription =
  async (): Promise<CompanyWithSubscription | null> => {
    const supabase = await createClient();
    const user = await serverAuth.getCurrentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data: companyOwner, error } = await supabase
      .from("company_owners")
      .select(
        `
      company:companies(*)
    `
      )
      .eq("user_id", user.id)
      .single();

    if (error) throw error;

    // Type the companyOwner correctly - company is an array in Supabase joins
    const typedCompanyOwner = companyOwner as {
      company: Company[];
    } | null;

    if (!typedCompanyOwner?.company?.[0]) {
      return null;
    }

    const company = typedCompanyOwner.company[0];

    // Get subscription information
    const { data: subscription, error: subscriptionError } = await supabase
      .from("company_subscriptions")
      .select(
        `
      *,
      subscription_plan:subscription_plans(*)
    `
      )
      .eq("company_id", company.id)
      .eq("status", "active")
      .single();

    if (subscriptionError) {
      console.warn("No active subscription found for company:", company.id);
    }

    return {
      ...company,
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            billing_cycle: subscription.billing_cycle,
            current_period_end: subscription.current_period_end,
            plan: subscription.subscription_plan,
          }
        : undefined,
    };
  };

// Business Hours Actions
export const getBusinessHours = async (
  companyId: string
): Promise<BusinessHours[]> => {
  const supabase = await createClient();
  const user = await serverAuth.getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if user is the owner of this company
  const { data: companyOwner } = await supabase
    .from("company_owners")
    .select("id")
    .eq("company_id", companyId)
    .eq("user_id", user.id)
    .single();

  if (!companyOwner) {
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
): Promise<BusinessHours[]> => {
  const supabase = await createClient();
  const user = await serverAuth.getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if user is the owner of this company
  const { data: companyOwner } = await supabase
    .from("company_owners")
    .select("id")
    .eq("company_id", companyId)
    .eq("user_id", user.id)
    .single();

  if (!companyOwner) {
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

export const getPublicBusinessHours = async (
  companyId: string
): Promise<BusinessHours[]> => {
  const supabase = await createClient();

  const { data: businessHours, error } = await supabase
    .from("business_hours")
    .select("*")
    .eq("company_id", companyId)
    .order("day_of_week");

  if (error) throw error;

  return businessHours;
};

// Client-side functions for business hours operations
export const getBusinessHoursClient = async (
  companyId: string
): Promise<BusinessHours[]> => {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = await createClient();

    const { data: businessHours, error } = await supabase
      .from("business_hours")
      .select("*")
      .eq("company_id", companyId)
      .order("day_of_week");

    if (error) throw error;

    return businessHours;
  } catch (error) {
    console.error("Error in getBusinessHoursClient:", error);
    throw error;
  }
};

export const upsertBusinessHoursClient = async (
  companyId: string,
  businessHours: BusinessHoursInsert[]
): Promise<BusinessHours[]> => {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = await createClient();

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
  } catch (error) {
    console.error("Error in upsertBusinessHoursClient:", error);
    throw error;
  }
};
