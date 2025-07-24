import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { Company, Service, Employee } from "@/lib/types/database";
import PublicCompanyView from "@/components/public/PublicCompanyView";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Helper function to get company by slug with services and employees
async function getCompanyBySlug(slug: string) {
  const supabase = createClient(cookies());

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

    // Transform services to include assigned employees
    const servicesWithEmployees = (services || []).map((service) => ({
      ...service,
      employees:
        (service as any).employee_services
          ?.map((es: any) => es.employee)
          ?.filter((emp: any) => emp.visible) || [],
    }));

    return {
      company,
      services: servicesWithEmployees,
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

  const { company, services } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicCompanyView company={company} services={services} />
    </div>
  );
}
