"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export const CustomerLogoutButton = () => {
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className="w-full sm:w-auto"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Wyloguj się
    </Button>
  );
};
