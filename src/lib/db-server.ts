import { createClient as createServerClient } from "@/lib/supabase/server";

import type {
  Company,
  Employee,
  EmployeeService,
  EmployeeWithDetailsRaw,
  Schedule,
  Service,
  Settings,
} from "@/lib/types/database";

// Server-side database operations (only for server components)
export const serverDb = {
  // Company operations
  async getCompanyBySlug(slug: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    return data as Company;
  },

  async getCompanyById(id: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Company;
  },

  // User operations
  async getCurrentUser() {
    const supabase = createServerClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) return null;

    return {
      id: data.user.id,
      email: data.user.email!,
      first_name: data.user.user_metadata?.first_name || "",
      last_name: data.user.user_metadata?.last_name || "",
      role: data.user.user_metadata?.role || "customer",
      phone: data.user.user_metadata?.phone,
    };
  },

  async getUserCompanies(userId: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("company_users")
      .select(
        `
        id,
        role,
        status,
        company:companies (
          id,
          name,
          slug,
          description,
          address_street,
          address_city,
          phone,
          industry,
          created_at
        )
      `
      )
      .eq("user_id", userId)
      .in("status", ["active", "invited"]);

    if (error) throw error;
    return data || [];
  },

  // Service operations
  async getServices(companyId: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("company_id", companyId)
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) throw error;
    return data as Service[];
  },

  async getServicesWithEmployees(companyId: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("services")
      .select(
        `
        *,
        employee_services(
          employee:employees(
            id,
            name,
            visible
          )
        )
      `
      )
      .eq("company_id", companyId)
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  },

  // Employee operations
  async getEmployees(companyId: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("employees")
      .select("id, name, visible")
      .eq("company_id", companyId)
      .eq("visible", true)
      .order("name", { ascending: true });

    if (error) throw error;
    return data as Employee[];
  },

  async getEmployeesWithDetails(companyId: string) {
    const supabase = createServerClient();
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
    return (data || []).map((emp: EmployeeWithDetailsRaw) => ({
      ...emp,
      services: emp.employee_services?.map((es) => es.service) || [],
      schedules: emp.schedules || [],
    }));
  },

  // Appointment operations
  async getAppointments(companyId: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        service:services(
          id,
          name,
          duration_minutes,
          price
        ),
        employee:employees(
          id,
          name
        )
      `
      )
      .eq("company_id", companyId)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) throw error;
    return data;
  },

  async getEmployeeAppointments(userId: string) {
    const supabase = createServerClient();

    // First, get the employee record for this user
    const { data: employeeData, error: employeeError } = await supabase
      .from("employees")
      .select("id")
      .eq("auth_user_id", userId)
      .single();

    if (employeeError || !employeeData) {
      return [];
    }

    // Then get appointments for this employee
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        service:services(
          id,
          name,
          duration_minutes,
          price
        )
      `
      )
      .eq("employee_id", employeeData.id)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) throw error;
    return data;
  },

  async getEmployeeAppointmentsByCompany(companyId: string, userId: string) {
    const supabase = createServerClient();

    // First, get the employee record for this user in this company
    const { data: employeeData, error: employeeError } = await supabase
      .from("employees")
      .select("id")
      .eq("company_id", companyId)
      .eq("auth_user_id", userId)
      .single();

    if (employeeError || !employeeData) {
      return [];
    }

    // Then get appointments for this employee
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        service:services(
          id,
          name,
          duration_minutes,
          price
        )
      `
      )
      .eq("employee_id", employeeData.id)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) throw error;
    return data;
  },

  // Settings operations
  async getCompanySettings(companyId: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("company_id", companyId)
      .single();

    if (error) throw error;
    return data as Settings;
  },
};
