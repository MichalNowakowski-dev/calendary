"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  MoreVertical,
  CreditCard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cancelAppointmentClient } from "@/lib/actions/appointments";
import { showToast } from "@/lib/toast";
import PaymentStatusBadge from "@/components/services/PaymentStatusBadge";
import type { CustomerAppointment } from "@/lib/types/customer";

interface CustomerAppointmentCardProps {
  appointment: CustomerAppointment;
  onAppointmentCancelled: () => void;
}

export const CustomerAppointmentCard = ({
  appointment,
  onAppointmentCancelled,
}: CustomerAppointmentCardProps) => {
  const [selectedAppointment, setSelectedAppointment] =
    useState<CustomerAppointment | null>(null);
  const router = useRouter();

  const handleCancelAppointment = async (appointmentId: string) => {
    const result = await cancelAppointmentClient(appointmentId);

    if (result.success) {
      showToast.success(result.message);
      onAppointmentCancelled();
      setSelectedAppointment(null);
    } else {
      showToast.error(result.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("pl-PL", {
      style: "currency",
      currency: "PLN",
    });
  };

  return (
    <>
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base sm:text-lg">
            <span className="truncate">{appointment.service.name}</span>
            <Dialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={() => setSelectedAppointment(appointment)}
                    >
                      Zobacz szczegóły
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DropdownMenuItem
                    onClick={() => handleCancelAppointment(appointment.id)}
                    className="text-red-500"
                  >
                    Anuluj wizytę
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow pt-0">
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{formatDate(appointment.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>
                {formatTime(appointment.start_time)} -{" "}
                {formatTime(appointment.end_time)}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm line-clamp-2">
                {appointment.company.name || "Brak nazwy firmy"},{" "}
                {appointment.company.address_city || "Brak miasta"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 flex-shrink-0" />
              <span>{formatCurrency(appointment.service.price)}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 flex-shrink-0" />
              <PaymentStatusBadge
                status={appointment.payment_status}
                className="text-xs"
              />
            </div>
            {appointment.employee?.name && (
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="truncate">{appointment.employee.name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <Dialog
          open={!!selectedAppointment}
          onOpenChange={(isOpen) => !isOpen && setSelectedAppointment(null)}
        >
          <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Szczegóły wizyty</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <h3 className="font-semibold">
                  {selectedAppointment.service.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  w {selectedAppointment.company.name}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(selectedAppointment.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatTime(selectedAppointment.start_time)} -{" "}
                  {formatTime(selectedAppointment.end_time)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>{formatCurrency(selectedAppointment.service.price)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <PaymentStatusBadge
                  status={selectedAppointment.payment_status}
                  className="text-xs"
                />
              </div>
              {selectedAppointment.employee?.name && (
                <div className="flex items-center gap-2 text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-muted-foreground"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{selectedAppointment.employee.name}</span>
                </div>
              )}
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>
                  {selectedAppointment.company.address_street},{" "}
                  {selectedAppointment.company.address_city}
                </span>
              </div>
              {selectedAppointment.customer_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-muted-foreground"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>{selectedAppointment.customer_phone}</span>
                </div>
              )}
              {selectedAppointment.notes && (
                <div className="flex items-start gap-2 text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-muted-foreground mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-muted-foreground">
                    <strong>Notatki:</strong> {selectedAppointment.notes}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  Rezerwacja utworzona:{" "}
                  {new Date(selectedAppointment.created_at).toLocaleDateString(
                    "pl-PL"
                  )}
                </span>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedAppointment(null)}
                  className="w-full sm:w-auto"
                >
                  Zamknij
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    handleCancelAppointment(selectedAppointment.id)
                  }
                  className="w-full sm:w-auto"
                >
                  Anuluj wizytę
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
