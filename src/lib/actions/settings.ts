"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

import type { ActionState } from "./types";

export async function updateCompanySettingsAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await createClient();

    const companyId = formData.get("companyId") as string;
    if (!companyId) {
      return {
        success: false,
        message: "Brak ID firmy",
      };
    }

    const settingsData = {
      company_id: companyId,
      booking_buffer: Number(formData.get("bookingBuffer")) || null,
      max_bookings_per_day: Number(formData.get("maxBookingsPerDay")) || null,
      enable_notifications: formData.get("enableNotifications") === "on",
      auto_assign_employee: formData.get("autoAssignEmployee") === "on",
    };

    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from("settings")
      .select("id")
      .eq("company_id", companyId)
      .single();

    let result;
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from("settings")
        .update(settingsData)
        .eq("company_id", companyId)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from("settings")
        .insert(settingsData)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    revalidatePath("/dashboard/settings");
    return {
      success: true,
      message: "Ustawienia zostały zaktualizowane pomyślnie",
      data: result,
    };
  } catch (error) {
    console.error("Error in updateCompanySettingsAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}
