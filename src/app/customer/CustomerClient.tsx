"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth/utils";
import { showToast } from "@/lib/toast";
import PageHeading from "@/components/PageHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  LogOut,
  MoreVertical,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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

interface CustomerAppointment {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  notes: string | null;
  created_at: string;
  service: {
    name: string;
    price: number;
    duration_minutes: number;
  };
  employee?: {
    name: string;
  };
  company: {
    name: string;
    address_street: string | null;
    address_city: string | null;
  };
}

export default function CustomerPanelPage() {
  const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<CustomerAppointment | null>(null);

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        showToast.error("Nie jesteś zalogowany");
        return;
      }

      const supabase = createClient();
      const { data: appointmentsData, error } = await supabase
        .from("appointments")
        .select(
          `
          id,
          date,
          start_time,
          end_time,
          status,
          customer_name,
          customer_email,
          customer_phone,
          notes,
          created_at,
          service:services(name, price, duration_minutes),
          employee:employees(name),
          company:companies(name, address_street, address_city)
        `
        )
        .eq("customer_email", user.email)
        .order("date", { ascending: false })
        .order("start_time", { ascending: false });

      if (error) {
        console.error("Error fetching appointments:", error);
        showToast.error("Błąd podczas ładowania wizyt");
        return;
      }

      if (!appointmentsData) {
        setAppointments([]);
        return;
      }

      const mappedAppointments = appointmentsData
        .map((apt) => {
          return {
            id: apt.id,
            date: apt.date,
            start_time: apt.start_time,
            end_time: apt.end_time,
            status: apt.status,
            customer_name: apt.customer_name,
            customer_email: apt.customer_email,
            customer_phone: apt.customer_phone,
            notes: apt.notes,
            created_at: apt.created_at,
            service: {
              name: apt.service?.[0]?.name ?? "",
              price: apt.service?.[0]?.price ?? 0,
              duration_minutes: apt.service?.[0]?.duration_minutes ?? 0,
            },
            employee: {
              name: apt.employee?.[0]?.name ?? "",
            },
            company: {
              name: apt.company?.[0]?.name ?? "",
              address_street: apt.company?.[0]?.address_street ?? null,
              address_city: apt.company?.[0]?.address_city ?? null,
            },
          };
        })
        .filter((apt) => {
          // Additional filter to ensure we only show appointments for the current user
          const isCurrentUserAppointment = apt.customer_email === user.email;
          return isCurrentUserAppointment;
        });

      setAppointments(mappedAppointments);
    } catch (error) {
      console.error("Error loading customer data:", error);
      showToast.error("Błąd podczas ładowania danych");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", appointmentId);

    if (error) {
      showToast.error("Błąd podczas anulowania wizyty");
    } else {
      showToast.success("Wizyta została anulowana");
      loadCustomerData();
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

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "booked" && new Date(apt.date) >= new Date()
  );
  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.date) < new Date() || apt.status !== "booked"
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="space-y-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Wyloguj się
            </Button>
          </div>

          {/* Upcoming Appointments */}
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-6">
              Nadchodzące wizyty
            </h2>
            {upcomingAppointments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id} className="flex flex-col h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                        <span className="truncate">
                          {appointment.service.name}
                        </span>
                        <Dialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={() =>
                                    setSelectedAppointment(appointment)
                                  }
                                >
                                  Zobacz szczegóły
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleCancelAppointment(appointment.id)
                                }
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
                          <span className="truncate">
                            {formatDate(appointment.date)}
                          </span>
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
                          <span>
                            {formatCurrency(appointment.service.price)}
                          </span>
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
                            <span className="truncate">
                              {appointment.employee.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
                    <span>
                      {formatCurrency(selectedAppointment.service.price)}
                    </span>
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
                      {new Date(
                        selectedAppointment.created_at
                      ).toLocaleDateString("pl-PL")}
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
        </div>
      </div>
    </div>
  );
}
