export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ServicesClient from "@/components/services/ServicesClient";
import type { Service, Company } from "@/lib/types/database";
import PageHeading from "@/components/PageHeading";

// Loading component
function ServicesLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Server component for data fetching - returns a promise without awaiting
async function getServicesData() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get current user from server-side
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // Get user's company
  const { data: companyUsers, error: companyError } = await supabase
    .from("company_users")
    .select(
      `
      id,
      role,
      status,
      company:companies (
        id,
        name,
        slug,
        description,
        address,
        phone,
        industry,
        created_at
      )
    `
    )
    .eq("user_id", user.id)
    .eq("status", "active");

  if (companyError) {
    console.error("Error loading company:", companyError);
    throw companyError;
  }

  if (!companyUsers || companyUsers.length === 0) {
    redirect("/dashboard");
  }

  const company = companyUsers[0]?.company as unknown as Company;

  // Get services with assigned employees
  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select(
      `
      *,
      employee_services(
        employee:employees(
          id,
          name,
          visible
        )
      )
    `
    )
    .eq("company_id", company.id)
    .order("name", { ascending: true });

  if (servicesError) {
    console.error("Error loading services:", servicesError);
    throw servicesError;
  }

  // Get all employees for assignment management
  const { data: employees, error: employeesError } = await supabase
    .from("employees")
    .select("id, name, visible")
    .eq("company_id", company.id)
    .eq("visible", true)
    .order("name", { ascending: true });

  if (employeesError) {
    console.error("Error loading employees:", employeesError);
    throw employeesError;
  }

  return {
    services: (services as any[]) || [],
    employees: (employees as any[]) || [],
    company,
  };
}

// Server component that streams data
async function ServicesDataProvider() {
  const dataPromise = getServicesData();

  return (
    <>
      <PageHeading
        className="mb-6"
        text="Usługi"
        description={`Zarządzaj swoimi usługami`}
      />
      <Suspense fallback={<ServicesLoading />}>
        <ServicesClient dataPromise={dataPromise} />
      </Suspense>
    </>
  );
}

// Main server component
export default function ServicesPage() {
  return <ServicesDataProvider />;
}
