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
  CompanyWithOptionalSubscription,
  Company,
} from "@/lib/types/database";
import type { ActionState } from "./types";
import { moduleLifecycleManager } from "@/lib/modules/lifecycle";
import { moduleAuditTracker } from "@/lib/modules/audit";
import { gracefulDegradationManager } from "@/lib/modules/degradation";

// Get all subscription plans with their modules
export const getSubscriptionPlans = async (): Promise<
  SubscriptionPlanWithModules[]
> => {
  const supabase = await createClient();

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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if user is the owner of this company or is admin
  const { data: companyOwner } = await supabase
    .from("company_owners")
    .select("id")
    .eq("company_id", companyId)
    .eq("user_id", user.id)
    .single();

  // Allow if user is admin (global admin) or owns the company
  const isAdmin = user.user_metadata?.role === "admin";
  if (!companyOwner && !isAdmin) {
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

// Admin-only: Update company subscription with automated module management
export const updateCompanySubscription = async (
  companyId: string,
  planId: string
): Promise<ActionState> => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.user_metadata?.role !== "admin") {
      return {
        success: false,
        message: "Access denied. Admin privileges required.",
      };
    }

    // Get current subscription to track old plan
    const { data: currentSubscription } = await supabase
      .from("company_subscriptions")
      .select("subscription_plan_id")
      .eq("company_id", companyId)
      .single();

    const oldPlanId = currentSubscription?.subscription_plan_id || null;
    let result;

    if (currentSubscription) {
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

    // Handle module lifecycle changes
    const lifecycleResult =
      await moduleLifecycleManager.handleSubscriptionChange(
        companyId,
        planId,
        oldPlanId,
        "subscription_change",
        user.id
      );

    if (!lifecycleResult.success) {
      console.warn(
        "Module lifecycle management failed:",
        lifecycleResult.message
      );
    }

    // Create graceful degradation warnings for revoked modules
    for (const transition of lifecycleResult.transitions) {
      if (!transition.to_status && transition.from_status) {
        await gracefulDegradationManager.createRevocationWarning(
          companyId,
          transition.module,
          "subscription_change"
        );
      }
    }

    revalidatePath(`/admin`);
    revalidatePath(`/company_owner`);

    const successMessage =
      lifecycleResult.transitions.length > 0
        ? `Subscription updated with ${lifecycleResult.transitions.length} module changes`
        : "Subscription updated successfully";

    return {
      success: true,
      message: successMessage,
      data: {
        ...result,
        module_transitions: lifecycleResult.transitions,
      },
    };
  } catch (error) {
    console.error("Error updating subscription:", error);
    return {
      success: false,
      message: "Failed to update subscription",
    };
  }
};

// Admin-only: Toggle module access for a specific company with enhanced validation
export const toggleCompanyModule = async (
  companyId: string,
  moduleName: ModuleName,
  enabled: boolean,
  notes?: string
): Promise<ActionState> => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.user_metadata?.role !== "admin") {
      return {
        success: false,
        message: "Access denied. Admin privileges required.",
      };
    }

    // Get current module status
    const { data: currentModule } = await supabase
      .from("company_modules")
      .select("is_enabled")
      .eq("company_id", companyId)
      .eq("module_name", moduleName)
      .single();

    const currentStatus = currentModule?.is_enabled || false;

    // Validate dependencies before making changes
    const validation = await moduleLifecycleManager.validateModuleDependencies(
      companyId,
      moduleName,
      enabled
    );

    if (!validation.valid) {
      return {
        success: false,
        message: `Cannot proceed: ${validation.conflicts.join(", ")}`,
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

    // Record the change in audit trail
    await supabase.from("module_changes").insert({
      company_id: companyId,
      module_name: moduleName,
      action: "overridden",
      reason: "admin_override",
      previous_status: currentStatus,
      new_status: enabled,
      changed_by_user_id: user.id,
      notes: notes,
    });

    // Handle graceful degradation if module is being disabled
    if (!enabled && currentStatus) {
      await gracefulDegradationManager.createRevocationWarning(
        companyId,
        moduleName,
        "admin_override"
      );
    }

    // Record usage tracking
    await moduleAuditTracker.recordModuleUsage(companyId, moduleName, {
      admin_toggle: true,
      previous_status: currentStatus,
      new_status: enabled,
    });

    revalidatePath(`/admin`);
    revalidatePath(`/company_owner`);

    let message = `Module ${moduleName} ${enabled ? "enabled" : "disabled"} for company`;
    if (validation.warnings.length > 0) {
      message += `. Warnings: ${validation.warnings.join(", ")}`;
    }

    return {
      success: true,
      message,
      data: {
        ...result,
        validation_warnings: validation.warnings,
      },
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
export const getAllCompaniesWithSubscriptions = async (): Promise<
  CompanyWithOptionalSubscription[]
> => {
  const supabase = await createClient();
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
      company_subscriptions (
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

  return companies as CompanyWithOptionalSubscription[];
};

// Get company modules (overrides)
export const getCompanyModules = async (companyId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if user has access to this company or is admin
  const { data: companyUser } = await supabase
    .from("company_owners")
    .select("id")
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

// Get complete subscription data for company owner dashboard
export const getCompanySubscriptionData = async () => {
  const supabase = await createClient();
  const user = await serverAuth.getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get user's company
  const { data: companyUser, error: companyUserError } = await supabase
    .from("company_owners")
    .select(
      `
      company:companies (
        id,
        name,
        plan_id
      )
    `
    )
    .eq("user_id", user.id)
    .single();

  if (companyUserError || !companyUser?.company) {
    throw new Error("Company not found");
  }

  const company = companyUser.company as unknown as Pick<
    Company,
    "id" | "name" | "plan_id"
  >;

  // Get all subscription plans (including free plan)
  const { data: allPlans, error: plansError } = await supabase
    .from("subscription_plans")
    .select(
      `
      *,
      plan_modules (*)
    `
    )
    .eq("is_active", true)
    .order("price_monthly", { ascending: true });

  if (plansError) throw plansError;

  const plans = allPlans as SubscriptionPlanWithModules[];
  const freePlan = plans.find((plan) => plan.name === "free");

  if (!freePlan) {
    throw new Error("Free plan not found");
  }

  // Get current subscription
  const { data: subscription } = await supabase
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
    .eq("company_id", company.id)
    .single();

  // Prepare current subscription data with fallback to free plan
  const currentPlan = subscription?.subscription_plan || freePlan;
  const currentSubscription = subscription || {
    id: crypto.randomUUID(),
    company_id: company.id,
    subscription_plan_id: freePlan.id,
    status: "active" as const,
    billing_cycle: "monthly" as const,
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000
    ).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subscription_plan: freePlan,
  };

  return {
    company,
    current: {
      plan: currentPlan as SubscriptionPlanWithModules,
      subscription: currentSubscription,
    },
    available: plans.filter((plan) => plan.name !== "free"),
  };
};

// Admin-only: Remove company module override (revert to plan default)
export const removeCompanyModuleOverride = async (
  companyId: string,
  moduleName: ModuleName
): Promise<ActionState> => {
  try {
    const supabase = await createClient();
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
