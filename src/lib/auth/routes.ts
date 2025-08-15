import { type UserRole } from "@/lib/types/database";

export const ROUTE_CONFIGS: Record<
  string,
  { path: string; allowedRoles: UserRole[] }
> = {
  company_owner: { path: "/company_owner", allowedRoles: ["company_owner"] },
  employee: { path: "/employee", allowedRoles: ["employee"] },
  customer: { path: "/customer", allowedRoles: ["customer"] },
  admin: { path: "/admin", allowedRoles: ["admin"] },
};

export const ROLE_REDIRECT_MAP: Record<UserRole, string> = {
  company_owner: "/company_owner",
  employee: "/employee",
  customer: "/customer",
  admin: "/admin",
};
