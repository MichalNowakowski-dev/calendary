"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/lib/auth/utils";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  status: "loading",
});

export const AuthProvider = ({
  initialUser,
  children,
}: {
  initialUser: AuthUser | null;
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [status, setStatus] = useState<AuthStatus>(
    initialUser ? "authenticated" : "unauthenticated"
  );
  const lastRefreshTime = useRef<number>(0);
  const isRefreshing = useRef<boolean>(false);

  useEffect(() => {
    const supabase = createClient();

    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state change: ${event}`, {
        pathname,
        hasSession: !!session,
      });

      // Prevent rapid successive refreshes
      const now = Date.now();
      if (now - lastRefreshTime.current < 1000) {
        console.log("Skipping refresh - too soon since last refresh");
        return;
      }

      // Prevent infinite loops by checking if we're already refreshing
      if (isRefreshing.current) {
        console.log("Skipping refresh - already refreshing");
        return;
      }

      // Update local state first
      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          first_name: session.user.user_metadata?.first_name || "",
          last_name: session.user.user_metadata?.last_name || "",
          role: session.user.user_metadata?.role || "customer",
          phone: session.user.user_metadata?.phone,
        };
        setUser(authUser);
        setStatus("authenticated");
      } else {
        setUser(null);
        setStatus("unauthenticated");
      }

      // Only refresh on specific auth events that require a page refresh
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED"
      ) {
        // Skip refresh for 404 pages to prevent infinite loops
        if (pathname === "/404" || pathname.includes("/not-found")) {
          console.log("Skipping refresh for 404 page");
          return;
        }

        // Skip refresh for invalid protected routes to prevent infinite loops
        const validProtectedPaths = [
          "/company_owner",
          "/company_owner/analytics", 
          "/company_owner/appointments",
          "/company_owner/customers",
          "/company_owner/employees", 
          "/company_owner/services",
          "/company_owner/settings",
          "/company_owner/subscription",
          "/employee",
          "/employee/appointments",
          "/employee/schedule", 
          "/employee/services",
          "/employee/settings",
          "/customer",
          "/customer/booking",
          "/admin",
          "/admin/analytics",
          "/admin/companies", 
          "/admin/permissions",
          "/admin/settings",
          "/admin/subscriptions"
        ];
        
        const isProtectedPrefix = ["/company_owner", "/employee", "/customer", "/admin"].some(prefix => 
          pathname.startsWith(prefix)
        );
        
        const isValidProtectedPath = validProtectedPaths.some(validPath => 
          pathname === validPath || pathname.startsWith(validPath + "/")
        );
        
        if (isProtectedPrefix && !isValidProtectedPath) {
          console.log("Skipping refresh for invalid protected route:", pathname);
          return;
        }

        // Skip refresh for non-existing paths to prevent infinite loops
        if (pathname && !pathname.startsWith("/") && pathname !== "/") {
          console.log(
            "Skipping refresh for potentially invalid path:",
            pathname
          );
          return;
        }

        isRefreshing.current = true;
        lastRefreshTime.current = now;

        console.log("Triggering refresh for auth event:", event);

        try {
          // Use a small delay to ensure state updates are processed
          setTimeout(() => {
            router.refresh();
            isRefreshing.current = false;
          }, 100);
        } catch (error) {
          console.error("Auth refresh error:", error);
          isRefreshing.current = false;
        }
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [router, pathname]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status }),
    [user, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
