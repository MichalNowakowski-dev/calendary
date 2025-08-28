import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  User,
  MapPin,
  DollarSign,
  Edit,
  X,
} from "lucide-react";
import type { Customer } from "@/lib/types/database";
import { getCustomerAppointments } from "@/lib/actions/appointments";
import { showToast } from "@/lib/toast";

interface CustomerDetailModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  companyId: string;
}

interface CustomerAppointment {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  service: {
    name: string;
    price: number;
  };
  employee?: {
    name: string;
  };
}

export default function CustomerDetailModal({
  customer,
  isOpen,
  onClose,
  onEdit,
  companyId,
}: CustomerDetailModalProps) {
  const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && customer) {
      loadCustomerAppointments();
    }
  }, [isOpen, customer]);

  const loadCustomerAppointments = async () => {
    setIsLoading(true);
    try {
      if (!customer) return;
      const customerAppointments = await getCustomerAppointments(
        customer.email
      );
      setAppointments(customerAppointments);
    } catch (error) {
      console.error("Error loading customer appointments:", error);
      showToast.error("Błąd podczas ładowania historii wizyt");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL");
  };

  const formatTime = (timeString: string) => {
    return timeString;
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

  const totalSpent = appointments.reduce((sum, apt) => {
    return apt.status === "completed" ? sum + apt.service.price : sum;
  }, 0);

  const completedAppointments = appointments.filter(
    (apt) => apt.status === "completed"
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[60vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Szczegóły klienta
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          {!customer ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <div className="bg-muted/50 rounded-full p-6 w-fit mx-auto">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-muted-foreground">
                    Brak danych klienta
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Nie można wyświetlić szczegółów wybranego klienta
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 p-6">
              {/* Customer Header Card */}
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <div className="bg-primary/10 rounded-full p-2">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        {customer.name}
                      </CardTitle>
                      <p className="text-muted-foreground">
                        Szczegóły profilu klienta
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(customer)}
                      className="hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edytuj
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Contact Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Dane kontaktowe
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <Mail className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm font-medium">
                            {customer.email}
                          </span>
                        </div>
                        {customer.phone ? (
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Phone className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-sm font-medium">
                              {customer.phone}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-muted/10 rounded-lg border border-dashed">
                            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm text-muted-foreground">
                              Brak numeru telefonu
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <Calendar className="h-4 w-4 text-primary shrink-0" />
                          <div className="space-y-0.5">
                            <span className="text-sm font-medium">
                              Klient od
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(customer.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Statystyki
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-500/10 rounded-full p-2">
                              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                Łączne wizyty
                              </p>
                              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                                {appointments.length}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <div className="bg-green-500/10 rounded-full p-2">
                              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                Łącznie wydane
                              </p>
                              <p className="text-lg font-bold text-green-700 dark:text-green-300">
                                {formatCurrency(totalSpent)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-500/10 rounded-full p-2">
                              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Zakończone</p>
                              <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                                {completedAppointments}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {customer.notes && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Notatki
                      </h4>
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <div className="flex gap-3">
                          <div className="bg-amber-500/10 rounded-full p-1 shrink-0 mt-0.5">
                            <MapPin className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                          </div>
                          <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                            {customer.notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Appointments History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Historia wizyt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center space-y-4">
                        <div className="bg-muted/50 rounded-full p-4 w-fit mx-auto">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-medium">
                            Ładowanie historii wizyt
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Pobieranie danych o wizytach klienta...
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : appointments.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center space-y-4">
                        <div className="bg-muted/50 rounded-full p-6 w-fit mx-auto">
                          <Calendar className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-medium text-muted-foreground">
                            Brak historii wizyt
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Ten klient nie ma jeszcze żadnych zarezerwowanych
                            wizyt
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Wyświetlane {appointments.length} wizyt
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/30">
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="font-medium">
                                Data
                              </TableHead>
                              <TableHead className="font-medium">
                                Godzina
                              </TableHead>
                              <TableHead className="font-medium">
                                Usługa
                              </TableHead>
                              <TableHead className="font-medium">
                                Pracownik
                              </TableHead>
                              <TableHead className="font-medium">
                                Cena
                              </TableHead>
                              <TableHead className="font-medium">
                                Status
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {appointments.map((appointment, index) => (
                              <TableRow
                                key={appointment.id}
                                className="hover:bg-muted/20 transition-colors"
                              >
                                <TableCell className="font-medium">
                                  {formatDate(appointment.date)}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(appointment.start_time)} -{" "}
                                    {formatTime(appointment.end_time)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">
                                    {appointment.service.name}
                                  </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {appointment.employee?.name || (
                                    <span className="italic">
                                      Nie przypisano
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {formatCurrency(appointment.service.price)}
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
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
