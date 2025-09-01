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
  User,
  MapPin,
  Euro,
  Timer,
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
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Ostatnie wizyty
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentAppointments && stats.recentAppointments.length > 0 ? (
              <div className="space-y-4">
                {stats.recentAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 dark:border-gray-700 p-5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="space-y-4">
                      {/* Customer name as main heading */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {appointment.customer_name}
                        </h3>
                        <AppointmentStatus status={appointment.status} />
                      </div>

                      {/* Appointment details with labels */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              Termin:
                            </span>
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300 font-medium ml-6">
                            {appointment.start_time} - {appointment.end_time}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-green-500" />
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              Usługa:
                            </span>
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300 font-medium ml-6">
                            {appointment.service?.name}
                          </div>
                        </div>

                        {appointment.employee && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-purple-500" />
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Pracownik:
                              </span>
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300 font-medium ml-6">
                              {appointment.employee.name}
                            </div>
                          </div>
                        )}

                        {appointment.payment_status && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Euro className="h-4 w-4 text-orange-500" />
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Płatność:
                              </span>
                            </div>
                            <div className="ml-6">
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  appointment.payment_status === "paid"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : appointment.payment_status === "pending"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                }`}
                              >
                                {appointment.payment_status === "paid"
                                  ? "Opłacona"
                                  : appointment.payment_status === "pending"
                                    ? "Oczekująca"
                                    : "Nieopłacona"}
                              </span>
                            </div>
                          </div>
                        )}
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
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Popularne usługi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.popularServices && stats.popularServices.length > 0 ? (
              <div className="space-y-4">
                {stats.popularServices.map((service, index) => (
                  <div
                    key={service.id}
                    className="border border-gray-200 dark:border-gray-700 p-5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="space-y-4">
                      {/* Service name as main heading with ranking */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : index === 1
                                  ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                  : index === 2
                                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {service.name}
                          </h3>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            index === 0
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                          }`}
                        >
                          {index === 0 ? "Najpopularniejsza" : `#${index + 1}`}
                        </div>
                      </div>

                      {/* Service details with labels */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              Liczba wizyt:
                            </span>
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300 font-medium ml-6">
                            {service.appointment_count} wizyt
                          </div>
                        </div>

                        {service.price && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Euro className="h-4 w-4 text-green-500" />
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Cena:
                              </span>
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300 font-medium ml-6">
                              {service.price} zł
                            </div>
                          </div>
                        )}

                        {service.duration_minutes && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Timer className="h-4 w-4 text-purple-500" />
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Czas trwania:
                              </span>
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300 font-medium ml-6">
                              {service.duration_minutes} min
                            </div>
                          </div>
                        )}

                        {service.description && (
                          <div className="space-y-2 md:col-span-2">
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-gray-500" />
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Opis:
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 ml-6 line-clamp-2">
                              {service.description}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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
