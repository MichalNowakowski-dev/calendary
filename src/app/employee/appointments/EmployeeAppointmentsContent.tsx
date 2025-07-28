"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Briefcase,
  Search,
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

interface EmployeeAppointmentsContentProps {
  appointments: AppointmentWithDetails[];
  company: Company;
  user: AuthUser;
}

export function EmployeeAppointmentsContent({
  appointments,
  company,
  user,
}: EmployeeAppointmentsContentProps) {
  const [filteredAppointments, setFilteredAppointments] =
    useState<AppointmentWithDetails[]>(appointments);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const supabase = createClient();

  const formatTime = (time: string) => {
    return time.substring(0, 5);
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

      // Update local state
      setFilteredAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );
    } catch (error) {
      console.error("Error updating appointment status:", error);
      showToast.error("Błąd podczas aktualizacji statusu wizyty");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Filter appointments based on search and filters
  const filterAppointments = useCallback(() => {
    let filtered = [...appointments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          apt.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.service.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    // Date filter
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    if (dateFilter === "today") {
      filtered = filtered.filter((apt) => apt.date === today);
    } else if (dateFilter === "tomorrow") {
      filtered = filtered.filter((apt) => apt.date === tomorrow);
    } else if (dateFilter === "week") {
      filtered = filtered.filter(
        (apt) => apt.date >= today && apt.date <= weekFromNow
      );
    } else if (dateFilter === "upcoming") {
      filtered = filtered.filter((apt) => apt.date >= today);
    } else if (dateFilter === "past") {
      filtered = filtered.filter((apt) => apt.date < today);
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  useEffect(() => {
    filterAppointments();
  }, [filterAppointments]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtry i wyszukiwanie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Szukaj klienta, email lub usługi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status wizyty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie statusy</SelectItem>
                <SelectItem value="booked">Zarezerwowane</SelectItem>
                <SelectItem value="completed">Zakończone</SelectItem>
                <SelectItem value="cancelled">Anulowane</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Okres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie daty</SelectItem>
                <SelectItem value="today">Dzisiaj</SelectItem>
                <SelectItem value="tomorrow">Jutro</SelectItem>
                <SelectItem value="week">Ten tydzień</SelectItem>
                <SelectItem value="upcoming">Nadchodzące</SelectItem>
                <SelectItem value="past">Przeszłe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>Wizyty ({filteredAppointments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Brak wizyt</p>
              <p className="text-sm">
                {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                  ? "Nie znaleziono wizyt odpowiadających filtrom."
                  : "Nie masz jeszcze żadnych wizyt."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
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

                    {appointment.status === "booked" && (
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleStatusChange(appointment.id, "completed")
                          }
                          disabled={updatingStatus === appointment.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Zakończ
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleStatusChange(appointment.id, "cancelled")
                          }
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
