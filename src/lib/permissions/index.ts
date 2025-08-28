import { createClient } from '@/lib/supabase/server';
import { 
  ModuleName, 
  CompanyPermissions, 
  CompanySubscriptionWithPlan,
  SubscriptionStatus 
} from '@/lib/types/database';

export const MODULES = {
  EMPLOYEE_MANAGEMENT: 'employee_management' as ModuleName,
  EMPLOYEE_SCHEDULES: 'employee_schedules' as ModuleName,
  ONLINE_PAYMENTS: 'online_payments' as ModuleName,
  ANALYTICS: 'analytics' as ModuleName,
  MULTI_LOCATION: 'multi_location' as ModuleName,
  API_ACCESS: 'api_access' as ModuleName,
} as const;

export async function getCompanyPermissions(companyId: string): Promise<CompanyPermissions | null> {
  const supabase = createClient();

  try {
    // Get company subscription with plan details and modules
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('company_subscriptions')
      .select(`
        *,
        subscription_plan:subscription_plans (
          *,
          plan_modules (*)
        )
      `)
      .eq('company_id', companyId)
      .eq('status', 'active')
      .single();

    if (subscriptionError || !subscriptionData) {
      console.warn('No active subscription found for company:', companyId);
      return null;
    }

    const subscription = subscriptionData as CompanySubscriptionWithPlan;

    // Get company-specific module overrides
    const { data: companyModules, error: modulesError } = await supabase
      .from('company_modules')
      .select('*')
      .eq('company_id', companyId);

    if (modulesError) {
      console.error('Error fetching company modules:', modulesError);
    }

    // Build module permissions map
    const modules: Record<ModuleName, boolean> = {
      employee_management: false,
      employee_schedules: false,
      online_payments: false,
      analytics: false,
      multi_location: false,
      api_access: false,
    };

    // Apply plan-level permissions
    subscription.plan_modules.forEach(planModule => {
      if (planModule.module_name in modules) {
        modules[planModule.module_name as ModuleName] = planModule.is_enabled;
      }
    });

    // Apply company-specific overrides
    companyModules?.forEach(companyModule => {
      if (companyModule.module_name in modules) {
        modules[companyModule.module_name as ModuleName] = companyModule.is_enabled;
      }
    });

    return {
      companyId,
      modules,
      limits: {
        maxEmployees: subscription.subscription_plan.max_employees,
        maxLocations: subscription.subscription_plan.max_locations,
      },
      subscription: {
        status: subscription.status,
        planName: subscription.subscription_plan.display_name,
        expiresAt: subscription.current_period_end,
      },
    };
  } catch (error) {
    console.error('Error fetching company permissions:', error);
    return null;
  }
}

export async function checkModuleAccess(companyId: string, module: ModuleName): Promise<boolean> {
  const permissions = await getCompanyPermissions(companyId);
  
  if (!permissions) {
    return false;
  }

  // Check if subscription is active
  if (permissions.subscription.status !== 'active') {
    return false;
  }

  return permissions.modules[module] || false;
}

export async function checkEmployeeLimit(companyId: string): Promise<{ allowed: boolean; current: number; max: number | null }> {
  const permissions = await getCompanyPermissions(companyId);
  
  if (!permissions) {
    return { allowed: false, current: 0, max: null };
  }

  // If no limit set, allow unlimited
  if (permissions.limits.maxEmployees === null) {
    return { allowed: true, current: 0, max: null };
  }

  const supabase = createClient();
  
  // Get current employee count
  const { count, error } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  if (error) {
    console.error('Error counting employees:', error);
    return { allowed: false, current: 0, max: permissions.limits.maxEmployees };
  }

  const currentCount = count || 0;
  const allowed = currentCount < permissions.limits.maxEmployees;

  return {
    allowed,
    current: currentCount,
    max: permissions.limits.maxEmployees,
  };
}

export async function checkLocationLimit(companyId: string): Promise<{ allowed: boolean; current: number; max: number | null }> {
  const permissions = await getCompanyPermissions(companyId);
  
  if (!permissions) {
    return { allowed: false, current: 0, max: null };
  }

  // If no limit set, allow unlimited
  if (permissions.limits.maxLocations === null) {
    return { allowed: true, current: 0, max: null };
  }

  // For now, we assume single location (1)
  // This would need to be updated when multi-location feature is implemented
  const currentCount = 1;
  const allowed = currentCount <= permissions.limits.maxLocations;

  return {
    allowed,
    current: currentCount,
    max: permissions.limits.maxLocations,
  };
}

export function getUpgradeMessage(module: ModuleName): string {
  const moduleNames = {
    employee_management: 'Employee Management',
    employee_schedules: 'Employee Schedules',
    online_payments: 'Online Payments',
    analytics: 'Analytics & Reporting',
    multi_location: 'Multiple Locations',
    api_access: 'API Access',
  };

  return `${moduleNames[module]} is not available on your current plan. Upgrade to access this feature.`;
}