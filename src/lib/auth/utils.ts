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
  };
}
const supabase = createClient();

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

    // If this is a company owner, create the company and link the user
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

      // Link user to company as owner
      const { error: linkError } = await supabase.from("company_users").insert({
        company_id: companyData.id,
        user_id: authData.user.id,
        role: "owner",
        status: "active",
      });

      if (linkError) throw linkError;
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
    const { data, error } = await supabase
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
          address_street,
          address_city,
          phone,
          industry,
          created_at
        )
      `
      )
      .eq("user_id", userId)
      .in("status", ["active", "invited"]);

    if (error) throw error;

    return data || [];
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
  let baseSlug = name
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
