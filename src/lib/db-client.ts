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

    // Transform employees data
    return (data || []).map((emp) => ({
      ...emp,
      services:
        (emp as EmployeeWithDetailsRaw).employee_services?.map(
          (es) => es.service
        ) || [],
      schedules: (emp as EmployeeWithDetailsRaw).schedules || [],
    }));
  },
};
