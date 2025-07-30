import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import EmployeeCard from "./EmployeeCard";
import { getEmployeesWithDetails } from "@/lib/employees";
import EmployeesListClient from "./EmployeesListClient";

interface EmployeesListProps {
  companyId: string;
}

export default async function EmployeesList({ companyId }: EmployeesListProps) {
  const employees = await getEmployeesWithDetails(companyId);

  if (employees.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Brak pracowników
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Nie masz jeszcze żadnych pracowników w systemie.
            </p>
            <EmployeesListClient
              employees={employees}
              companyId={companyId}
              showAddButton={true}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {employees.map((employee) => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          companyId={companyId}
        />
      ))}
    </div>
  );
}
