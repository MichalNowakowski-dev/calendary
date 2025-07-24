export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ServicesClient from "@/components/services/ServicesClient";
import type { Service, Company } from "@/lib/types/database";

// Loading component
function ServicesLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Server component for data fetching
async function getServicesData() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
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
  } catch (error) {
    console.error("Error in getServicesData:", error);
    throw error;
  }
}

// Main server component
export default async function ServicesPage() {
  try {
    const { services, employees, company } = await getServicesData();

    return (
      <Suspense fallback={<ServicesLoading />}>
        <ServicesClient
          services={services}
          employees={employees}
          companyId={company.id}
          companyName={company.name}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Error in ServicesPage:", error);
    // Error fallback
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usługi</h1>
          <p className="text-gray-600 mt-1">
            Zarządzaj usługami oferowanymi przez Twoją firmę
          </p>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Briefcase className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Błąd ładowania usług
              </h3>
              <p className="text-gray-600 mb-4">
                Wystąpił problem podczas ładowania danych. Spróbuj odświeżyć
                stronę.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
