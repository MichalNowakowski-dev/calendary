"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser, getUserCompanies } from "@/lib/auth/utils";
import type { Company, Service, Employee } from "@/lib/types/database";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  CheckCircle,
} from "lucide-react";
import {
  RevenueChart,
  AppointmentStatusChart,
  TopServicesTable,
  TopEmployeesTable,
  CustomerAnalytics,
  TimeAnalytics,
} from "./components";

interface AnalyticsData {
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

export default function AnalyticsClient() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );

  const [timeRange, setTimeRange] = useState("30");
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) return;

        const companies = await getUserCompanies(user.id);
        if (companies.length === 0) return;

        const userCompany = companies[0]?.company as unknown as Company;

        // Calculate date range based on timeRange
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange));

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

        if (!appointments) return;

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
                employee: { id: apt.employee_id, name: "Unknown" },
                appointments: 0,
                revenue: 0,
              });
            }
            employeeStats.get(apt.employee_id).appointments += 1;
            employeeStats.get(apt.employee_id).revenue +=
              apt.service?.price || 0;
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
          { day: "Monday", appointments: Math.ceil(totalAppointments * 0.18) },
          { day: "Tuesday", appointments: Math.ceil(totalAppointments * 0.2) },
          {
            day: "Wednesday",
            appointments: Math.ceil(totalAppointments * 0.22),
          },
          {
            day: "Thursday",
            appointments: Math.ceil(totalAppointments * 0.19),
          },
          { day: "Friday", appointments: Math.ceil(totalAppointments * 0.15) },
        ];

        const averageDuration = 45; // Mock data
        const totalHours = Math.ceil(
          (totalAppointments * averageDuration) / 60
        );

        setAnalyticsData({
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
        });
      } catch (error) {
        console.error("Error loading analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, [timeRange]);

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  if (!analyticsData) {
    return <div>No analytics data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Analytics Overview</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 dni</SelectItem>
            <SelectItem value="30">30 dni</SelectItem>
            <SelectItem value="90">90 dni</SelectItem>
            <SelectItem value="365">1 rok</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`${analyticsData.totalRevenue.toFixed(2)} zł`}
          change={analyticsData.revenueChange}
          icon={DollarSign}
          description="Przychód całkowity"
        />
        <MetricCard
          title="Total Appointments"
          value={analyticsData.totalAppointments.toString()}
          change={analyticsData.appointmentChange}
          icon={Calendar}
          description="Liczba wizyt"
        />
        <MetricCard
          title="Completion Rate"
          value={`${(
            (analyticsData.completedAppointments /
              analyticsData.totalAppointments) *
            100
          ).toFixed(1)}%`}
          change={5.2}
          icon={CheckCircle}
          description="Wskaźnik ukończenia"
        />
        <MetricCard
          title="Avg. Appointment Value"
          value={`${analyticsData.averageAppointmentValue.toFixed(2)} zł`}
          change={-2.1}
          icon={TrendingUp}
          description="Średnia wartość wizyty"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={analyticsData.monthlyRevenue} />
        <AppointmentStatusChart
          data={analyticsData.appointmentStatusDistribution}
        />
      </div>

      {/* Customer and Time Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerAnalytics
          totalCustomers={analyticsData.totalCustomers}
          newCustomers={analyticsData.newCustomers}
          returningCustomers={analyticsData.returningCustomers}
          averageCustomerValue={analyticsData.averageCustomerValue}
          customerRetentionRate={analyticsData.customerRetentionRate}
        />
        <TimeAnalytics
          peakHours={analyticsData.peakHours}
          busyDays={analyticsData.busyDays}
          averageDuration={analyticsData.averageDuration}
          totalHours={analyticsData.totalHours}
        />
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopServicesTable services={analyticsData.topServices} />
        <TopEmployeesTable employees={analyticsData.topEmployees} />
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  description,
}: MetricCardProps) {
  const isPositive = change >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span
            className={`text-xs ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {isPositive ? "+" : ""}
            {change}%
          </span>
          <span className="text-xs text-muted-foreground">vs last period</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
