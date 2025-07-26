import { createClient as createClientServer } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { AuthUser } from "./utils";

/**
 * Get the current user from the session (server-side)
 */
export const getCurrentUserServer = async (): Promise<AuthUser | null> => {
  const cookieStore = cookies();
  const supabase = createClientServer(cookieStore);

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
