"use client";

import { useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Users, UserCheck, Edit, Trash2 } from "lucide-react";
import ServiceForm from "./ServiceForm";
import EmployeeAssignment from "./EmployeeAssignment";
import type {
  Service,
  Employee,
  ServiceWithEmployees,
} from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";
import { showToast, showConfirmToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import ServiceStatusBtn from "./ServiceStatusBtn";

interface ServicesData {
  services: ServiceWithEmployees[];
  employees: Employee[];
  company: {
    id: string;
    name: string;
  };
}

interface ServicesClientProps {
  dataPromise: Promise<ServicesData>;
}

export default function ServicesClient({ dataPromise }: ServicesClientProps) {
  const { services, employees, company } = use(dataPromise);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [assigningEmployees, setAssigningEmployees] =
    useState<ServiceWithEmployees | null>(null);

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowAddForm(true);
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    setEditingService(null);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingService(null);
  };

  const handleAssignEmployees = (service: ServiceWithEmployees) => {
    setAssigningEmployees(service);
  };

  const handleEmployeeAssignmentUpdate = () => {
    setAssigningEmployees(null);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}

      <div className="flex items-center justify-between">
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj usługę
        </Button>
      </div>

      {/* Add/Edit form */}
      {showAddForm && (
        <ServiceForm
          service={editingService}
          companyId={company.id}
          onSuccess={handleFormSuccess}
          onCancel={handleCancel}
        />
      )}

      {/* Services grid */}
      {services.length === 0 ? (
        <div className="text-center py-12">
          <div className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Brak usług
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Zacznij od dodania pierwszej usługi do swojej oferty.
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj pierwszą usługę
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              employees={employees}
              companyId={company.id}
              onEdit={handleEdit}
              onAssignEmployees={handleAssignEmployees}
            />
          ))}
        </div>
      )}

      {/* Employee Assignment Modal */}
      {assigningEmployees && (
        <EmployeeAssignment
          serviceId={assigningEmployees.id}
          serviceName={assigningEmployees.name}
          assignedEmployees={
            assigningEmployees.employee_services?.map((es) => es.employee) || []
          }
          allEmployees={employees}
          companyId={company.id}
          onClose={() => setAssigningEmployees(null)}
          onUpdate={() => handleEmployeeAssignmentUpdate()}
        />
      )}
    </div>
  );
}

interface ServiceCardProps {
  service: ServiceWithEmployees;
  employees: Employee[];
  companyId: string;
  onEdit: (service: Service) => void;
  onAssignEmployees: (service: ServiceWithEmployees) => void;
}

function ServiceCard({ service, onEdit, onAssignEmployees }: ServiceCardProps) {
  const assignedEmployees =
    service.employee_services?.map((es) => es.employee) || [];
  const router = useRouter();
  const supabase = createClient();

  const deleteService = async () => {
    showConfirmToast(
      `Czy na pewno chcesz usunąć usługę "${service.name}"?`,
      async () => {
        try {
          const { error } = await supabase
            .from("services")
            .delete()
            .eq("id", service.id);

          if (error) throw error;

          showToast.success("Usługa została usunięta");

          // Refresh the page to show updated data
          router.refresh();
        } catch (error) {
          console.error("Error deleting service:", error);
          showToast.error("Błąd podczas usuwania usługi");
        }
      }
    );
  };

  const toggleServiceStatus = async () => {
    try {
      const { error } = await supabase
        .from("services")
        .update({ active: !service.active })
        .eq("id", service.id);

      if (error) throw error;

      showToast.success(
        `Usługa została ${service.active ? "dezaktywowana" : "aktywowana"}`
      );

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error("Error toggling service status:", error);
      showToast.error("Błąd podczas zmiany statusu usługi");
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm ${
        !service.active ? "opacity-50" : ""
      }`}
    >
      <div className="p-4 sm:p-6">
        <div className="flex flex-col items-center gap-3 mb-4 ">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 break-words">
            {service.name}
          </h3>
          <div className="flex gap-2 w-full">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAssignEmployees(service)}
              className="flex items-center text-xs sm:text-sm flex-1"
            >
              <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Pracownicy</span>
              <span className="sm:hidden">Prac.</span>
            </Button>
            <ServiceStatusBtn
              service={service}
              onToggle={toggleServiceStatus}
              className="flex-1"
            />
          </div>
        </div>

        {service.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {service.description}
          </p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <span className="w-4 h-4 mr-2">🕐</span>
            {service.duration_minutes} minut
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <span className="w-4 h-4 mr-2">💰</span>
            {service.price.toFixed(2)} zł
          </div>
        </div>

        {/* Assigned Employees */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-500 dark:text-gray-400" />
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Przypisani pracownicy ({assignedEmployees.length})
            </span>
          </div>
          <div className="space-y-1">
            {assignedEmployees.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Brak przypisanych pracowników
              </p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {assignedEmployees.slice(0, 3).map((employee) => (
                  <div
                    key={employee.id}
                    className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                  >
                    {employee.name}
                  </div>
                ))}
              </div>
            )}
            {assignedEmployees.length > 3 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                +{assignedEmployees.length - 3} więcej
              </p>
            )}
          </div>
        </div>

        {/* Bottom action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-4 border-t dark:border-gray-700 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit?.(service)}
            className="flex-1 text-xs sm:text-sm"
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">Edytuj usługę</span>
            <span className="sm:hidden">Edytuj</span>
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={deleteService}
            className="flex-1 text-xs sm:text-sm"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">Usuń usługę</span>
            <span className="sm:hidden">Usuń</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
