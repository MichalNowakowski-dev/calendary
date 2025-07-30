"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { serverDb } from "@/lib/db-server";

import type { ActionState } from "./types";

export async function createAppointmentAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = createClient();

    const appointmentData = {
      company_id: formData.get("companyId") as string,
      employee_id: (formData.get("employeeId") as string) || null,
      service_id: formData.get("serviceId") as string,
      customer_name: formData.get("customerName") as string,
      customer_email: formData.get("customerEmail") as string,
      customer_phone: (formData.get("customerPhone") as string) || null,
      date: formData.get("date") as string,
      start_time: formData.get("startTime") as string,
      end_time: formData.get("endTime") as string,
      status: "booked" as const,
    };

    const { data, error } = await supabase
      .from("appointments")
      .insert(appointmentData)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: `Błąd podczas tworzenia wizyty: ${error.message}`,
      };
    }

    revalidatePath("/dashboard/appointments");
    return {
      success: true,
      message: "Wizyta została utworzona pomyślnie",
      data,
    };
  } catch (error) {
    console.error("Error in createAppointmentAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}

export async function updateAppointmentAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = createClient();

    const appointmentId = formData.get("appointmentId") as string;
    if (!appointmentId) {
      return {
        success: false,
        message: "Brak ID wizyty",
      };
    }

    const updates = {
      employee_id: (formData.get("employeeId") as string) || null,
      service_id: formData.get("serviceId") as string,
      customer_name: formData.get("customerName") as string,
      customer_email: formData.get("customerEmail") as string,
      customer_phone: (formData.get("customerPhone") as string) || null,
      date: formData.get("date") as string,
      start_time: formData.get("startTime") as string,
      end_time: formData.get("endTime") as string,
      status: formData.get("status") as "booked" | "cancelled" | "completed",
    };

    const { data, error } = await supabase
      .from("appointments")
      .update(updates)
      .eq("id", appointmentId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: `Błąd podczas aktualizacji wizyty: ${error.message}`,
      };
    }

    revalidatePath("/dashboard/appointments");
    return {
      success: true,
      message: "Wizyta została zaktualizowana pomyślnie",
      data,
    };
  } catch (error) {
    console.error("Error in updateAppointmentAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}

export async function deleteAppointmentAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = createClient();

    const appointmentId = formData.get("appointmentId") as string;
    if (!appointmentId) {
      return {
        success: false,
        message: "Brak ID wizyty",
      };
    }

    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", appointmentId);

    if (error) {
      return {
        success: false,
        message: `Błąd podczas usuwania wizyty: ${error.message}`,
      };
    }

    revalidatePath("/dashboard/appointments");
    return {
      success: true,
      message: "Wizyta została usunięta pomyślnie",
    };
  } catch (error) {
    console.error("Error in deleteAppointmentAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}

export async function getEmployeeAppointments(employeeId: string) {
  return await serverDb.getEmployeeAppointments(employeeId);
}
