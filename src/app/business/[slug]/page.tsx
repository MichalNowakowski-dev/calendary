import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Service, Employee } from "@/lib/types/database";
import ClientReservationView from "@/components/client/ClientReservationView";
import MapLocation from "@/components/public/MapLocation";
import BusinessHoursDisplay from "@/components/public/BusinessHoursDisplay";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Define types for the service with employee data
interface ServiceWithEmployeeData extends Service {
  employee_services?: Array<{
    employee: Employee;
  }>;
}

interface ServiceWithEmployees extends Service {
  employees: Employee[];
}

// Helper function to get company by slug with services and employees
async function getCompanyBySlug(slug: string) {
  const supabase = createClient();

  try {
    // Get company by slug
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", slug)
      .single();

    if (companyError || !company) {
      return null;
    }

    // Get active services for the company
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
      .eq("active", true)
      .order("name", { ascending: true });

    if (servicesError) {
      console.error("Error loading services:", servicesError);
      return { company, services: [] };
    }

    // Get business hours for the company
    const { data: businessHours, error: businessHoursError } = await supabase
      .from("business_hours")
      .select("*")
      .eq("company_id", company.id)
      .order("day_of_week");

    if (businessHoursError) {
      console.error("Error loading business hours:", businessHoursError);
    }

    // Transform services to include assigned employees
    const servicesWithEmployees: ServiceWithEmployees[] = (services || []).map(
      (service: ServiceWithEmployeeData) => ({
        ...service,
        employees:
          service.employee_services
            ?.map((es) => es.employee)
            ?.filter((emp) => emp.visible) || [],
      })
    );

    return {
      company,
      services: servicesWithEmployees,
      businessHours: businessHours || [],
    };
  } catch (error) {
    console.error("Error loading company data:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getCompanyBySlug(resolvedParams.slug);

  if (!data) {
    return {
      title: "Firma nie znaleziona",
    };
  }

  const { company } = data;

  return {
    title: `${company.name} - Rezerwacja wizyt | Calendary`,
    description: company.description || `Zarezerwuj wizytę w ${company.name}`,
    openGraph: {
      title: `${company.name} - Rezerwacja wizyt`,
      description: company.description || `Zarezerwuj wizytę w ${company.name}`,
      type: "website",
    },
  };
}

export default async function BusinessPage({ params }: PageProps) {
  const resolvedParams = await params;
  const data = await getCompanyBySlug(resolvedParams.slug);

  if (!data) {
    notFound();
  }

  const { company, services, businessHours } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ClientReservationView company={company} services={services} />

      {/* Business Hours Section */}
      {businessHours && businessHours.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <BusinessHoursDisplay businessHours={businessHours} />
        </div>
      )}

      {/* Google Maps Section */}
      {(company.address_street || company.address_city) && (
        <div className="container mx-auto px-4 pb-8">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg border border-blue-200 dark:border-blue-800 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Lokalizacja
            </h2>
            <MapLocation
              address_street={company.address_street || undefined}
              address_city={company.address_city || undefined}
              businessName={company.name}
              phone={company.phone || undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}
