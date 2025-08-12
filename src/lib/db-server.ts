import { createClient as createServerClient } from "@/lib/supabase/server";

import type {
  Company,
  CompanyWithServices,
  Employee,
  EmployeeWithDetailsRaw,
  Service,
  ServiceWithEmployees,
  ServiceWithEmployeesArray,
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

  async getSearchResults(searchTerm: string): Promise<CompanyWithServices[]> {
    if (!searchTerm.trim()) return [];

    const supabase = createServerClient();

    try {
      // Search for services by name
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select(
          `
          *,
          company:companies(
            id,
            name,
            slug,
            description,
            address_street,
            address_city,
            phone,
            industry
          ),
          employees:employee_services(
            employee:employees(
              id,
              name,
              email,
              phone_number,
              visible
            )
          )
        `
        )
        .ilike("name", `%${searchTerm}%`)
        .eq("active", true);

      if (servicesError) throw servicesError;

      // Group services by company
      const companiesMap = new Map<string, CompanyWithServices>();

      servicesData?.forEach((service) => {
        const company = service.company as Company;
        if (!companiesMap.has(company.id)) {
          companiesMap.set(company.id, {
            ...company,
            services: [],
          });
        }

        // Transform the service data to include employees array
        const serviceWithEmployees: ServiceWithEmployeesArray = {
          ...service,
          employees:
            service.employees?.map(
              (se: { employee: Employee }) => se.employee
            ) || [],
        };

        companiesMap.get(company.id)!.services.push(serviceWithEmployees);
      });

      return Array.from(companiesMap.values());
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  },

  async getUserCompanies(userId: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("company_users")
      .select(
        `
        id,
        user_id,
        company_id,
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
    return (data || []).map((emp: EmployeeWithDetailsRaw) => ({
      ...emp,
      services: emp.employee_services?.map((es) => es.service) || [],
      schedules: emp.schedules || [],
      role: emp.auth_user_id
        ? roleMap[emp.auth_user_id] || "employee"
        : "employee",
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
