import type { ModuleName } from "@/lib/types/database";

// Feature routing configuration
export const FEATURE_MODULE_MAP: Record<string, ModuleName | ModuleName[]> = {
  "/company_owner/analytics": "analytics",
  "/company_owner/employees": "employee_management",
  "/company_owner/customers": ["employee_management"], // Advanced customer features require employee management
  "/employee/schedule": "employee_schedules",
  "/employee/services": "employee_schedules",
  // Add more route mappings as needed
};

// Get required modules for a given route
export function getRequiredModulesForRoute(pathname: string): ModuleName[] {
  const modules = FEATURE_MODULE_MAP[pathname];
  if (!modules) return [];
  return Array.isArray(modules) ? modules : [modules];
}

// Plan feature descriptions for UI
export const PLAN_FEATURES: Record<ModuleName, { name: string; description: string; availableIn: string[] }> = {
  employee_management: {
    name: "Zarządzanie pracownikami",
    description: "Dodawaj, edytuj i zarządzaj pracownikami swojej firmy",
    availableIn: ["starter", "pro", "enterprise"]
  },
  employee_schedules: {
    name: "Harmonogramy pracowników",
    description: "Zaawansowane planowanie grafików i dostępności pracowników",
    availableIn: ["starter", "pro", "enterprise"]
  },
  analytics: {
    name: "Analityka i raporty",
    description: "Szczegółowe statystyki, wykresy przychodów i analiza biznesowa",
    availableIn: ["pro", "enterprise"]
  },
  online_payments: {
    name: "Płatności online",
    description: "Przyjmuj płatności kartą poprzez integrację ze Stripe",
    availableIn: ["pro", "enterprise"]
  },
  multi_location: {
    name: "Wiele lokalizacji",
    description: "Zarządzaj wieloma oddziałami swojej firmy",
    availableIn: ["enterprise"]
  },
  api_access: {
    name: "Dostęp do API",
    description: "Integruj się z zewnętrznymi systemami poprzez nasze API",
    availableIn: ["enterprise"]
  }
};

// Get upgrade target plan for a module
export function getUpgradeTargetForModule(moduleName: ModuleName): string {
  const feature = PLAN_FEATURES[moduleName];
  return feature.availableIn[0]; // Return the lowest plan that includes this feature
}