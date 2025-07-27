import { Suspense } from "react";
import { serverAuth } from "@/lib/auth/server";
import { EmployeeCardSkeleton } from "@/components/employees";
import EmployeesList from "@/components/employees/EmployeesList";
import EmployeesListClient from "@/components/employees/EmployeesListClient";
import { Company } from "@/lib/types/database";
import PageHeading from "@/components/PageHeading";

async function EmployeesPageContent() {
  const user = await serverAuth.getCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get user's company
  const companies = await serverAuth.getUserCompanies(user.id);
  if (companies.length === 0) {
    throw new Error("No company found for user");
  }

  const userCompany = companies[0]?.company as unknown as Company;
  if (!userCompany.id) {
    throw new Error("Company data not found");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Page header */}
        <PageHeading
          text="Pracownicy"
          description="Zarządzaj pracownikami i ich harmonogramami pracy"
        />
        <EmployeesListClient employees={[]} companyId={userCompany.id} />
      </div>

      {/* Employees list */}
      <EmployeesList companyId={userCompany.id} />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
      </div>

      {/* Employee cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <EmployeeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmployeesPageContent />
    </Suspense>
  );
}
