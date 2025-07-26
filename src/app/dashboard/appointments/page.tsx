"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  Plus,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser, getUserCompanies } from "@/lib/auth/utils";
import type {
  Appointment,
  Service,
  Employee,
  Company,
} from "@/lib/types/database";
import { showToast } from "@/lib/toast";
import AppointmentForm from "@/components/services/AppointmentForm";
import PageHeading from "@/components/PageHeading";

interface AppointmentWithDetails extends Appointment {
  service: Service;
  employee?: Employee;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>(
    []
  );
  const [filteredAppointments, setFilteredAppointments] = useState<
    AppointmentWithDetails[]
  >([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const supabase = createClient();

  const loadAppointments = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      // Get user's company
      const companies = await getUserCompanies(user.id);
      if (companies.length === 0) return;

      const userCompany = companies[0]?.company as unknown as Company;
      setCompany(userCompany);

      // Get appointments with service and employee details
      const { data: appointmentsData, error } = await supabase
        .from("appointments")
        .select(
          `
          *,
          service:services(
            id,
            name,
            duration_minutes,
            price
          ),
          employee:employees(
            id,
            name
          )
        `
        )
        .eq("company_id", userCompany.id)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;

      setAppointments((appointmentsData as AppointmentWithDetails[]) || []);
      setFilteredAppointments(
        (appointmentsData as AppointmentWithDetails[]) || []
      );
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Filter appointments based on search and filters
  useEffect(() => {
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
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500 mt-0.5" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500 mt-0.5" />;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: string
  ) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointmentId);

      if (error) throw error;

      // Update local state
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: newStatus as any } : apt
        )
      );
      showToast.success("Status wizyty został zaktualizowany");
    } catch (error) {
      console.error("Error updating appointment status:", error);
      showToast.error("Błąd podczas aktualizacji statusu wizyty");
    }
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"
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
      <div className="flex items-center justify-between">
        <PageHeading
          text="Kalendarz wizyt"
          description={`Zarządzaj wizytami w firmie ${company?.name}`}
        />
        {company && (
          <AppointmentForm
            company={company}
            onAppointmentCreated={loadAppointments}
          />
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <Input
                placeholder="Szukaj klienta lub usługi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="all">Wszystkie statusy</option>
              <option value="booked">Zarezerwowane</option>
              <option value="completed">Zakończone</option>
              <option value="cancelled">Anulowane</option>
            </select>

            {/* Date filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="all">Wszystkie daty</option>
              <option value="today">Dzisiaj</option>
              <option value="tomorrow">Jutro</option>
              <option value="week">Ten tydzień</option>
              <option value="upcoming">Nadchodzące</option>
            </select>

            {/* Results count */}
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Filter className="h-4 w-4 mr-2" />
              {filteredAppointments.length} wizyt
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments list */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Brak wizyt
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                    ? "Nie znaleziono wizyt odpowiadających filtrom."
                    : "Nie masz jeszcze żadnych wizyt w systemie."}
                </p>
                {company && (
                  <AppointmentForm
                    company={company}
                    onAppointmentCreated={loadAppointments}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card
              key={appointment.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {/* Appointment info */}
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {getStatusIcon(appointment.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {appointment.customer_name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {appointment.customer_email}
                          {appointment.customer_phone && (
                            <span className="ml-2">
                              • {appointment.customer_phone}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(appointment.date)} o{" "}
                          {appointment.start_time}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {appointment.service.name} (
                          {appointment.service.duration_minutes} min)
                          {appointment.employee && (
                            <span className="ml-2">
                              • {appointment.employee.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <div className="text-right mr-4">
                      <div className="text-lg font-semibold text-gray-900">
                        {appointment.service.price.toFixed(2)} zł
                      </div>
                    </div>

                    {appointment.status === "booked" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleStatusChange(appointment.id, "completed")
                          }
                          className="text-green-600 hover:text-green-700"
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
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Anuluj
                        </Button>
                      </>
                    )}

                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
