import type { ModuleName } from "@/lib/types/database";

// Server-side permission checking utility
export async function checkModulePermission(
  companyId: string,
  requiredModule: ModuleName
): Promise<boolean> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  try {
    // Get company subscription with plan modules
    const { data: subscription } = await supabase
      .from("company_subscriptions")
      .select(
        `
        subscription_plan:subscription_plans (
          plan_modules (
            module_name,
            is_enabled
          )
        )
      `
      )
      .eq("company_id", companyId)
      .single();

    // Check plan-based permissions (default to false for free plan)
    let hasPermission = false;
    if (subscription?.subscription_plan && 'plan_modules' in subscription.subscription_plan) {
      const planModules = subscription.subscription_plan.plan_modules as Array<{ module_name: string; is_enabled: boolean }>;
      const planModule = planModules.find(
        (pm) => pm.module_name === requiredModule
      );
      hasPermission = planModule?.is_enabled || false;
    }

    // Check for company-specific overrides
    const { data: companyModule } = await supabase
      .from("company_modules")
      .select("is_enabled")
      .eq("company_id", companyId)
      .eq("module_name", requiredModule)
      .single();

    if (companyModule) {
      hasPermission = companyModule.is_enabled;
    }

    return hasPermission;
  } catch (error) {
    console.error("Error checking module permission:", error);
    return false;
  }
}