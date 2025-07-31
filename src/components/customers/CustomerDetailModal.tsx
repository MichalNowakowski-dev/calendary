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
import { getCustomerAppointments } from "@/lib/actions/customers";
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
    if (!customer) return;

    setIsLoading(true);
    try {
      const customerAppointments = await getCustomerAppointments(
        customer.id,
        companyId
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

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Szczegóły klienta
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{customer.name}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(customer)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edytuj
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{customer.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Klient od: {formatDate(customer.created_at)}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Wizyty: {appointments.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Wydane: {formatCurrency(totalSpent)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Zakończone: {completedAppointments}
                    </span>
                  </div>
                </div>
              </div>
              {customer.notes && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Notatki:</strong> {customer.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointments History */}
          <Card>
            <CardHeader>
              <CardTitle>Historia wizyt</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Ładowanie historii...
                  </p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Brak historii wizyt dla tego klienta
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Godzina</TableHead>
                        <TableHead>Usługa</TableHead>
                        <TableHead>Pracownik</TableHead>
                        <TableHead>Cena</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{formatDate(appointment.date)}</TableCell>
                          <TableCell>
                            {formatTime(appointment.start_time)} -{" "}
                            {formatTime(appointment.end_time)}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {appointment.service.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            {appointment.employee?.name || "Nie przypisano"}
                          </TableCell>
                          <TableCell>
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
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
