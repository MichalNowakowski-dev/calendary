"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [user] = useState<AuthUser | null>(initialUser);
  const status: AuthStatus = user ? "authenticated" : "unauthenticated";

  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange(() => {
      router.refresh();
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status }),
    [user, status]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
