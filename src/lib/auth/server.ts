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
  const supabase = await createClient();
  
  // Check if user has access to this company
  const { data: companyUserData, error: companyUserError } = await supabase
    .from("company_users")
    .select("user_id")
    .eq("user_id", userId)
    .eq("company_id", companyId)
    .single();

  if (companyUserError || !companyUserData) {
    return null;
  }

  // Get user role from auth metadata
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return null;
  }

  const role = authData.user.user_metadata?.role;
  return role || null;
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
