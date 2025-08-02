"use server";

import { createClient } from "@/lib/supabase/server";
import { serverAuth } from "@/lib/auth/server";
import type { Company, Service, Employee } from "@/lib/types/database";

export interface AnalyticsData {
  totalRevenue: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  averageAppointmentValue: number;
  revenueChange: number;
  appointmentChange: number;
  topServices: Array<{
    service: Service;
    revenue: number;
    appointments: number;
  }>;
  topEmployees: Array<{
    employee: Employee;
    appointments: number;
    revenue: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    appointments: number;
  }>;
  appointmentStatusDistribution: {
    booked: number;
    completed: number;
    cancelled: number;
  };
  // Customer analytics
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageCustomerValue: number;
  customerRetentionRate: number;
  // Time analytics
  peakHours: Array<{ hour: string; appointments: number }>;
  busyDays: Array<{ day: string; appointments: number }>;
  averageDuration: number;
  totalHours: number;
}

export async function getAnalyticsData(
  timeRange: string = "30"
): Promise<AnalyticsData | null> {
  try {
    const user = await serverAuth.getCurrentUser();
    if (!user) return null;

    const companies = await serverAuth.getUserCompanies(user.id);
    if (companies.length === 0) return null;

    const userCompany = companies[0]?.company as unknown as Company;

    // Calculate date range based on timeRange
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const supabase = createClient();

    // Fetch appointments with service details
    const { data: appointments } = await supabase
      .from("appointments")
      .select(
        `
        *,
        service:services(name, price)
      `
      )
      .eq("company_id", userCompany.id)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (!appointments) return null;

    // Calculate analytics
    const totalRevenue = appointments.reduce((sum, apt) => {
      return sum + (apt.service?.price || 0);
    }, 0);

    const completedAppointments = appointments.filter(
      (apt) => apt.status === "completed"
    ).length;
    const cancelledAppointments = appointments.filter(
      (apt) => apt.status === "cancelled"
    ).length;
    const totalAppointments = appointments.length;

    // Calculate service performance
    const serviceStats = new Map();
    appointments.forEach((apt) => {
      if (apt.service) {
        const serviceId = apt.service.id;
        if (!serviceStats.has(serviceId)) {
          serviceStats.set(serviceId, {
            service: apt.service,
            revenue: 0,
            appointments: 0,
          });
        }
        serviceStats.get(serviceId).revenue += apt.service.price || 0;
        serviceStats.get(serviceId).appointments += 1;
      }
    });

    const topServices = Array.from(serviceStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate employee performance (if employees are assigned)
    const employeeStats = new Map();
    appointments.forEach((apt) => {
      if (apt.employee_id) {
        if (!employeeStats.has(apt.employee_id)) {
          employeeStats.set(apt.employee_id, {
            employee: { id: apt.employee_id, name: "Nieznany" },
            appointments: 0,
            revenue: 0,
          });
        }
        employeeStats.get(apt.employee_id).appointments += 1;
        employeeStats.get(apt.employee_id).revenue += apt.service?.price || 0;
      }
    });

    const topEmployees = Array.from(employeeStats.values())
      .sort((a, b) => b.appointments - a.appointments)
      .slice(0, 5);

    // Calculate monthly revenue (simplified)
    const monthlyRevenue = [
      {
        month: "Sty",
        revenue: totalRevenue * 0.3,
        appointments: totalAppointments * 0.3,
      },
      {
        month: "Lut",
        revenue: totalRevenue * 0.25,
        appointments: totalAppointments * 0.25,
      },
      {
        month: "Mar",
        revenue: totalRevenue * 0.45,
        appointments: totalAppointments * 0.45,
      },
    ];

    const appointmentStatusDistribution = {
      booked: appointments.filter((apt) => apt.status === "booked").length,
      completed: completedAppointments,
      cancelled: cancelledAppointments,
    };

    // Calculate customer analytics (mock data for now)
    const totalCustomers =
      appointments.length > 0 ? Math.ceil(appointments.length * 0.8) : 0;
    const newCustomers = Math.ceil(totalCustomers * 0.3);
    const returningCustomers = totalCustomers - newCustomers;
    const averageCustomerValue =
      totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    const customerRetentionRate = 75.5; // Mock data

    // Calculate time analytics (mock data for now)
    const peakHours = [
      { hour: "09:00", appointments: Math.ceil(totalAppointments * 0.15) },
      { hour: "10:00", appointments: Math.ceil(totalAppointments * 0.2) },
      { hour: "11:00", appointments: Math.ceil(totalAppointments * 0.18) },
      { hour: "14:00", appointments: Math.ceil(totalAppointments * 0.12) },
      { hour: "15:00", appointments: Math.ceil(totalAppointments * 0.1) },
    ];

    const busyDays = [
      {
        day: "Poniedziałek",
        appointments: Math.ceil(totalAppointments * 0.18),
      },
      { day: "Wtorek", appointments: Math.ceil(totalAppointments * 0.2) },
      {
        day: "Środa",
        appointments: Math.ceil(totalAppointments * 0.22),
      },
      {
        day: "Czwartek",
        appointments: Math.ceil(totalAppointments * 0.19),
      },
      { day: "Piątek", appointments: Math.ceil(totalAppointments * 0.15) },
    ];

    const averageDuration = 45; // Mock data
    const totalHours = Math.ceil((totalAppointments * averageDuration) / 60);

    return {
      totalRevenue,
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      averageAppointmentValue:
        totalAppointments > 0 ? totalRevenue / totalAppointments : 0,
      revenueChange: 12.5, // Mock data
      appointmentChange: 8.3, // Mock data
      topServices,
      topEmployees,
      monthlyRevenue,
      appointmentStatusDistribution,
      totalCustomers,
      newCustomers,
      returningCustomers,
      averageCustomerValue,
      customerRetentionRate,
      peakHours,
      busyDays,
      averageDuration,
      totalHours,
    };
  } catch (error) {
    console.error("Error loading analytics data:", error);
    return null;
  }
}
