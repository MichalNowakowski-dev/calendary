"use server";

import { createClient } from "@/lib/supabase/server";
import { serverAuth } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";
import type {
  SubscriptionPlan,
  CompanySubscription,
  CompanySubscriptionInsert,
  CompanySubscriptionUpdate,
  CompanyModule,
  CompanyModuleInsert,
  CompanyModuleUpdate,
  ModuleName,
  SubscriptionPlanWithModules,
  CompanyWithFullSubscription,
} from "@/lib/types/database";
import type { ActionState } from "./types";

// Get all subscription plans with their modules
export const getSubscriptionPlans = async (): Promise<
  SubscriptionPlanWithModules[]
> => {
  const supabase = createClient();

  const { data: plans, error } = await supabase
    .from("subscription_plans")
    .select(
      `
      *,
      plan_modules (*)
    `
    )
    .eq("is_active", true)
    .order("price_monthly", { ascending: true });

  if (error) throw error;

  return plans as SubscriptionPlanWithModules[];
};

// Get company's current subscription
export const getCompanySubscription = async (companyId: string) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if user has access to this company or is admin
  const { data: companyUser } = await supabase
    .from("company_users")
    .select("role")
    .eq("company_id", companyId)
    .eq("user_id", user.id)
    .single();

  // Allow if user is admin (global admin) or has company access
  const isAdmin = user.user_metadata?.role === "admin";
  if (!companyUser && !isAdmin) {
    throw new Error("Access denied");
  }

  const { data: subscription, error } = await supabase
    .from("company_subscriptions")
    .select(
      `
      *,
      subscription_plan:subscription_plans (
        *,
        plan_modules (*)
      )
    `
    )
    .eq("company_id", companyId)
    .single();

  if (error) throw error;

  return subscription;
};

// Admin-only: Update company subscription
export const updateCompanySubscription = async (
  companyId: string,
  planId: string
): Promise<ActionState> => {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.user_metadata?.role !== "admin") {
      return {
        success: false,
        message: "Access denied. Admin privileges required.",
      };
    }

    // Check if subscription exists
    const { data: existingSubscription } = await supabase
      .from("company_subscriptions")
      .select("id")
      .eq("company_id", companyId)
      .single();

    let result;

    if (existingSubscription) {
      // Update existing subscription
      const { data, error } = await supabase
        .from("company_subscriptions")
        .update({
          subscription_plan_id: planId,
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 days from now
        })
        .eq("company_id", companyId)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new subscription
      const { data, error } = await supabase
        .from("company_subscriptions")
        .insert({
          company_id: companyId,
          subscription_plan_id: planId,
          status: "active",
          billing_cycle: "monthly",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    revalidatePath(`/admin`);
    revalidatePath(`/company_owner`);

    return {
      success: true,
      message: "Subscription updated successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error updating subscription:", error);
    return {
      success: false,
      message: "Failed to update subscription",
    };
  }
};

// Admin-only: Toggle module access for a specific company
export const toggleCompanyModule = async (
  companyId: string,
  moduleName: ModuleName,
  enabled: boolean,
  notes?: string
): Promise<ActionState> => {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.user_metadata?.role !== "admin") {
      return {
        success: false,
        message: "Access denied. Admin privileges required.",
      };
    }

    // Check if company module override exists
    const { data: existingModule } = await supabase
      .from("company_modules")
      .select("id")
      .eq("company_id", companyId)
      .eq("module_name", moduleName)
      .single();

    let result;

    if (existingModule) {
      // Update existing override
      const { data, error } = await supabase
        .from("company_modules")
        .update({
          is_enabled: enabled,
          notes: notes || null,
        })
        .eq("company_id", companyId)
        .eq("module_name", moduleName)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new override
      const { data, error } = await supabase
        .from("company_modules")
        .insert({
          company_id: companyId,
          module_name: moduleName,
          is_enabled: enabled,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    revalidatePath(`/admin`);
    revalidatePath(`/company_owner`);

    return {
      success: true,
      message: `Module ${moduleName} ${enabled ? "enabled" : "disabled"} for company`,
      data: result,
    };
  } catch (error) {
    console.error("Error toggling company module:", error);
    return {
      success: false,
      message: "Failed to toggle module access",
    };
  }
};

// Admin-only: Get all companies with their subscriptions for admin dashboard
export const getAllCompaniesWithSubscriptions = async (): Promise<CompanyWithFullSubscription[]> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "admin") {
    throw new Error("Access denied. Admin privileges required.");
  }

  const { data: companies, error } = await supabase
    .from("companies")
    .select(
      `
      *,
      company_subscriptions!inner (
        *,
        subscription_plan:subscription_plans (
          *,
          plan_modules (*)
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return companies as CompanyWithFullSubscription[];
};

// Get company modules (overrides)
export const getCompanyModules = async (companyId: string) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if user has access to this company or is admin
  const { data: companyUser } = await supabase
    .from("company_users")
    .select("role")
    .eq("company_id", companyId)
    .eq("user_id", user.id)
    .single();

  const isAdmin = user.user_metadata?.role === "admin";
  if (!companyUser && !isAdmin) {
    throw new Error("Access denied");
  }

  const { data: modules, error } = await supabase
    .from("company_modules")
    .select("*")
    .eq("company_id", companyId)
    .order("module_name");

  if (error) throw error;

  return modules;
};

// Admin-only: Remove company module override (revert to plan default)
export const removeCompanyModuleOverride = async (
  companyId: string,
  moduleName: ModuleName
): Promise<ActionState> => {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.user_metadata?.role !== "admin") {
      return {
        success: false,
        message: "Access denied. Admin privileges required.",
      };
    }

    const { error } = await supabase
      .from("company_modules")
      .delete()
      .eq("company_id", companyId)
      .eq("module_name", moduleName);

    if (error) throw error;

    revalidatePath(`/admin`);
    revalidatePath(`/company_owner`);

    return {
      success: true,
      message: `Removed custom access for ${moduleName}. Now using plan default.`,
    };
  } catch (error) {
    console.error("Error removing module override:", error);
    return {
      success: false,
      message: "Failed to remove module override",
    };
  }
};
