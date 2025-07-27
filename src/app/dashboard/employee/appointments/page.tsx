import { Suspense } from "react";
import { redirect } from "next/navigation";
import { serverAuth } from "@/lib/auth/server";
import { serverDb } from "@/lib/db-server";
import { EmployeeDashboardContent } from "../EmployeeDashboardContent";
import { Company, Service, Employee } from "@/lib/types/database";
import PageHeading from "@/components/PageHeading";

interface AppointmentWithDetails {
  id: string;
  company_id: string;
  employee_id: string | null;
  service_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: "booked" | "cancelled" | "completed";
  created_at: string;
  service: Service;
  employee?: Employee;
}

async function EmployeeAppointmentsContent() {
  const user = await serverAuth.getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Check if user is an employee
  if (user.role !== "employee") {
    redirect("/dashboard");
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

  // Get today's appointments for this employee
  const today = new Date().toISOString().split("T")[0];
  const appointments = await serverDb.getAppointments(userCompany.id);
  const todayAppointments = appointments.filter(
    (appointment) =>
      appointment.date === today && appointment.employee_id === user.id
  ) as AppointmentWithDetails[];

  return (
    <div className="space-y-6">
      <PageHeading
        text="Dzisiejsze wizyty"
        description="Twoje zaplanowane wizyty na dzisiaj"
      />

      <EmployeeDashboardContent
        appointments={todayAppointments}
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

export default function EmployeeAppointmentsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmployeeAppointmentsContent />
    </Suspense>
  );
}
