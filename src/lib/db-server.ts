import { createClient as createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type {
  Company,
  Employee,
  Service,
  Appointment,
  Schedule,
  Customer,
  CompanyUser,
  Settings,
} from "@/lib/types/database";

// Server-side database operations (only for server components)
export const serverDb = {
  // Company operations
  async getCompanyBySlug(slug: string) {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    return data as Company;
  },

  async getCompanyById(id: string) {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
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
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
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
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
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
          address,
          phone,
          industry,
          created_at
        )
      `
      )
      .eq("user_id", userId)
      .eq("status", "active");

    if (error) throw error;
    return data || [];
  },

  // Service operations
  async getServices(companyId: string) {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
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
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
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
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
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
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
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
        (emp as any).employee_services?.map((es: any) => es.service) || [],
      schedules: (emp as any).schedules || [],
    }));
  },

  // Appointment operations
  async getAppointments(companyId: string) {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
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

  // Settings operations
  async getCompanySettings(companyId: string) {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("company_id", companyId)
      .single();

    if (error) throw error;
    return data as Settings;
  },
};
