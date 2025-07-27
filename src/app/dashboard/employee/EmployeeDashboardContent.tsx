"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, Mail } from "lucide-react";
import type {
  Appointment,
  Company,
  Service,
  Employee,
} from "@/lib/types/database";
import type { AuthUser } from "@/lib/auth/server";

interface AppointmentWithDetails extends Appointment {
  service: Service;
  employee?: Employee;
}

interface EmployeeDashboardContentProps {
  appointments: AppointmentWithDetails[];
  company: Company;
  user: AuthUser;
}

export function EmployeeDashboardContent({
  appointments,
  company,
  user,
}: EmployeeDashboardContentProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  const formatTime = (time: string) => {
    return time.substring(0, 5); // Remove seconds if present
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
            Dzisiaj masz {appointments.length} wizyt
          </p>
        </CardContent>
      </Card>

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Dzisiejsze wizyty
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Brak wizyt na dzisiaj</p>
              <p className="text-sm">Możesz odpocząć!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
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
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatTime(appointment.start_time)} -{" "}
                            {formatTime(appointment.end_time)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
