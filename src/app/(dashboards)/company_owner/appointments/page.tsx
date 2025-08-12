import { Suspense } from "react";
import { serverDb } from "@/lib/db-server";
import { serverAuth } from "@/lib/auth/server";
import type { Company } from "@/lib/types/database";
import PageHeading from "@/components/PageHeading";
import AppointmentForm from "@/components/services/AppointmentForm";
import AppointmentsClient from "./AppointmentsClient";

// Force dynamic rendering since we use cookies for authentication
export const dynamic = "force-dynamic";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    date?: string;
  }>;
}) {
  // Get current user and company
  const user = await serverDb.getCurrentUser();
  if (!user) {
    return (
      <div className="space-y-6">
        <PageHeading
          text="Kalendarz wizyt"
          description="Musisz być zalogowany, aby zobaczyć wizyty"
        />
      </div>
    );
  }

  const companies = await serverAuth.getUserCompanies(user.id);
  if (companies.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeading
          text="Kalendarz wizyt"
          description="Nie masz przypisanej żadnej firmy"
        />
      </div>
    );
  }

  const company = companies[0]?.company as unknown as Company;

  // Get appointments with server-side filtering
  const appointments = await serverDb.getAppointments(company.id);

  // Apply server-side filters
  let filteredAppointments = appointments;

  const { search, status, date } = await searchParams;

  // Search filter
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredAppointments = filteredAppointments.filter(
      (apt) =>
        apt.customer_name.toLowerCase().includes(searchTerm) ||
        apt.customer_email.toLowerCase().includes(searchTerm) ||
        apt.service.name.toLowerCase().includes(searchTerm)
    );
  }

  // Status filter
  if (status && status !== "all") {
    filteredAppointments = filteredAppointments.filter(
      (apt) => apt.status === status
    );
  }

  // Date filter
  if (date && date !== "all") {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    switch (date) {
      case "today":
        filteredAppointments = filteredAppointments.filter(
          (apt) => apt.date === today
        );
        break;
      case "tomorrow":
        filteredAppointments = filteredAppointments.filter(
          (apt) => apt.date === tomorrow
        );
        break;
      case "week":
        filteredAppointments = filteredAppointments.filter(
          (apt) => apt.date >= today && apt.date <= weekFromNow
        );
        break;
      case "upcoming":
        filteredAppointments = filteredAppointments.filter(
          (apt) => apt.date >= today
        );
        break;
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <PageHeading
          text="Kalendarz wizyt"
          description={`Zarządzaj wizytami w firmie ${company.name}`}
        />
        <AppointmentForm
          company={company}
          onAppointmentCreated={() => {
            // This will trigger a revalidation
          }}
        />
      </div>

      {/* Client component for interactive features */}
      <Suspense fallback={<AppointmentsSkeleton />}>
        <AppointmentsClient
          appointments={filteredAppointments}
          company={company}
          searchParams={{ search, status, date }}
        />
      </Suspense>
    </div>
  );
}

function AppointmentsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
