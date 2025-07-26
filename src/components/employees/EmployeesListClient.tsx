"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Employee, Service, Schedule } from "@/lib/types/database";
import EmployeeForm from "./EmployeeForm";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/lib/toast";

interface EmployeeWithDetails extends Employee {
  services: Service[];
  schedules: Schedule[];
}

interface EmployeesListClientProps {
  employees: EmployeeWithDetails[];
  companyId: string;
  showAddButton?: boolean;
}

export default function EmployeesListClient({
  employees,
  companyId,
  showAddButton = false,
}: EmployeesListClientProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState<EmployeeWithDetails | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  const supabase = createClient();

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

  const handleEdit = (employee: EmployeeWithDetails) => {
    setEditingEmployee(employee);
    setShowAddForm(true);
    fetchServices();
  };

  const handleSubmit = async (formData: {
    name: string;
    visible: boolean;
    selectedServices: string[];
  }) => {
    try {
      if (editingEmployee) {
        // Update employee
        const { error: updateError } = await supabase
          .from("employees")
          .update({
            name: formData.name,
            visible: formData.visible,
          })
          .eq("id", editingEmployee.id);

        if (updateError) throw updateError;

        // Update employee services
        // First, delete existing ones
        const { error: deleteError } = await supabase
          .from("employee_services")
          .delete()
          .eq("employee_id", editingEmployee.id);

        if (deleteError) throw deleteError;

        // Then add new ones
        if (formData.selectedServices.length > 0) {
          const { error: insertError } = await supabase
            .from("employee_services")
            .insert(
              formData.selectedServices.map((serviceId) => ({
                employee_id: editingEmployee.id,
                service_id: serviceId,
              }))
            );

          if (insertError) throw insertError;
        }

        showToast.success("Pracownik został zaktualizowany");
      } else {
        // Add new employee
        const { data: newEmployee, error: insertError } = await supabase
          .from("employees")
          .insert({
            company_id: companyId,
            name: formData.name,
            visible: formData.visible,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Add employee services
        if (formData.selectedServices.length > 0) {
          const { error: servicesError } = await supabase
            .from("employee_services")
            .insert(
              formData.selectedServices.map((serviceId) => ({
                employee_id: newEmployee.id,
                service_id: serviceId,
              }))
            );

          if (servicesError) throw servicesError;
        }

        showToast.success("Pracownik został utworzony");
      }

      setShowAddForm(false);
      setEditingEmployee(null);

      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      console.error("Error saving employee:", error);
      showToast.error("Błąd podczas zapisywania pracownika");
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingEmployee(null);
  };

  const handleAddNew = () => {
    setShowAddForm(true);
    fetchServices();
  };

  if (showAddForm || editingEmployee) {
    return (
      <EmployeeForm
        services={services}
        editingEmployee={editingEmployee}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    );
  }

  if (showAddButton) {
    return (
      <Button onClick={handleAddNew}>
        <Plus className="h-4 w-4 mr-2" />
        Dodaj pierwszego pracownika
      </Button>
    );
  }

  return (
    <Button onClick={handleAddNew}>
      <Plus className="h-4 w-4 mr-2" />
      Dodaj pracownika
    </Button>
  );
}
