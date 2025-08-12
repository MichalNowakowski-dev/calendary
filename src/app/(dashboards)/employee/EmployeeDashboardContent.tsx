"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Briefcase,
} from "lucide-react";
import type {
  Appointment,
  Company,
  Service,
  Employee,
} from "@/lib/types/database";
import type { AuthUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/lib/toast";

interface AppointmentWithDetails extends Appointment {
  service: Service;
  employee?: Employee;
}

interface EmployeeDashboardContentProps {
  todayAppointments: AppointmentWithDetails[];
  upcomingAppointments: AppointmentWithDetails[];
  assignedServices: Service[];
  company: Company;
  user: AuthUser;
}

export function EmployeeDashboardContent({
  todayAppointments,
  upcomingAppointments,
  assignedServices,
  company,
  user,
}: EmployeeDashboardContentProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const supabase = createClient();

  const formatTime = (time: string) => {
    return time.substring(0, 5); // Remove seconds if present
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "booked":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "booked":
        return "Zarezerwowane";
      case "completed":
        return "Zakończone";
      case "cancelled":
        return "Anulowane";
      default:
        return status;
    }
  };

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: "completed" | "cancelled"
  ) => {
    setUpdatingStatus(appointmentId);
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointmentId);

      if (error) throw error;

      showToast.success(
        `Status wizyty został zaktualizowany na "${getStatusText(newStatus)}"`
      );
    } catch (error) {
      console.error("Error updating appointment status:", error);
      showToast.error("Błąd podczas aktualizacji statusu wizyty");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const renderAppointmentCard = (
    appointment: AppointmentWithDetails,
    isToday: boolean = false
  ) => (
    <div
      key={appointment.id}
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-850 flex flex-col dark:hover:bg-gray-800 dark:bg-gray-900"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
              {appointment.customer_name}
            </h3>
            <Badge className={getStatusColor(appointment.status)}>
              {getStatusText(appointment.status)}
            </Badge>
          </div>

          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>{formatDate(appointment.date)}</span>
            </div>

            <div className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>
                {formatTime(appointment.start_time)} -{" "}
                {formatTime(appointment.end_time)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Briefcase className="h-4 w-4 text-purple-500" />
              <span>
                Usługa:{" "}
                <span className="font-semibold">
                  {appointment.service?.name}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
        {" "}
        {/* Separator for contact info */}
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Dane kontaktowe:
        </p>
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          {appointment.customer_email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{appointment.customer_email}</span>
            </div>
          )}

          {appointment.customer_phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{appointment.customer_phone}</span>
            </div>
          )}
        </div>
      </div>

      {isToday && appointment.status === "booked" && (
        <div className="flex flex-col gap-2 mt-4">
          <Button
            size="sm"
            onClick={() => handleStatusChange(appointment.id, "completed")}
            disabled={updatingStatus === appointment.id}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Zakończ
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange(appointment.id, "cancelled")}
            disabled={updatingStatus === appointment.id}
            className="w-full text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Anuluj
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg dark:from-gray-800 dark:to-gray-900 dark:border dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <User className="h-7 w-7" />
            Witaj, {user.first_name}!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-blue-100">
            Pracujesz w firmie{" "}
            <strong className="text-white">{company.name}</strong>
          </p>
          <p className="text-blue-200 text-sm">
            Dzisiaj masz{" "}
            <span className="font-semibold">{todayAppointments.length}</span>{" "}
            wizyt, a w przyszłości{" "}
            <span className="font-semibold">{upcomingAppointments.length}</span>{" "}
            zaplanowanych.
          </p>
        </CardContent>
      </Card>

      {/* Today's Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Dzisiejsze wizyty ({todayAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {todayAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-60 text-gray-400" />
              <p className="text-lg font-medium">Brak wizyt na dzisiaj</p>
              <p className="text-sm">
                Możesz odpocząć lub zająć się innymi zadaniami!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayAppointments.map((appointment) =>
                renderAppointmentCard(appointment, true)
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <Card className="dark:bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              Nadchodzące wizyty ({upcomingAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingAppointments.map((appointment) =>
                renderAppointmentCard(appointment, false)
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assigned Services */}
      <Card className="dark:bg-gray-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-green-500" />
            Twoje przypisane usługi
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {assignedServices.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
              <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-60 text-gray-400" />
              <p className="text-lg font-medium">Nie masz przypisanych usług</p>
              <p className="text-sm">
                Skontaktuj się z administratorem, aby przypisać usługi.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 dark:bg-gray-900">
              {assignedServices.map((service) => (
                <div
                  key={service.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-850 dark:hover:bg-gray-800 dark:bg-gray-900"
                >
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">
                    {service.name}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      <span className="font-medium">Czas:</span>{" "}
                      {service.duration_minutes} min
                    </p>
                    <p>
                      <span className="font-medium">Cena:</span> {service.price}{" "}
                      zł
                    </p>
                    {service.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {service.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optional Availability Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            Twój harmonogram
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCalendar(!showCalendar)}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {showCalendar ? "Ukryj" : "Pokaż"}
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {showCalendar ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-60 text-gray-400" />
              <p className="text-lg font-medium">Harmonogram dostępności</p>
              <p className="text-sm">
                Funkcja w trakcie rozwoju. Sprawdź zakładkę
                &quot;Harmonogram&quot; w menu.
              </p>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p>Kliknij &quot;Pokaż&quot; aby zobaczyć swój harmonogram</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
