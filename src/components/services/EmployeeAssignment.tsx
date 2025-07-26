import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Users, X, UserCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import type { Employee } from "@/lib/types/database";

interface EmployeeAssignmentProps {
  serviceId: string;
  serviceName: string;
  assignedEmployees: { id: string; name: string; visible: boolean }[];
  allEmployees: Employee[];
  companyId: string;
  onClose: () => void;
  onUpdate: (
    newAssignments: { id: string; name: string; visible: boolean }[]
  ) => void;
}

export default function EmployeeAssignment({
  serviceId,
  serviceName,
  assignedEmployees,
  allEmployees,
  companyId,
  onClose,
  onUpdate,
}: EmployeeAssignmentProps) {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(
    assignedEmployees.map((emp) => emp.id)
  );
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleToggleEmployee = (employeeId: string) => {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees((prev) => prev.filter((id) => id !== employeeId));
    } else {
      setSelectedEmployees((prev) => [...prev, employeeId]);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // First, delete all existing assignments for this service
      const { error: deleteError } = await supabase
        .from("employee_services")
        .delete()
        .eq("service_id", serviceId);

      if (deleteError) throw deleteError;

      // Then, insert new assignments
      if (selectedEmployees.length > 0) {
        const { error: insertError } = await supabase
          .from("employee_services")
          .insert(
            selectedEmployees.map((employeeId) => ({
              employee_id: employeeId,
              service_id: serviceId,
            }))
          );

        if (insertError) throw insertError;
      }

      // Update the parent component with new assignments
      const newAssignedEmployees = allEmployees
        .filter((emp) => selectedEmployees.includes(emp.id))
        .map((emp) => ({ id: emp.id, name: emp.name, visible: emp.visible }));

      onUpdate(newAssignedEmployees);
      showToast.success("Przypisania pracowników zostały zaktualizowane");

      // Refresh the page to show updated data
      router.refresh();

      onClose();
    } catch (error) {
      console.error("Error updating employee assignments:", error);
      showToast.error("Błąd podczas aktualizacji przypisań");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">
            <div className="flex items-center">
              <UserCheck className="h-5 w-5 mr-2" />
              Przypisz pracowników
            </div>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Wybierz pracowników, którzy mogą wykonywać usługę:{" "}
              <strong>{serviceName}</strong>
            </p>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {allEmployees.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Brak dostępnych pracowników. Dodaj pracowników w sekcji
                "Pracownicy".
              </p>
            ) : (
              allEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center space-x-3 p-2 rounded-lg border"
                >
                  <input
                    type="checkbox"
                    id={`emp-${employee.id}`}
                    checked={selectedEmployees.includes(employee.id)}
                    onChange={() => handleToggleEmployee(employee.id)}
                    className="rounded"
                  />
                  <Label
                    htmlFor={`emp-${employee.id}`}
                    className="flex-1 text-sm cursor-pointer"
                  >
                    {employee.name}
                  </Label>
                  {selectedEmployees.includes(employee.id) && (
                    <Users className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="flex space-x-3 pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Zapisywanie..." : "Zapisz"}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Anuluj
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
