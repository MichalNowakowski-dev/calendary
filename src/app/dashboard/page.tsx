"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser, getUserCompanies } from "@/lib/auth/utils";
import type { Appointment, Service, Company } from "@/lib/types/database";
import Link from "next/link";
import PageHeading from "@/components/PageHeading";

interface DashboardStats {
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) return;

        // Get user's company
        const companies = await getUserCompanies(user.id);
        if (companies.length === 0) return;

        const userCompany = companies[0]?.company as unknown as Company;
        setCompany(userCompany);

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
          supabase
            .from("employees")
            .select("*")
            .eq("company_id", userCompany.id),

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

        setStats({
          totalAppointments: appointments.length,
          todayAppointments,
          totalServices: services.length,
          totalEmployees: employees.length,
          recentAppointments: recentAppointments as unknown as Appointment[],
          popularServices: serviceStats.slice(0, 3),
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Zakończona";
      case "cancelled":
        return "Anulowana";
      case "booked":
        return "Zarezerwowana";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <PageHeading
        text="Panel główny"
        description={`Witaj w panelu zarządzania firmą ${company?.name}`}
      />

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Wszystkie wizyty
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalAppointments || 0}
            </div>
            <p className="text-xs text-muted-foreground">Łączna liczba wizyt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dzisiejsze wizyty
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.todayAppointments || 0}
            </div>
            <p className="text-xs text-muted-foreground">Wizyty na dzisiaj</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usługi</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalServices || 0}
            </div>
            <p className="text-xs text-muted-foreground">Aktywne usługi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pracownicy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalEmployees || 0}
            </div>
            <p className="text-xs text-muted-foreground">Zespół pracowników</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent appointments and popular services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Ostatnie wizyty</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentAppointments &&
            stats.recentAppointments.length > 0 ? (
              <div className="space-y-3">
                {stats.recentAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(appointment.status)}
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {appointment.customer_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {appointment.service?.name}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Brak ostatnich wizyt
              </p>
            )}
          </CardContent>
        </Card>

        {/* Popular services */}
        <Card>
          <CardHeader>
            <CardTitle>Popularne usługi</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.popularServices && stats.popularServices.length > 0 ? (
              <div className="space-y-3">
                {stats.popularServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {service.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {service.appointment_count} wizyt
                      </p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Brak danych o popularnych usługach
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Szybkie akcje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/dashboard/services">
                <Briefcase className="h-6 w-6 mb-2" />
                Dodaj nową usługę
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/dashboard/employees">
                <Users className="h-6 w-6 mb-2" />
                Dodaj pracownika
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/dashboard/settings">
                <Calendar className="h-6 w-6 mb-2" />
                Ustawienia kalendarza
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
