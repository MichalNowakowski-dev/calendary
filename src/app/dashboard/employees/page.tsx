"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  UserCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser, getUserCompanies } from "@/lib/auth/utils";
import type {
  Employee,
  Service,
  Schedule,
  Company,
} from "@/lib/types/database";
import { showToast, showConfirmToast } from "@/lib/toast";
import EmployeeSchedule from "@/components/services/EmployeeSchedule";
import ScheduleCalendar from "@/components/services/ScheduleCalendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EmployeeWithDetails extends Employee {
  services: Service[];
  schedules: Schedule[];
}

// Add this new component for showing the schedule calendar
function ScheduleViewModal({ employee }: { employee: EmployeeWithDetails }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex-1">
          <Eye className="h-4 w-4 mr-1" />
          Pokaż grafik
        </Button>
      </DialogTrigger>
      <DialogContent className="lg:max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Grafik pracy - {employee.name}</DialogTitle>
          <DialogDescription>
            Kalendarzowy widok grafiku pracy pracownika
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <ScheduleCalendar
            schedules={employee.schedules}
            employeeName={employee.name}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeWithDetails[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState<EmployeeWithDetails | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    visible: true,
    selectedServices: [] as string[],
  });

  const supabase = createClient();

  const weekdays = [
    { value: 0, label: "Niedziela" },
    { value: 1, label: "Poniedziałek" },
    { value: 2, label: "Wtorek" },
    { value: 3, label: "Środa" },
    { value: 4, label: "Czwartek" },
    { value: 5, label: "Piątek" },
    { value: 6, label: "Sobota" },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) return;

        // Get user's company
        const companies = await getUserCompanies(user.id);
        if (companies.length === 0) return;

        const userCompany = companies[0]?.company as unknown as Company;
        setCompany(userCompany);

        // Get employees with services and schedules
        const [employeesResult, servicesResult] = await Promise.all([
          supabase
            .from("employees")
            .select(
              `
              *,
              employee_services(
                service:services(*)
              ),
              schedules(*)
            `
            )
            .eq("company_id", userCompany.id)
            .order("name", { ascending: true }),

          supabase
            .from("services")
            .select("*")
            .eq("company_id", userCompany.id)
            .eq("active", true)
            .order("name", { ascending: true }),
        ]);

        if (employeesResult.error) throw employeesResult.error;
        if (servicesResult.error) throw servicesResult.error;

        // Transform employees data
        const employeesData = (employeesResult.data || []).map((emp) => ({
          ...emp,
          services:
            (emp as any).employee_services?.map((es: any) => es.service) || [],
          schedules: (emp as any).schedules || [],
        }));

        setEmployees(employeesData);
        setServices(servicesResult.data || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      visible: true,
      selectedServices: [],
    });
    setEditingEmployee(null);
    setShowAddForm(false);
  };

  const handleEdit = (employee: EmployeeWithDetails) => {
    setFormData({
      name: employee.name,
      visible: employee.visible,
      selectedServices: employee.services.map((s) => s.id),
    });
    setEditingEmployee(employee);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

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

        // Update local state
        const updatedServices = services.filter((s) =>
          formData.selectedServices.includes(s.id)
        );

        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === editingEmployee.id
              ? {
                  ...emp,
                  name: formData.name,
                  visible: formData.visible,
                  services: updatedServices,
                }
              : emp
          )
        );
      } else {
        // Add new employee
        const { data: newEmployee, error: insertError } = await supabase
          .from("employees")
          .insert({
            company_id: company.id,
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

        // Update local state
        const employeeServices = services.filter((s) =>
          formData.selectedServices.includes(s.id)
        );

        setEmployees((prev) => [
          ...prev,
          {
            ...newEmployee,
            services: employeeServices,
            schedules: [],
          },
        ]);
      }

      resetForm();
      showToast.success(
        editingEmployee
          ? "Pracownik został zaktualizowany"
          : "Pracownik został utworzony"
      );
    } catch (error) {
      console.error("Error saving employee:", error);
      showToast.error("Błąd podczas zapisywania pracownika");
    }
  };

  const toggleEmployeeVisibility = async (employee: EmployeeWithDetails) => {
    try {
      const { error } = await supabase
        .from("employees")
        .update({ visible: !employee.visible })
        .eq("id", employee.id);

      if (error) throw error;

      // Update local state
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employee.id ? { ...emp, visible: !emp.visible } : emp
        )
      );
      showToast.success(
        `Pracownik został ${employee.visible ? "ukryty" : "pokazany"}`
      );
    } catch (error) {
      console.error("Error toggling employee visibility:", error);
      showToast.error("Błąd podczas zmiany widoczności pracownika");
    }
  };

  const deleteEmployee = async (employee: EmployeeWithDetails) => {
    showConfirmToast(
      `Czy na pewno chcesz usunąć pracownika "${employee.name}"?`,
      async () => {
        try {
          // Delete employee services first
          const { error: servicesError } = await supabase
            .from("employee_services")
            .delete()
            .eq("employee_id", employee.id);

          if (servicesError) throw servicesError;

          // Delete schedules
          const { error: schedulesError } = await supabase
            .from("schedules")
            .delete()
            .eq("employee_id", employee.id);

          if (schedulesError) throw schedulesError;

          // Delete employee
          const { error } = await supabase
            .from("employees")
            .delete()
            .eq("id", employee.id);

          if (error) throw error;

          // Update local state
          setEmployees((prev) => prev.filter((emp) => emp.id !== employee.id));
          showToast.success("Pracownik został usunięty");
        } catch (error) {
          console.error("Error deleting employee:", error);
          showToast.error("Błąd podczas usuwania pracownika");
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pracownicy</h1>
          <p className="text-gray-600 mt-1">
            Zarządzaj zespołem {company?.name}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj pracownika
        </Button>
      </div>

      {/* Add/Edit form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingEmployee
                ? "Edytuj pracownika"
                : "Dodaj nowego pracownika"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Imię i nazwisko *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="flex items-center space-x-3 pt-6">
                  <input
                    type="checkbox"
                    id="visible"
                    checked={formData.visible}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        visible: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <Label htmlFor="visible">Widoczny dla klientów</Label>
                </div>
              </div>

              <div>
                <Label>Usługi wykonywane przez pracownika</Label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {services.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      Brak dostępnych usług. Dodaj najpierw usługi w sekcji
                      "Usługi".
                    </p>
                  ) : (
                    services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center space-x-3"
                      >
                        <input
                          type="checkbox"
                          id={`service-${service.id}`}
                          checked={formData.selectedServices.includes(
                            service.id
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData((prev) => ({
                                ...prev,
                                selectedServices: [
                                  ...prev.selectedServices,
                                  service.id,
                                ],
                              }));
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                selectedServices: prev.selectedServices.filter(
                                  (id) => id !== service.id
                                ),
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <Label
                          htmlFor={`service-${service.id}`}
                          className="text-sm"
                        >
                          {service.name} ({service.duration_minutes} min,{" "}
                          {service.price.toFixed(2)} zł)
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button type="submit">
                  {editingEmployee ? "Zapisz zmiany" : "Dodaj pracownika"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Anuluj
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Employees grid */}
      {employees.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Brak pracowników
              </h3>
              <p className="text-gray-600 mb-4">
                Zacznij od dodania pierwszego pracownika do swojego zespołu.
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Dodaj pierwszego pracownika
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <Card
              key={employee.id}
              className={`${!employee.visible ? "opacity-75" : ""}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{employee.name}</CardTitle>
                  <button
                    onClick={() => toggleEmployeeVisibility(employee)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {employee.visible ? (
                      <Eye className="h-5 w-5 text-green-500" />
                    ) : (
                      <EyeOff className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Services */}
                  <div>
                    <div className="flex items-center mb-2">
                      <UserCheck className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm font-medium">
                        Usługi ({employee.services.length})
                      </span>
                    </div>
                    <div className="space-y-1">
                      {employee.services.length === 0 ? (
                        <p className="text-xs text-gray-500">
                          Brak przypisanych usług
                        </p>
                      ) : (
                        employee.services.slice(0, 3).map((service) => (
                          <div
                            key={service.id}
                            className="text-xs bg-gray-100 px-2 py-1 rounded"
                          >
                            {service.name}
                          </div>
                        ))
                      )}
                      {employee.services.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{employee.services.length - 3} więcej
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Schedule status */}
                  <div>
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm font-medium">Grafik</span>
                    </div>
                    <div className="flex space-x-2">
                      <ScheduleViewModal employee={employee} />
                      <EmployeeSchedule
                        employee={employee}
                        schedules={employee.schedules}
                        onScheduleUpdate={(updatedSchedules) => {
                          setEmployees((prev) =>
                            prev.map((emp) =>
                              emp.id === employee.id
                                ? { ...emp, schedules: updatedSchedules }
                                : emp
                            )
                          );
                        }}
                        hideCurrentSchedule={true}
                        buttonText="Zmień grafik"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="pt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        employee.visible
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {employee.visible ? "Widoczny" : "Ukryty"}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(employee)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edytuj
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteEmployee(employee)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
