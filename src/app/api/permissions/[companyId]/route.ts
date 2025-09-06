import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { serverAuth } from '@/lib/auth/server';
import type {
  ModuleName,
  CompanyPermissions,
  SubscriptionPlanWithModules,
  CompanyModule,
} from '@/lib/types/database';

async function getCompanyPermissions(companyId: string): Promise<CompanyPermissions | null> {
  try {
    const supabase = await createClient();

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
      .eq("company_id", companyId)
      .single();

    // If no subscription, assume free plan
    const planModules: Record<ModuleName, boolean> = {
      employee_management: false,
      employee_schedules: false,
      online_payments: false,
      analytics: false,
      multi_location: false,
      api_access: false,
    };

    let maxEmployees: number | null = 2; // Free plan default
    let maxLocations: number | null = 1;
    let planName = "free";
    let subscriptionStatus: "active" | "inactive" | "cancelled" | "past_due" = "active";
    let expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    if (subscription && subscription.subscription_plan) {
      const plan = subscription.subscription_plan as SubscriptionPlanWithModules;
      
      // Set plan-based modules
      plan.plan_modules.forEach((planModule) => {
        if (planModule.is_enabled && planModule.module_name in planModules) {
          planModules[planModule.module_name as ModuleName] = true;
        }
      });

      maxEmployees = plan.max_employees;
      maxLocations = plan.max_locations;
      planName = plan.display_name;
      subscriptionStatus = subscription.status;
      expiresAt = subscription.current_period_end;
    }

    // Get company-specific module overrides
    const { data: companyModules } = await supabase
      .from("company_modules")
      .select("*")
      .eq("company_id", companyId);

    // Apply company overrides
    if (companyModules) {
      companyModules.forEach((companyModule: CompanyModule) => {
        if (companyModule.module_name in planModules) {
          planModules[companyModule.module_name as ModuleName] = companyModule.is_enabled;
        }
      });
    }

    const permissions: CompanyPermissions = {
      companyId,
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

    return permissions;
  } catch (error) {
    console.error("Error fetching company permissions:", error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Check authentication and authorization
    const user = await serverAuth.getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has access to this company
    if (user.role !== 'admin') {
      const companies = await serverAuth.getUserCompanies(user.id);
      const hasAccess = companies.some(c => {
        const company = c.company as unknown as { id: string };
        return company.id === companyId;
      });
      
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    const permissions = await getCompanyPermissions(companyId);

    if (!permissions) {
      return NextResponse.json(
        { error: 'No permissions found for company' },
        { status: 404 }
      );
    }

    return NextResponse.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}