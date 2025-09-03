import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types/database";

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  companyData?: {
    name: string;
    slug: string;
    description?: string;
    address_street?: string;
    address_city?: string;
    phone?: string;
    industry: string;
    plan: string;
  };
}
const supabase = await createClient();

/**
 * Register a new user with the specified role
 */
export const registerUser = async (data: RegistrationData) => {
  try {
    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role,
          phone: data.phone,
        },
      },
    });

    if (authError) throw authError;

    if (!authData.user) {
      throw new Error("User registration failed");
    }

    // If this is a company owner, create the company and owner record
    if (data.role === "company_owner" && data.companyData) {
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: data.companyData.name,
          slug: data.companyData.slug,
          description: data.companyData.description,
          address_street: data.companyData.address_street,
          address_city: data.companyData.address_city,
          phone: data.companyData.phone,
          industry: data.companyData.industry,
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Create company_owners record
      const { data: ownerData, error: ownerError } = await supabase
        .from("company_owners")
        .insert({
          company_id: companyData.id,
          user_id: authData.user.id,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
        })
        .select()
        .single();

      if (ownerError) throw ownerError;

      // Relationship is already established through company_owners.company_id
    }

    // If this is a customer, create customer record
    if (data.role === "customer") {
      const { error: customerError } = await supabase.from("customers").insert({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
      });

      // Don't throw error for customer record creation as it's optional
      if (customerError) {
        console.warn("Customer record creation failed:", customerError);
      }
    }

    return { user: authData.user, session: authData.session };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

/**
 * Sign in an existing user
 */
export const signInUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { user: data.user, session: data.session };
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

/**
 * Get the current user from the session (client-side)
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    return {
      id: user.id,
      email: user.email!,
      first_name: user.user_metadata?.first_name || "",
      last_name: user.user_metadata?.last_name || "",
      role: user.user_metadata?.role || "customer",
      phone: user.user_metadata?.phone,
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

/**
 * Get user's companies (for company owners/employees) - client-side
 */
export const getUserCompanies = async (userId: string) => {
  try {
    // Get companies where user is owner
    const { data: ownedCompanies, error: ownerError } = await supabase
      .from("company_owners")
      .select(
        `
        id,
        company:companies (
          id,
          name,
          slug,
          description,
          address_street,
          address_city,
          phone,
          industry,
          created_at
        )
      `
      )
      .eq("user_id", userId);

    if (ownerError) throw ownerError;

    // Get companies where user is employee
    const { data: employeeCompanies, error: employeeError } = await supabase
      .from("employees")
      .select(
        `
        id,
        company:companies (
          id,
          name,
          slug,
          description,
          address_street,
          address_city,
          phone,
          industry,
          created_at
        )
      `
      )
      .eq("auth_user_id", userId);

    if (employeeError) throw employeeError;

    // Combine and deduplicate results
    const allCompanies = [
      ...(ownedCompanies || []).map((item) => ({
        ...item,
        status: "active" as const,
        role: "owner" as const,
      })),
      ...(employeeCompanies || []).map((item) => ({
        ...item,
        status: "active" as const,
        role: "employee" as const,
      })),
    ];

    // Remove duplicates based on company id
    const uniqueCompanies = allCompanies.filter(
      (company, index, self) =>
        index ===
        self.findIndex((c) => c.company[0].id === company.company[0].id)
    );

    return uniqueCompanies;
  } catch (error) {
    console.error("Get user companies error:", error);
    return [];
  }
};

/**
 * Check if a company slug is available
 */
export const isSlugAvailable = async (slug: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("companies")
      .select("id")
      .eq("slug", slug)
      .limit(1);

    if (error) throw error;

    return !data || data.length === 0;
  } catch (error) {
    console.error("Slug check error:", error);
    return false;
  }
};

/**
 * Generate a unique slug from company name
 */
export const generateSlug = async (name: string): Promise<string> => {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  let slug = baseSlug;
  let counter = 1;

  while (!(await isSlugAvailable(slug))) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

export async function getUserRoleInCompany(
  userId: string,
  companyId: string
): Promise<"company_owner" | "admin" | "employee" | null> {
  const supabase = await createClient();

  // Check if user is the owner of this company
  const { data: companyOwner, error: ownerError } = await supabase
    .from("company_owners")
    .select("id")
    .eq("user_id", userId)
    .eq("company_id", companyId)
    .single();

  if (!ownerError && companyOwner) {
    return "company_owner";
  }

  // Check if user is an employee of this company
  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("id")
    .eq("auth_user_id", userId)
    .eq("company_id", companyId)
    .single();

  if (!employeeError && employee) {
    return "employee";
  }

  // Get user's role from auth metadata for admin check
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  return user.user_metadata?.role === "admin" ? "admin" : null;
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
