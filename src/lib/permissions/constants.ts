import { ModuleName } from '@/lib/types/database';

export const MODULES = {
  EMPLOYEE_MANAGEMENT: 'employee_management' as ModuleName,
  EMPLOYEE_SCHEDULES: 'employee_schedules' as ModuleName,
  ONLINE_PAYMENTS: 'online_payments' as ModuleName,
  ANALYTICS: 'analytics' as ModuleName,
  MULTI_LOCATION: 'multi_location' as ModuleName,
  API_ACCESS: 'api_access' as ModuleName,
} as const;

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