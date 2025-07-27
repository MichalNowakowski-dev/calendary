import { serverDb } from "@/lib/db-server";
import type { UserRole } from "@/lib/types/database";

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
