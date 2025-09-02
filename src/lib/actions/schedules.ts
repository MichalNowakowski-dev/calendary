"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

import type { ActionState } from "./types";

export async function createScheduleAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await createClient();

    const scheduleData = {
      employee_id: formData.get("employeeId") as string,
      start_date: formData.get("startDate") as string,
      end_date: formData.get("endDate") as string,
      start_time: formData.get("startTime") as string,
      end_time: formData.get("endTime") as string,
    };

    const { data, error } = await supabase
      .from("schedules")
      .insert(scheduleData)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: `Błąd podczas tworzenia harmonogramu: ${error.message}`,
      };
    }

    revalidatePath("/dashboard/employees");
    return {
      success: true,
      message: "Harmonogram został utworzony pomyślnie",
      data,
    };
  } catch (error) {
    console.error("Error in createScheduleAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}

export async function updateScheduleAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await createClient();

    const scheduleId = formData.get("scheduleId") as string;
    if (!scheduleId) {
      return {
        success: false,
        message: "Brak ID harmonogramu",
      };
    }

    const updates = {
      start_date: formData.get("startDate") as string,
      end_date: formData.get("endDate") as string,
      start_time: formData.get("startTime") as string,
      end_time: formData.get("endTime") as string,
    };

    const { data, error } = await supabase
      .from("schedules")
      .update(updates)
      .eq("id", scheduleId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: `Błąd podczas aktualizacji harmonogramu: ${error.message}`,
      };
    }

    revalidatePath("/dashboard/employees");
    return {
      success: true,
      message: "Harmonogram został zaktualizowany pomyślnie",
      data,
    };
  } catch (error) {
    console.error("Error in updateScheduleAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}

export async function deleteScheduleAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await createClient();

    const scheduleId = formData.get("scheduleId") as string;
    if (!scheduleId) {
      return {
        success: false,
        message: "Brak ID harmonogramu",
      };
    }

    const { error } = await supabase
      .from("schedules")
      .delete()
      .eq("id", scheduleId);

    if (error) {
      return {
        success: false,
        message: `Błąd podczas usuwania harmonogramu: ${error.message}`,
      };
    }

    revalidatePath("/dashboard/employees");
    return {
      success: true,
      message: "Harmonogram został usunięty pomyślnie",
    };
  } catch (error) {
    console.error("Error in deleteScheduleAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}
