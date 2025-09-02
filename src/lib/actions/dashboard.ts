"use server";

import { createClient } from "@/lib/supabase/server";
import { serverAuth } from "@/lib/auth/server";
import type { Appointment, Service, Company } from "@/lib/types/database";

export interface DashboardStats {
  totalAppointments: number;
  todayAppointments: number;
  totalServices: number;
  totalEmployees: number;
  recentAppointments: (Appointment & {
    service?: { name: string };
    employee?: { name: string };
  })[];
  popularServices: (Service & { appointment_count: number })[];
}

export async function getDashboardData(): Promise<{
  stats: DashboardStats | null;
  company: Company | null;
}> {
  try {
    const user = await serverAuth.getCurrentUser();
    if (!user) return { stats: null, company: null };

    // Get user's company
    const companies = await serverAuth.getUserCompanies(user.id);
    if (companies.length === 0) return { stats: null, company: null };

    const userCompany = companies[0]?.company as unknown as Company;

    const supabase = await createClient();

    // Get dashboard statistics
    const [
      appointmentsResult,
      servicesResult,
      employeesResult,
      recentAppointmentsResult,
    ] = await Promise.all([
      // Total appointments
      supabase
        .from("appointments")
        .select("*")
        .eq("company_id", userCompany.id),

      // Total services
      supabase
        .from("services")
        .select("*")
        .eq("company_id", userCompany.id)
        .eq("active", true),

      // Total employees
      supabase.from("employees").select("*").eq("company_id", userCompany.id),

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
        .eq("company_id", userCompany.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const appointments = appointmentsResult.data || [];
    const services = servicesResult.data || [];
    const employees = employeesResult.data || [];
    const recentAppointments = recentAppointmentsResult.data || [];

    // Calculate today's appointments
    const today = new Date().toISOString().split("T")[0];
    const todayAppointments = appointments.filter(
      (apt) => apt.date === today
    ).length;

    // Get popular services (services with most appointments)
    const serviceStats = services
      .map((service) => {
        const appointmentCount = appointments.filter(
          (apt) => apt.service_id === service.id
        ).length;
        return {
          ...service,
          appointment_count: appointmentCount,
        };
      })
      .sort((a, b) => b.appointment_count - a.appointment_count);

    const stats: DashboardStats = {
      totalAppointments: appointments.length,
      todayAppointments,
      totalServices: services.length,
      totalEmployees: employees.length,
      recentAppointments: recentAppointments as unknown as Appointment[],
      popularServices: serviceStats.slice(0, 3),
    };

    return { stats, company: userCompany };
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    return { stats: null, company: null };
  }
}
