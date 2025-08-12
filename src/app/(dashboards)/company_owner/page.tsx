import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  Briefcase,
  TrendingUp,
  Clock,
  Shield,
} from "lucide-react";
import Link from "next/link";
import PageHeading from "@/components/PageHeading";
import { AppointmentStatus } from "./components";
import { getDashboardData } from "@/lib/actions/dashboard";
import { serverAuth } from "@/lib/auth/server";
import { getUserRoleInCompany } from "@/lib/auth/server";

// Force dynamic rendering since we use cookies for authentication
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { stats, company } = await getDashboardData();

  if (!stats || !company) {
    notFound();
  }

  // Get current user and their role
  const user = await serverAuth.getCurrentUser();
  const userRole = user
    ? await getUserRoleInCompany(user.id, company.id)
    : null;
  const isAdmin = userRole === "admin";
  const isOwner = userRole === "company_owner";

  return (
    <div className="space-y-6">
      {/* Page header */}
      <PageHeading
        text="Panel główny"
        description={`Witaj w panelu zarządzania firmą ${company.name}`}
      />

      {/* Role indicator */}
      {isAdmin && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Panel administratora - ograniczone uprawnienia
              </span>
            </div>
          </CardContent>
        </Card>
      )}

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
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
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
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">Wizyty na dzisiaj</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usługi</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalServices}</div>
            <p className="text-xs text-muted-foreground">Aktywne usługi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pracownicy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
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
            {stats.recentAppointments && stats.recentAppointments.length > 0 ? (
              <div className="space-y-3">
                {stats.recentAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <AppointmentStatus status={appointment.status} />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {appointment.customer_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {appointment.service?.name}
                        </p>
                      </div>
                    </div>
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
            {stats.popularServices && stats.popularServices.length > 0 ? (
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

      {/* Quick actions - different for admin vs owner */}
      <Card>
        <CardHeader>
          <CardTitle>Szybkie akcje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isOwner ? (
              // Owner actions - full access
              <>
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
              </>
            ) : (
              // Admin actions - limited access
              <>
                <Button variant="outline" className="h-20 flex-col" asChild>
                  <Link href="/dashboard/appointments">
                    <Calendar className="h-6 w-6 mb-2" />
                    Zarządzaj wizytami
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col" asChild>
                  <Link href="/dashboard/customers">
                    <Users className="h-6 w-6 mb-2" />
                    Lista klientów
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col" asChild>
                  <Link href="/dashboard/employees">
                    <Shield className="h-6 w-6 mb-2" />
                    Zarządzaj pracownikami
                  </Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
