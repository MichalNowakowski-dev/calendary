"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Edit,
  Phone,
  Mail,
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
import AppointmentEditForm from "@/components/services/AppointmentEditForm";
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
  const [editingAppointment, setEditingAppointment] =
    useState<AppointmentWithDetails | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
    }
  };

  const handleEditAppointment = (appointment: AppointmentWithDetails) => {
    setEditingAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingAppointment(null);
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
          apt.id === appointmentId
            ? { ...apt, status: newStatus as Appointment["status"] }
            : apt
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
              className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-500 dark:hover:border-l-blue-400"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-6">
                  {/* Main appointment info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Status indicator */}
                    <div className="flex-shrink-0 mt-1 flex items-center gap-2">
                      <div className="relative">
                        {getStatusIcon(appointment.status)}
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-current rounded-full animate-pulse"></div>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          appointment.status
                        )} flex-shrink-0`}
                      >
                        {getStatusText(appointment.status)}
                      </span>
                    </div>

                    {/* Appointment details */}
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Header with customer name and status */}
                      <div className="">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {appointment.customer_name}
                        </h3>
                      </div>

                      {/* Service and time details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                              {appointment.customer_email}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                              {appointment.customer_phone}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                              {formatDate(appointment.date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {appointment.start_time} •{" "}
                              {appointment.service.duration_minutes} min
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-4 w-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                              <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                              {appointment.service.name}
                            </span>
                          </div>
                          {appointment.employee && (
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">
                                {appointment.employee.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price and actions */}
                  <div className="flex flex-col items-end gap-4">
                    {/* Price */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {appointment.service.price.toFixed(2)} zł
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Cena usługi
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {appointment.status === "booked" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStatusChange(appointment.id, "completed")
                            }
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 dark:border-green-800"
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
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Anuluj
                          </Button>
                        </>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditAppointment(appointment)}
                        className="text-gray-300 hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-400/20 border-gray-200 dark:border-gray-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Appointment Modal */}
      {editingAppointment && company && (
        <AppointmentEditForm
          appointment={editingAppointment}
          company={company}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onAppointmentUpdated={loadAppointments}
        />
      )}
    </div>
  );
}
