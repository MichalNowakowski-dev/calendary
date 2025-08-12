import { Suspense } from "react";
import { redirect } from "next/navigation";
import { serverAuth } from "@/lib/auth/server";
import { serverDb } from "@/lib/db-server";
import { EmployeeDashboardContent } from "./EmployeeDashboardContent";
import { Company, AppointmentWithDetails } from "@/lib/types/database";
import PageHeading from "@/components/PageHeading";

// Force dynamic rendering since we use cookies for authentication
export const dynamic = "force-dynamic";

async function EmployeeDashboardPageContent() {
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
  // Get employee's assigned services
  const employeesWithDetails = await serverDb.getEmployeesWithDetails(
    userCompany.id
  );
  const currentEmployee = employeesWithDetails.find(
    (emp) => emp.auth_user_id === user.id || emp.user_id === user.id
  );

  // Get all appointments for this employee (upcoming and today)
  const today = new Date().toISOString().split("T")[0];
  const employeeAppointments = (await serverDb.getEmployeeAppointmentsByCompany(
    userCompany.id,
    user.id
  )) as AppointmentWithDetails[];

  // Separate today's and upcoming appointments
  const todayAppointments = employeeAppointments.filter(
    (appointment) => appointment.date === today
  );

  const upcomingAppointments = employeeAppointments.filter(
    (appointment) => appointment.date > today && appointment.status === "booked"
  );

  const assignedServices = currentEmployee?.services || [];

  return (
    <div className="space-y-6">
      <PageHeading
        text="Panel pracownika"
        description="Twoje wizyty, harmonogram i przypisane usługi"
      />

      <EmployeeDashboardContent
        todayAppointments={todayAppointments}
        upcomingAppointments={upcomingAppointments}
        assignedServices={assignedServices}
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

export default function EmployeeDashboardPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmployeeDashboardPageContent />
    </Suspense>
  );
}
