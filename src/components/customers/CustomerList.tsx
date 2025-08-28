import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  User,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import type { Customer } from "@/lib/types/database";
import { showToast } from "@/lib/toast";
import CustomerDetailModal from "./CustomerDetailModal";
import CustomerEditModal from "./CustomerEditModal";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { deleteCustomer } from "@/lib/actions/customers";

interface CustomerWithStats extends Customer {
  appointment_count: number;
  last_visit: string | null;
  total_spent: number;
}

interface CustomerListProps {
  customers: CustomerWithStats[];
  onRefresh: () => void;
  isLoading: boolean;
  companyId: string;
}

export default function CustomerList({
  customers,
  onRefresh,
  companyId,
}: CustomerListProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerWithStats | null>(null);

  const handleViewCustomer = (customer: CustomerWithStats) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  const handleEditCustomer = (customer: CustomerWithStats) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleDeleteCustomer = (customer: CustomerWithStats) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCustomer = async () => {
    if (!customerToDelete) return;

    try {
      await deleteCustomer(customerToDelete.id);
      showToast.success("Klient został usunięty");
      onRefresh();
    } catch (error) {
      console.error("Error deleting customer:", error);
      showToast.error("Błąd podczas usuwania klienta");
    }
  };

  const handleEditSuccess = () => {
    onRefresh();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Brak wizyt";
    return new Date(dateString).toLocaleDateString("pl-PL");
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("pl-PL", {
      style: "currency",
      currency: "PLN",
    });
  };

  if (customers.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Brak klientów
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Klienci będą automatycznie dodawani podczas rezerwacji wizyt.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={(customer) => handleEditCustomer(customer as CustomerWithStats)}
        companyId={companyId}
      />
      {/* Customer Edit Modal */}
      <CustomerEditModal
        customer={selectedCustomer}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteCustomer}
        title="Usuń klienta"
        description={`Czy na pewno chcesz usunąć klienta "${customerToDelete?.name}"? Tej operacji nie można cofnąć.`}
        confirmText="Usuń"
        cancelText="Anuluj"
        variant="destructive"
      />
    <Card>
      <CardHeader>
        <CardTitle>Lista klientów ({customers.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Klient</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Wizyty</TableHead>
                <TableHead>Ostatnia wizyta</TableHead>
                <TableHead>Wydane</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Dodano:{" "}
                        {new Date(customer.created_at).toLocaleDateString(
                          "pl-PL"
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      <Calendar className="h-3 w-3 mr-1" />
                      {customer.appointment_count} wizyt
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {formatDate(customer.last_visit)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatCurrency(customer.total_spent)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Otwórz menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewCustomer(customer)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Zobacz szczegóły
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditCustomer(customer)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edytuj
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteCustomer(customer)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Usuń
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
