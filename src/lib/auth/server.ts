import { serverDb } from "@/lib/db-server";
import type { UserRole } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/server";

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
}

/**
 * Server-side versions of auth functions
 */
export const serverAuth = {
  getCurrentUser: serverDb.getCurrentUser,
  getUserCompanies: serverDb.getUserCompanies,
};

export async function getUserRoleInCompany(
  userId: string,
  companyId: string
): Promise<"company_owner" | "admin" | "employee" | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("company_users")
    .select("role")
    .eq("user_id", userId)
    .eq("company_id", companyId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.role;
}

export async function isUserAdminOrOwner(
  userId: string,
  companyId: string
): Promise<boolean> {
  const role = await getUserRoleInCompany(userId, companyId);
  return role === "company_owner" || role === "admin";
}

export async function isUserOwner(
  userId: string,
  companyId: string
): Promise<boolean> {
  const role = await getUserRoleInCompany(userId, companyId);
  return role === "company_owner";
}
