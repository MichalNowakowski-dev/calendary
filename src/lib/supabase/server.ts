import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      async getAll() {
        return (await cookieStore).getAll();
      },
      async setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(async ({ name, value, options }) => {
            (await cookieStore).set(name, value, options);
          });
        } catch (error) {
          console.error(error);
        }
      },
    },
  });
};

// Admin client for operations that require service role privileges
export const createAdminClient = () => {
  if (!supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  return createServerClient(supabaseUrl!, supabaseServiceRoleKey, {
    cookies: {
      async getAll() {
        return [];
      },
      async setAll() {
        // No-op for admin client
      },
    },
  });
};
