import { Suspense } from "react";
import { redirect } from "next/navigation";
import { serverAuth } from "@/lib/auth/server";
import { serverDb } from "@/lib/db-server";
import { EmployeeScheduleContent } from "./EmployeeScheduleContent";
import { Company } from "@/lib/types/database";
import PageHeading from "@/components/PageHeading";

async function EmployeeSchedulePageContent() {
  const user = await serverAuth.getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Check if user is an employee
  if (user.role !== "employee") {
    redirect("/");
  }

  // Get user's company
  const companies = await serverAuth.getUserCompanies(user.id);
  if (companies.length === 0) {
    redirect("/login");
  }

  const userCompany = companies[0]?.company as unknown as Company;
  if (!userCompany.id) {
    redirect("/login");
  }

  // Get employee's schedule
  const employeesWithDetails = await serverDb.getEmployeesWithDetails(
    userCompany.id
  );
  const currentEmployee = employeesWithDetails.find(
    (emp) => emp.auth_user_id === user.id || emp.user_id === user.id
  );
  const schedules = currentEmployee?.schedules || [];

  return (
    <div className="space-y-6">
      <PageHeading
        text="Mój harmonogram"
        description="Twoje godziny pracy i dostępność"
      />

      <EmployeeScheduleContent
        schedules={schedules}
        company={userCompany}
        user={user}
      />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

export default function EmployeeSchedulePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmployeeSchedulePageContent />
    </Suspense>
  );
}
