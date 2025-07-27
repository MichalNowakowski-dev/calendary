import { createClient } from "@/lib/supabase/client";

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

// Client-side database operations
export const db = {
  // Company operations
  async getCompanyBySlug(slug: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    return data as Company;
  },

  async getCompanyById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Company;
  },

  async updateCompany(id: string, updates: Partial<Company>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("companies")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Company;
  },

  // Service operations
  async getServices(companyId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("company_id", companyId)
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) throw error;
    return data as Service[];
  },

  async getServiceById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Service;
  },

  async getServicesWithEmployees(companyId: string) {
    const supabase = createClient();
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
    const supabase = createClient();
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("company_id", companyId)
      .order("name", { ascending: true });

    if (error) throw error;
    return data as Employee[];
  },

  async getEmployeeById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Employee;
  },

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
        (emp as any).employee_services?.map((es: any) => es.service) || [],
      schedules: (emp as any).schedules || [],
    }));
  },

  async getEmployeeServices(employeeId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("employee_services")
      .select(
        `
        service:services(*)
      `
      )
      .eq("employee_id", employeeId);

    if (error) throw error;
    return (data || []).map((es: any) => es.service);
  },

  // Appointment operations
  async getAppointments(companyId: string) {
    const supabase = createClient();
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

  async getAppointmentById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        service:services(*),
        employee:employees(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async getRecentAppointments(companyId: string, limit: number = 5) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        service:services(name),
        employee:employees(name)
      `
      )
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Schedule operations
  async getEmployeeSchedules(employeeId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("employee_id", employeeId)
      .order("start_date", { ascending: true });

    if (error) throw error;
    return data as Schedule[];
  },

  async getSchedulesByDateRange(
    employeeId: string,
    startDate: string,
    endDate: string
  ) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("employee_id", employeeId)
      .gte("start_date", startDate)
      .lte("end_date", endDate)
      .order("start_date", { ascending: true });

    if (error) throw error;
    return data as Schedule[];
  },

  // Customer operations
  async getCustomerByEmail(email: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("email", email)
      .single();

    if (error) throw error;
    return data as Customer;
  },

  // Settings operations
  async getCompanySettings(companyId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("company_id", companyId)
      .single();

    if (error) throw error;
    return data as Settings;
  },

  // Dashboard statistics
  async getDashboardStats(companyId: string) {
    const supabase = createClient();

    const [
      appointmentsResult,
      servicesResult,
      employeesResult,
      recentAppointmentsResult,
    ] = await Promise.all([
      // Total appointments
      supabase.from("appointments").select("*").eq("company_id", companyId),

      // Total services
      supabase
        .from("services")
        .select("*")
        .eq("company_id", companyId)
        .eq("active", true),

      // Total employees
      supabase.from("employees").select("*").eq("company_id", companyId),

      // Recent appointments with service details
      supabase
        .from("appointments")
        .select(
          `
          *,
          service:services(name),
          employee:employees(name)
        `
        )
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    return {
      totalAppointments: appointmentsResult.data?.length || 0,
      totalServices: servicesResult.data?.length || 0,
      totalEmployees: employeesResult.data?.length || 0,
      recentAppointments: recentAppointmentsResult.data || [],
    };
  },
};
