import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { serverAuth } from "@/lib/auth/server";
import type { AuthUser } from "@/lib/auth/server";
import EmployeeDashboardClient from "./EmployeeDashboardClient";

// Force dynamic rendering since we use cookies for authentication
export const dynamic = "force-dynamic";

export default async function EmployeeDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

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

  // Check if user is an employee
  if (authUser.role !== "employee") {
    redirect("/");
  }

  // Get user's companies
  const companies = await serverAuth.getUserCompanies(user.id);
  if (companies.length === 0) {
    // Check if user is an employee but not yet linked to a company
    // This can happen if the employee was just created but hasn't been assigned to companies
    if (authUser.role === "employee") {
      // For employees, we'll allow access even without company assignment
      // They might be in the process of being assigned to companies
      return (
        <EmployeeDashboardClient user={authUser}>
          {children}
        </EmployeeDashboardClient>
      );
    }
    redirect("/login");
  }

  return (
    <EmployeeDashboardClient user={authUser}>
      {children}
    </EmployeeDashboardClient>
  );
}
