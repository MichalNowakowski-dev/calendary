import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { serverAuth } from "@/lib/auth/server";
import { getUserRoleInCompany } from "@/lib/auth/server";
import type { AuthUser } from "@/lib/auth/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  // Get the current user on the server
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Get user data
  const authUser: AuthUser = {
    id: user.id,
    email: user.email!,
    first_name: user.user_metadata?.first_name || "",
    last_name: user.user_metadata?.last_name || "",
    role: user.user_metadata?.role || "customer",
    phone: user.user_metadata?.phone,
  };

  // Get user's companies
  const companies = await serverAuth.getUserCompanies(user.id);
  if (companies.length === 0) {
    redirect("/login");
  }

  // Get user role in the company
  const userRole = await getUserRoleInCompany(user.id, companies[0].company_id);

  return (
    <DashboardClient user={authUser} userRole={userRole || "employee"}>
      {children}
    </DashboardClient>
  );
}
