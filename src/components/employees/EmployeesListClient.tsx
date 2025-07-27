"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Employee, Service, Schedule } from "@/lib/types/database";
import EmployeeForm from "./EmployeeForm";
import { createClient } from "@/lib/supabase/client";

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
  const router = useRouter();

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

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingEmployee(null);
  };

  const handleSuccess = () => {
    setShowAddForm(false);
    setEditingEmployee(null);
    router.refresh();
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
        companyId={companyId}
        onCancel={handleCancel}
        onSuccess={handleSuccess}
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
