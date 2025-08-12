"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

import type {
  Appointment,
  Service,
  Employee,
  Company,
} from "@/lib/types/database";
import { showToast } from "@/lib/toast";
import AppointmentEditForm from "@/components/services/AppointmentEditForm";
import PaymentStatusBadge from "@/components/services/PaymentStatusBadge";
import PaymentStatusButton from "@/components/services/PaymentStatusButton";
import { updateAppointmentStatusAction } from "@/lib/actions/appointments";

interface AppointmentWithDetails extends Appointment {
  service: Service;
  employee?: Employee;
}

interface AppointmentsClientProps {
  appointments: AppointmentWithDetails[];
  company: Company;
  searchParams: {
    search?: string;
    status?: string;
    date?: string;
  };
}

export default function AppointmentsClient({
  appointments,
  company,
  searchParams,
}: AppointmentsClientProps) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const [editingAppointment, setEditingAppointment] =
    useState<AppointmentWithDetails | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);



  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParamsHook.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`/dashboard/appointments?${params.toString()}`);
  };

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
    newStatus: "booked" | "cancelled" | "completed"
  ) => {
    try {
      const result = await updateAppointmentStatusAction(appointmentId, newStatus);
      
      if (result.success) {
        showToast.success(result.message);
        router.refresh(); // Refresh the page to get updated data
      } else {
        showToast.error(result.message);
      }
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

  return (
    <>
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <Input
                placeholder="Szukaj klienta lub usługi..."
                value={searchParams.search || ""}
                onChange={(e) => updateSearchParams({ search: e.target.value })}
                className="pl-10"
              />
            </div>

            {/* Status filter */}
            <select
              value={searchParams.status || "all"}
              onChange={(e) => updateSearchParams({ status: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="all">Wszystkie statusy</option>
              <option value="booked">Zarezerwowane</option>
              <option value="completed">Zakończone</option>
              <option value="cancelled">Anulowane</option>
            </select>

            {/* Date filter */}
            <select
              value={searchParams.date || "all"}
              onChange={(e) => updateSearchParams({ date: e.target.value })}
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
              {appointments.length} wizyt
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments list */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Brak wizyt
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {searchParams.search || searchParams.status !== "all" || searchParams.date !== "all"
                    ? "Nie znaleziono wizyt odpowiadających filtrom."
                    : "Nie masz jeszcze żadnych wizyt w systemie."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          appointments.map((appointment) => (
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
                          {/* Payment Status */}
                          <div className="flex items-center gap-2 text-sm">
                            <PaymentStatusBadge
                              status={appointment.payment_status}
                              className="text-xs"
                            />
                          </div>
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

                      {/* Payment Status Button */}
                      <PaymentStatusButton
                        appointmentId={appointment.id}
                        currentStatus={appointment.payment_status}
                        onStatusUpdate={() => router.refresh()}
                      />

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
      {editingAppointment && (
        <AppointmentEditForm
          appointment={editingAppointment}
          company={company}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onAppointmentUpdated={() => router.refresh()}
        />
      )}
    </>
  );
} 