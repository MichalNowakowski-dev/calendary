"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Award } from "lucide-react";
import type { Employee } from "@/lib/types/database";

interface EmployeeStats {
  employee: Employee;
  appointments: number;
  revenue: number;
}

interface TopEmployeesTableProps {
  employees: EmployeeStats[];
}

export default function TopEmployeesTable({
  employees,
}: TopEmployeesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Najlepsi pracownicy
        </CardTitle>
      </CardHeader>
      <CardContent>
        {employees.length > 0 ? (
          <div className="space-y-4">
            {employees.map((employeeStats, index) => (
              <div
                key={employeeStats.employee.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full">
                    {index === 0 ? (
                      <Award className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {employeeStats.employee.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {employeeStats.appointments} wizyt
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    {employeeStats.revenue.toFixed(2)} zł
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Brak dostępnych danych o pracownikach
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
