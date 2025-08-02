import { createClient } from "@/lib/supabase/client";

import type { EmployeeWithDetailsRaw } from "@/lib/types/database";

// Client-side database operations
export const db = {
  // Company operations

  async getEmployeesWithDetails(companyId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("employees")
      .select(
        `
        *,
        employee_services(
          service:services(*)
        ),
        schedules(*)
      `
      )
      .eq("company_id", companyId)
      .order("name", { ascending: true });

    if (error) throw error;

    // Get roles separately since there's no direct relationship
    const employeeIds = (data || [])
      .map((emp) => emp.auth_user_id)
      .filter(Boolean);
    let roleMap: Record<string, string> = {};

    if (employeeIds.length > 0) {
      const { data: roleData } = await supabase
        .from("company_users")
        .select("user_id, role")
        .eq("company_id", companyId)
        .in("user_id", employeeIds);

      roleMap = (roleData || []).reduce(
        (acc, item) => {
          acc[item.user_id] = item.role;
          return acc;
        },
        {} as Record<string, string>
      );
    }

    // Transform employees data
    return (data || []).map((emp) => ({
      ...emp,
      services:
        (emp as EmployeeWithDetailsRaw).employee_services?.map(
          (es) => es.service
        ) || [],
      schedules: (emp as EmployeeWithDetailsRaw).schedules || [],
      role: emp.auth_user_id
        ? roleMap[emp.auth_user_id] || "employee"
        : "employee",
    }));
  },
};
