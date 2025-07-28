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

      // Update local state instead of refreshing
      const updatedAppointments = todayAppointments.map((apt) =>
        apt.id === appointmentId ? { ...apt, status: newStatus } : apt
      );

      // Note: In a real app, you'd want to update the parent component state
      // For now, we'll just show the success message
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
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {appointment.customer_name}
            </h3>
            <Badge className={getStatusColor(appointment.status)}>
              {getStatusText(appointment.status)}
            </Badge>
          </div>

          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(appointment.date)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {formatTime(appointment.start_time)} -{" "}
                {formatTime(appointment.end_time)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>Usługa: {appointment.service?.name}</span>
            </div>

            {appointment.customer_email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{appointment.customer_email}</span>
              </div>
            )}

            {appointment.customer_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{appointment.customer_phone}</span>
              </div>
            )}
          </div>
        </div>

        {isToday && appointment.status === "booked" && (
          <div className="flex flex-col gap-2 ml-4">
            <Button
              size="sm"
              onClick={() => handleStatusChange(appointment.id, "completed")}
              disabled={updatingStatus === appointment.id}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Zakończ
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange(appointment.id, "cancelled")}
              disabled={updatingStatus === appointment.id}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Anuluj
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Witaj, {user.first_name}!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            Pracujesz w firmie <strong>{company.name}</strong>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Dzisiaj masz {todayAppointments.length} wizyt, a w przyszłości{" "}
            {upcomingAppointments.length} zaplanowanych
          </p>
        </CardContent>
      </Card>

      {/* Assigned Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Twoje przypisane usługi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignedServices.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nie masz przypisanych usług</p>
              <p className="text-sm">Skontaktuj się z administratorem</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedServices.map((service) => (
                <div
                  key={service.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {service.name}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>Czas: {service.duration_minutes} min</p>
                    <p>Cena: {service.price} zł</p>
                    {service.description && (
                      <p className="text-xs">{service.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Dzisiejsze wizyty ({todayAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Brak wizyt na dzisiaj</p>
              <p className="text-sm">Możesz odpocząć!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((appointment) =>
                renderAppointmentCard(appointment, true)
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Nadchodzące wizyty ({upcomingAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) =>
                renderAppointmentCard(appointment, false)
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optional Availability Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Twój harmonogram
            </span>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {showCalendar ? "Ukryj" : "Pokaż"}
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showCalendar ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Harmonogram dostępności</p>
              <p className="text-sm">Funkcja w trakcie rozwoju</p>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p>Kliknij "Pokaż" aby zobaczyć swój harmonogram</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
