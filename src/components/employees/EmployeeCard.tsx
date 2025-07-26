"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, EyeOff, UserCheck, Clock } from "lucide-react";
import type { Employee, Service, Schedule } from "@/lib/types/database";
import { showToast, showConfirmToast } from "@/lib/toast";
import { createClient } from "@/lib/supabase/client";
import EmployeeSchedule from "@/components/services/EmployeeSchedule";
import ScheduleViewModal from "./ScheduleViewModal";
import EmployeeForm from "./EmployeeForm";

interface EmployeeWithDetails extends Employee {
  services: Service[];
  schedules: Schedule[];
}

interface EmployeeCardProps {
  employee: EmployeeWithDetails;
  companyId: string;
}

export default function EmployeeCard({
  employee,
  companyId,
}: EmployeeCardProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentEmployee, setCurrentEmployee] =
    useState<EmployeeWithDetails>(employee);
  const [services, setServices] = useState<Service[]>([]);

  const supabase = createClient();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("company_id", companyId)
          .eq("active", true)
          .order("name", { ascending: true });

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, [companyId, supabase]);

  const toggleEmployeeVisibility = async () => {
    try {
      const { error } = await supabase
        .from("employees")
        .update({ visible: !currentEmployee.visible })
        .eq("id", currentEmployee.id);

      if (error) throw error;

      setCurrentEmployee((prev) => ({ ...prev, visible: !prev.visible }));
      showToast.success(
        `Pracownik został ${currentEmployee.visible ? "ukryty" : "pokazany"}`
      );
    } catch (error) {
      console.error("Error toggling employee visibility:", error);
      showToast.error("Błąd podczas zmiany widoczności pracownika");
    }
  };

  const deleteEmployee = async () => {
    showConfirmToast(
      `Czy na pewno chcesz usunąć pracownika "${currentEmployee.name}"?`,
      async () => {
        try {
          // Delete employee services first
          const { error: servicesError } = await supabase
            .from("employee_services")
            .delete()
            .eq("employee_id", currentEmployee.id);

          if (servicesError) throw servicesError;

          // Delete schedules
          const { error: schedulesError } = await supabase
            .from("schedules")
            .delete()
            .eq("employee_id", currentEmployee.id);

          if (schedulesError) throw schedulesError;

          // Delete employee
          const { error } = await supabase
            .from("employees")
            .delete()
            .eq("id", currentEmployee.id);

          if (error) throw error;

          showToast.success("Pracownik został usunięty");
          // Refresh the page to update the list
          window.location.reload();
        } catch (error) {
          console.error("Error deleting employee:", error);
          showToast.error("Błąd podczas usuwania pracownika");
        }
      }
    );
  };

  const handleEditSubmit = async (formData: {
    name: string;
    visible: boolean;
    selectedServices: string[];
  }) => {
    try {
      // Update employee
      const { error: updateError } = await supabase
        .from("employees")
        .update({
          name: formData.name,
          visible: formData.visible,
        })
        .eq("id", currentEmployee.id);

      if (updateError) throw updateError;

      // Update employee services
      // First, delete existing ones
      const { error: deleteError } = await supabase
        .from("employee_services")
        .delete()
        .eq("employee_id", currentEmployee.id);

      if (deleteError) throw deleteError;

      // Then add new ones
      if (formData.selectedServices.length > 0) {
        const { error: insertError } = await supabase
          .from("employee_services")
          .insert(
            formData.selectedServices.map((serviceId) => ({
              employee_id: currentEmployee.id,
              service_id: serviceId,
            }))
          );

        if (insertError) throw insertError;
      }

      setShowEditForm(false);
      showToast.success("Pracownik został zaktualizowany");
      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      console.error("Error updating employee:", error);
      showToast.error("Błąd podczas aktualizacji pracownika");
    }
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
  };

  if (showEditForm) {
    return (
      <Card className="relative">
        <CardContent className="p-6">
          <EmployeeForm
            services={services}
            editingEmployee={currentEmployee}
            onSubmit={handleEditSubmit}
            onCancel={handleEditCancel}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative">
      <CardContent className="p-6">
        {/* Employee header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {currentEmployee.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <button
                onClick={toggleEmployeeVisibility}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                {currentEmployee.visible ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
              <span
                className={`text-xs ${
                  currentEmployee.visible
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {currentEmployee.visible ? "Widoczny" : "Ukryty"}
              </span>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowEditForm(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={deleteEmployee}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Employee details */}
        <div className="space-y-3">
          <div className="flex items-center">
            <UserCheck className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Przypisane usługi
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {currentEmployee.services.length > 0 ? (
                  currentEmployee.services.map((service) => (
                    <span
                      key={service.id}
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded"
                    >
                      {service.name}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Brak przypisanych usług
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Grafik pracy
              </p>
              <p className="text-sm">
                {currentEmployee.schedules.length > 0
                  ? `${currentEmployee.schedules.length} wpisów`
                  : "Brak grafiku"}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 mt-4">
          <ScheduleViewModal employee={currentEmployee} />
          <EmployeeSchedule
            employee={currentEmployee}
            schedules={currentEmployee.schedules}
            onScheduleUpdate={(updatedSchedules) => {
              setCurrentEmployee((prev) => ({
                ...prev,
                schedules: updatedSchedules,
              }));
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
