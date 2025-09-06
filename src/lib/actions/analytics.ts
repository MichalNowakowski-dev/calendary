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
  completionRateChange: number;
  averageAppointmentValueChange: number;
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

    // Check if user has analytics module permission
    const { checkModulePermission } = await import("@/lib/utils/server-module-gating");
    const hasAnalyticsAccess = await checkModulePermission(userCompany.id, "analytics");
    
    if (!hasAnalyticsAccess) {
      throw new Error("Access denied: Analytics module not available");
    }

    // Calculate date range based on timeRange
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const supabase = await createClient();

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
      .gte("date", startDate.toISOString().split('T')[0])
      .lte("date", endDate.toISOString().split('T')[0]);

    // Fetch previous period appointments for comparison
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - parseInt(timeRange));
    const { data: previousAppointments } = await supabase
      .from("appointments")
      .select(
        `
        *,
        service:services(name, price)
      `
      )
      .eq("company_id", userCompany.id)
      .gte("date", previousStartDate.toISOString().split('T')[0])
      .lt("date", startDate.toISOString().split('T')[0]);

    // Fetch customers for retention analysis
    const { data: customers } = await supabase
      .from("customers")
      .select("*")
      .eq("company_id", userCompany.id);

    if (!appointments) return null;
    const prevAppointments = previousAppointments || [];
    const allCustomers = customers || [];

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

    // Calculate real monthly revenue based on actual appointment dates
    const monthlyData = new Map<string, { revenue: number; appointments: number }>();
    appointments.forEach((apt) => {
      const date = new Date(apt.date);
      const monthKey = date.toLocaleDateString('pl-PL', { month: 'short' });
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { revenue: 0, appointments: 0 });
      }
      
      const month = monthlyData.get(monthKey)!;
      month.revenue += apt.service?.price || 0;
      month.appointments += 1;
    });

    const monthlyRevenue = Array.from(monthlyData.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => {
        const months = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
        return months.indexOf(a.month) - months.indexOf(b.month);
      });

    const appointmentStatusDistribution = {
      booked: appointments.filter((apt) => apt.status === "booked").length,
      completed: completedAppointments,
      cancelled: cancelledAppointments,
    };

    // Calculate real customer analytics
    const uniqueCustomerEmails = new Set(appointments.map(apt => apt.customer_email));
    const totalCustomers = uniqueCustomerEmails.size;
    
    // Calculate new customers (customers who made their first appointment in current period)
    const customerFirstAppointments = new Map<string, string>();
    allCustomers.forEach(customer => {
      const customerAppointments = appointments.filter(apt => apt.customer_email === customer.email);
      if (customerAppointments.length > 0) {
        const firstAppointment = customerAppointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
        customerFirstAppointments.set(customer.email, firstAppointment.date);
      }
    });
    
    const newCustomers = Array.from(customerFirstAppointments.values())
      .filter(firstDate => {
        const first = new Date(firstDate);
        return first >= startDate && first <= endDate;
      }).length;
    
    const returningCustomers = totalCustomers - newCustomers;
    const averageCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    
    // Calculate retention rate: customers who had appointments in both periods
    const prevCustomerEmails = new Set(prevAppointments.map(apt => apt.customer_email));
    const currentCustomerEmails = new Set(appointments.map(apt => apt.customer_email));
    const returningFromPrevPeriod = Array.from(prevCustomerEmails).filter(email => currentCustomerEmails.has(email));
    const customerRetentionRate = prevCustomerEmails.size > 0 ? (returningFromPrevPeriod.length / prevCustomerEmails.size) * 100 : 0;

    // Calculate real time analytics from appointment data
    const hourlyData = new Map<string, number>();
    const dailyData = new Map<string, number>();
    let totalDurationMinutes = 0;
    
    appointments.forEach((apt) => {
      // Peak hours analysis
      const hour = apt.start_time.substring(0, 5); // Extract HH:MM
      hourlyData.set(hour, (hourlyData.get(hour) || 0) + 1);
      
      // Busy days analysis
      const date = new Date(apt.date);
      const dayName = date.toLocaleDateString('pl-PL', { weekday: 'long' });
      const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      dailyData.set(capitalizedDay, (dailyData.get(capitalizedDay) || 0) + 1);
      
      // Duration calculation
      if (apt.start_time && apt.end_time) {
        const startTime = new Date(`2000-01-01T${apt.start_time}`);
        const endTime = new Date(`2000-01-01T${apt.end_time}`);
        const durationMs = endTime.getTime() - startTime.getTime();
        totalDurationMinutes += durationMs / (1000 * 60);
      }
    });
    
    const peakHours = Array.from(hourlyData.entries())
      .map(([hour, appointments]) => ({ hour, appointments }))
      .sort((a, b) => b.appointments - a.appointments)
      .slice(0, 5);
    
    const busyDays = Array.from(dailyData.entries())
      .map(([day, appointments]) => ({ day, appointments }))
      .sort((a, b) => b.appointments - a.appointments);
    
    const averageDuration = totalAppointments > 0 ? Math.round(totalDurationMinutes / totalAppointments) : 45;
    const totalHours = Math.ceil(totalDurationMinutes / 60);

    return {
      totalRevenue,
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      averageAppointmentValue:
        totalAppointments > 0 ? totalRevenue / totalAppointments : 0,
      revenueChange: (() => {
        const prevRevenue = prevAppointments.reduce((sum, apt) => sum + (apt.service?.price || 0), 0);
        return prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
      })(),
      appointmentChange: (() => {
        const prevTotal = prevAppointments.length;
        return prevTotal > 0 ? ((totalAppointments - prevTotal) / prevTotal) * 100 : 0;
      })(),
      completionRateChange: (() => {
        const currentCompletionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;
        const prevCompletedAppointments = prevAppointments.filter(apt => apt.status === "completed").length;
        const prevCompletionRate = prevAppointments.length > 0 ? (prevCompletedAppointments / prevAppointments.length) * 100 : 0;
        return prevCompletionRate > 0 ? currentCompletionRate - prevCompletionRate : 0;
      })(),
      averageAppointmentValueChange: (() => {
        const currentAvgValue = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;
        const prevRevenue = prevAppointments.reduce((sum, apt) => sum + (apt.service?.price || 0), 0);
        const prevAvgValue = prevAppointments.length > 0 ? prevRevenue / prevAppointments.length : 0;
        return prevAvgValue > 0 ? ((currentAvgValue - prevAvgValue) / prevAvgValue) * 100 : 0;
      })(),
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
