"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserPassword(newPassword: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/employee/settings");
  return { success: true, data };
}
