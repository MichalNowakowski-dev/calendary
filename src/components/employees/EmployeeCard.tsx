"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Edit, Trash2, UserCheck, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/lib/toast";
import { deleteEmployee as deleteEmployeeAction } from "@/lib/actions/employees";
import EmployeeForm from "./EmployeeForm";
import EmployeeSchedule from "@/components/services/EmployeeSchedule";
import ScheduleViewModal from "./ScheduleViewModal";
import type {
  EmployeeWithDetails,
  Service,
  Schedule,
} from "@/lib/types/database";

interface EmployeeCardProps {
  employee: EmployeeWithDetails;
  companyId: string;
}

export default function EmployeeCard({
  employee,
  companyId,
}: EmployeeCardProps) {
  const [currentEmployee, setCurrentEmployee] = useState(employee);
  const [showEditForm, setShowEditForm] = useState(false);
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

  const toggleEmployeeVisibility = async () => {
    try {
      const { error } = await supabase
        .from("employees")
        .update({ visible: !currentEmployee.visible })
        .eq("id", currentEmployee.id);

      if (error) throw error;

      setCurrentEmployee((prev) => ({
        ...prev,
        visible: !prev.visible,
      }));

      showToast.success(
        `Pracownik ${currentEmployee.visible ? "ukryty" : "widoczny"}`
      );
    } catch (error) {
      console.error("Error toggling employee visibility:", error);
      showToast.error("Błąd podczas zmiany widoczności pracownika");
    }
  };

  const deleteEmployee = async () => {
    if (
      !confirm(`Czy na pewno chcesz usunąć pracownika ${currentEmployee.name}?`)
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", currentEmployee.id);

      const { error: companyUserError } = await supabase
        .from("company_users")
        .delete()
        .eq("user_id", currentEmployee.auth_user_id!);

      if (currentEmployee.auth_user_id) {
        const { success, message } = await deleteEmployeeAction(
          currentEmployee.auth_user_id
        );

        if (!success) {
          throw new Error(message);
        }
      }

      if (companyUserError) throw companyUserError;

      if (error) throw error;

      showToast.success("Pracownik został usunięty");
      // Refresh the data without full page reload
      router.refresh();
    } catch (error) {
      console.error("Error deleting employee:", error);
      showToast.error("Błąd podczas usuwania pracownika");
    }
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    // Refresh the data without full page reload
    router.refresh();
  };

  if (showEditForm) {
    return (
      <Card className="relative">
        <CardContent className="p-6">
          <EmployeeForm
            services={services}
            editingEmployee={currentEmployee}
            companyId={companyId}
            onCancel={handleEditCancel}
            onSuccess={handleEditSuccess}
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
              onClick={() => {
                setShowEditForm(true);
                fetchServices();
              }}
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
            onScheduleUpdate={(updatedSchedules: Schedule[]) => {
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
