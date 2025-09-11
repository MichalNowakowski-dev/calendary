"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/context/AuthProvider";
import type {
  ModuleName,
  CompanyPermissions,
  SubscriptionPlanWithModules,
  CompanyModule,
} from "@/lib/types/database";

interface ModulePermissionState {
  permissions: CompanyPermissions | null;
  loading: boolean;
  error: string | null;
}

export function useModulePermissions(companyId?: string) {
  const { user, status } = useAuth();
  const [state, setState] = useState<ModulePermissionState>({
    permissions: null,
    loading: true,
    error: null,
  });

  const fetchPermissions = useCallback(async () => {
    if (status !== "authenticated" || !user) {
      setState({
        permissions: null,
        loading: false,
        error: "User not authenticated",
      });
      return;
    }

    // For company_owner role, get their company
    let targetCompanyId = companyId;
    if (!targetCompanyId && user.role === "company_owner") {
      const supabase = createClient();
      const { data: companyOwner, error: ownerError } = await supabase
        .from("company_owners")
        .select("company_id")
        .eq("user_id", user.id)
        .single();

      if (ownerError || !companyOwner) {
        setState({
          permissions: null,
          loading: false,
          error: "Company not found for user",
        });
        return;
      }
      targetCompanyId = companyOwner.company_id;
    }

    if (!targetCompanyId) {
      setState({
        permissions: null,
        loading: false,
        error: "No company ID provided",
      });
      return;
    }

    try {
      const supabase = createClient();

      // Get company subscription with plan and modules
      const { data: subscription, error: subscriptionError } = await supabase
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
        .eq("company_id", targetCompanyId)
        .single();

      // Initialize default values
      const planModules: Record<ModuleName, boolean> = {
        employee_management: false,
        employee_schedules: false,
        online_payments: false,
        analytics: false,
        multi_location: false,
        api_access: false,
      };

      let maxEmployees: number | null = 2;
      let maxLocations: number | null = 1;
      let planName = "free";
      let subscriptionStatus: "active" | "inactive" | "cancelled" | "past_due" =
        "active";
      let expiresAt = new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString();
      let plan: SubscriptionPlanWithModules | null = null;

      if (subscription && subscription.subscription_plan) {
        // Use active subscription plan
        plan = subscription.subscription_plan as SubscriptionPlanWithModules;
        subscriptionStatus = subscription.status;
        expiresAt = subscription.current_period_end;
      } else {
        // Fallback to company's default plan from companies.plan_id
        const { data: companyWithPlan } = await supabase
          .from("companies")
          .select(
            `
            plan_id,
            subscription_plan:subscription_plans (
              *,
              plan_modules (*)
            )
          `
          )
          .eq("id", targetCompanyId)
          .single();

        if (companyWithPlan?.subscription_plan) {
          plan =
            companyWithPlan.subscription_plan as unknown as SubscriptionPlanWithModules;
        }
      }

      // Apply plan modules if we have a plan
      if (plan) {
        plan.plan_modules.forEach((planModule) => {
          if (planModule.is_enabled && planModule.module_name in planModules) {
            planModules[planModule.module_name as ModuleName] = true;
          }
        });

        maxEmployees = plan.max_employees;
        maxLocations = plan.max_locations;
        planName = plan.display_name;
      }

      // Get company-specific module overrides
      const { data: companyModules } = await supabase
        .from("company_modules")
        .select("*")
        .eq("company_id", targetCompanyId);

      // Apply company overrides
      if (companyModules) {
        companyModules.forEach((companyModule: CompanyModule) => {
          if (companyModule.module_name in planModules) {
            planModules[companyModule.module_name as ModuleName] =
              companyModule.is_enabled;
          }
        });
      }

      const permissions: CompanyPermissions = {
        companyId: targetCompanyId,
        modules: planModules,
        limits: {
          maxEmployees,
          maxLocations,
        },
        subscription: {
          status: subscriptionStatus,
          planName,
          expiresAt,
        },
      };

      setState({
        permissions,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching module permissions:", error);
      setState({
        permissions: null,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, [user, status, companyId]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Helper methods
  const hasModule = useCallback(
    (moduleName: ModuleName): boolean => {
      return state.permissions?.modules[moduleName] || false;
    },
    [state.permissions]
  );

  const canAccessFeature = useCallback(
    (requiredModules: ModuleName | ModuleName[]): boolean => {
      if (!state.permissions) return false;

      const modules = Array.isArray(requiredModules)
        ? requiredModules
        : [requiredModules];
      return modules.every((module) => state.permissions!.modules[module]);
    },
    [state.permissions]
  );

  const isWithinLimits = useCallback(
    (limitType: "employees" | "locations", currentCount: number): boolean => {
      if (!state.permissions) return false;

      const limit =
        limitType === "employees"
          ? state.permissions.limits.maxEmployees
          : state.permissions.limits.maxLocations;

      return limit === null || currentCount < limit;
    },
    [state.permissions]
  );

  const refreshPermissions = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true }));
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    ...state,
    hasModule,
    canAccessFeature,
    isWithinLimits,
    refreshPermissions,
  };
}
