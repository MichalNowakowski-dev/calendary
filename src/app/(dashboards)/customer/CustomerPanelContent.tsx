"use client";

import { useState } from "react";
import PageHeading from "@/components/PageHeading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import {
  CustomerAppointmentCard,
  CustomerLogoutButton,
  CustomerRefreshButton,
} from "@/components/customer";
import type { CustomerAppointment } from "@/lib/types/customer";

interface CustomerPanelContentProps {
  appointments: CustomerAppointment[];
}

export const CustomerPanelContent = ({
  appointments,
}: CustomerPanelContentProps) => {
  const [currentAppointments, setCurrentAppointments] = useState(appointments);

  const handleAppointmentCancelled = () => {
    // This will trigger a page refresh to get updated data
    window.location.reload();
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Zakończona</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Anulowana</Badge>;
      case "booked":
        return <Badge variant="secondary">Zarezerwowana</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const upcomingAppointments = currentAppointments.filter(
    (apt) => apt.status === "booked" && new Date(apt.date) >= new Date()
  );
  const pastAppointments = currentAppointments.filter(
    (apt) => new Date(apt.date) < new Date() || apt.status !== "booked"
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <PageHeading
              text="Panel klienta"
              description="Zarządzaj swoimi rezerwacjami i wizytami"
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={() => (window.location.href = "/customer/booking")}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Zarezerwuj wizytę
              </Button>
              <CustomerRefreshButton />
              <CustomerLogoutButton />
            </div>
          </div>

          {/* Upcoming Appointments */}
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-6">
              Nadchodzące wizyty
            </h2>
            {upcomingAppointments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {upcomingAppointments.map((appointment) => (
                  <CustomerAppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onAppointmentCancelled={handleAppointmentCancelled}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Brak nadchodzących wizyt.
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/customer/booking")}
                    className="w-full sm:w-auto"
                  >
                    Zarezerwuj nową wizytę
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Appointments History */}
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-6">
              Historia wizyt
            </h2>
            <Card>
              <CardContent className="pt-6">
                {pastAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Brak historii wizyt.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[120px]">
                              Data
                            </TableHead>
                            <TableHead className="min-w-[150px]">
                              Firma
                            </TableHead>
                            <TableHead className="min-w-[150px]">
                              Usługa
                            </TableHead>
                            <TableHead className="min-w-[100px]">
                              Cena
                            </TableHead>
                            <TableHead className="min-w-[120px]">
                              Pracownik
                            </TableHead>
                            <TableHead className="min-w-[100px]">
                              Status
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pastAppointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell>
                                <div className="font-medium text-sm">
                                  {formatDate(appointment.date)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatTime(appointment.start_time)}
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[150px]">
                                <div className="truncate">
                                  {appointment.company.name}
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[150px]">
                                <div className="truncate">
                                  {appointment.service.name}
                                </div>
                              </TableCell>
                              <TableCell>
                                {formatCurrency(appointment.service.price)}
                              </TableCell>
                              <TableCell className="max-w-[120px]">
                                <div className="truncate">
                                  {appointment.employee?.name || "-"}
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(appointment.status)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};
