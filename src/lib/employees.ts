import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { Employee, Service, Schedule } from "@/lib/types/database";

export interface EmployeeWithDetails extends Employee {
  services: Service[];
  schedules: Schedule[];
}

export async function getEmployeesWithDetails(
  companyId: string
): Promise<EmployeeWithDetails[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

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

  if (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }

  // Transform employees data
  return (data || []).map((emp) => ({
    ...emp,
    services:
      (emp as any).employee_services?.map((es: any) => es.service) || [],
    schedules: (emp as any).schedules || [],
  }));
}

export async function getServices(companyId: string): Promise<Service[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("company_id", companyId)
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching services:", error);
    throw error;
  }

  return data || [];
}
