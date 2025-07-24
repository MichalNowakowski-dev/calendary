"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Users, UserCheck } from "lucide-react";
import ServiceForm from "./ServiceForm";
import ServiceActions from "./ServiceActions";
import EmployeeAssignment from "./EmployeeAssignment";
import type { Service, Employee } from "@/lib/types/database";

interface ServiceWithEmployees extends Service {
  employee_services: {
    employee: {
      id: string;
      name: string;
      visible: boolean;
    };
  }[];
}

interface ServicesClientProps {
  services: ServiceWithEmployees[];
  employees: Employee[];
  companyId: string;
  companyName: string;
}

export default function ServicesClient({
  services,
  employees,
  companyId,
  companyName,
}: ServicesClientProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [assigningEmployees, setAssigningEmployees] =
    useState<ServiceWithEmployees | null>(null);
  const [servicesData, setServicesData] =
    useState<ServiceWithEmployees[]>(services);

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

  const handleEmployeeAssignmentUpdate = (
    serviceId: string,
    newAssignments: { id: string; name: string; visible: boolean }[]
  ) => {
    // Update local state with new assignments
    setServicesData((prev) =>
      prev.map((service) =>
        service.id === serviceId
          ? {
              ...service,
              employee_services: newAssignments.map((emp) => ({
                employee: emp,
              })),
            }
          : service
      )
    );
    setAssigningEmployees(null);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usługi</h1>
          <p className="text-gray-600 mt-1">
            Zarządzaj usługami oferowanymi przez {companyName}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj usługę
        </Button>
      </div>

      {/* Add/Edit form */}
      {showAddForm && (
        <ServiceForm
          service={editingService}
          companyId={companyId}
          onSuccess={handleFormSuccess}
          onCancel={handleCancel}
        />
      )}

      {/* Services grid */}
      {services.length === 0 ? (
        <div className="text-center py-12">
          <div className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Brak usług</h3>
          <p className="text-gray-600 mb-4">
            Zacznij od dodania pierwszej usługi do swojej oferty.
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj pierwszą usługę
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesData.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              employees={employees}
              companyId={companyId}
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
          companyId={companyId}
          onClose={() => setAssigningEmployees(null)}
          onUpdate={(newAssignments) =>
            handleEmployeeAssignmentUpdate(
              assigningEmployees.id,
              newAssignments
            )
          }
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

function ServiceCard({
  service,
  employees,
  companyId,
  onEdit,
  onAssignEmployees,
}: ServiceCardProps) {
  const assignedEmployees =
    service.employee_services?.map((es) => es.employee) || [];
  return (
    <div
      className={`bg-white rounded-lg border shadow-sm ${
        !service.active ? "opacity-75" : ""
      }`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{service.name}</h3>
        </div>

        {service.description && (
          <p className="text-gray-600 text-sm mb-4">{service.description}</p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-4 h-4 mr-2">🕐</span>
            {service.duration_minutes} minut
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-4 h-4 mr-2">💰</span>
            {service.price.toFixed(2)} zł
          </div>
        </div>

        {/* Assigned Employees */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Users className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Pracownicy ({assignedEmployees.length})
            </span>
          </div>
          <div className="space-y-1">
            {assignedEmployees.length === 0 ? (
              <p className="text-xs text-gray-500">
                Brak przypisanych pracowników
              </p>
            ) : (
              assignedEmployees.slice(0, 3).map((employee) => (
                <div
                  key={employee.id}
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                >
                  {employee.name}
                </div>
              ))
            )}
            {assignedEmployees.length > 3 && (
              <p className="text-xs text-gray-500">
                +{assignedEmployees.length - 3} więcej
              </p>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAssignEmployees(service)}
            className="flex-1"
          >
            <UserCheck className="h-4 w-4 mr-1" />
            Pracownicy
          </Button>
        </div>

        <ServiceActions service={service} onEdit={onEdit} />
      </div>
    </div>
  );
}
