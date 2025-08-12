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
      payment_status: "pending" as const,
      payment_method: "on_site" as const,
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

export async function getCustomerAppointments(customerEmail: string) {
  try {
    const supabase = createClient();

    // First, get appointments with service_id, employee_id, and company_id
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from("appointments")
      .select(
        `
        id,
        date,
        start_time,
        end_time,
        status,
        payment_status,
        payment_method,
        customer_name,
        customer_email,
        customer_phone,
        notes,
        created_at,
        service_id,
        employee_id,
        company_id
      `
      )
      .eq("customer_email", customerEmail)
      .order("date", { ascending: false })
      .order("start_time", { ascending: false });

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError);
      throw new Error(
        `Błąd podczas ładowania wizyt: ${appointmentsError.message}`
      );
    }

    if (!appointmentsData || appointmentsData.length === 0) {
      return [];
    }

    // Get unique service IDs, employee IDs, and company IDs
    const serviceIds = [
      ...new Set(appointmentsData.map((apt) => apt.service_id).filter(Boolean)),
    ];
    const employeeIds = [
      ...new Set(
        appointmentsData.map((apt) => apt.employee_id).filter(Boolean)
      ),
    ];
    const companyIds = [
      ...new Set(appointmentsData.map((apt) => apt.company_id).filter(Boolean)),
    ];

    // Fetch services data
    const { data: servicesData, error: servicesError } = await supabase
      .from("services")
      .select("id, name, price, duration_minutes")
      .in("id", serviceIds);

    if (servicesError) {
      console.error("Error fetching services:", servicesError);
      throw new Error(`Błąd podczas ładowania usług: ${servicesError.message}`);
    }

    // Fetch employees data
    const { data: employeesData, error: employeesError } = await supabase
      .from("employees")
      .select("id, name")
      .in("id", employeeIds);

    if (employeesError) {
      console.error("Error fetching employees:", employeesError);
      throw new Error(
        `Błąd podczas ładowania pracowników: ${employeesError.message}`
      );
    }

    // Fetch companies data
    const { data: companiesData, error: companiesError } = await supabase
      .from("companies")
      .select("id, name, address_street, address_city")
      .in("id", companyIds);

    if (companiesError) {
      console.error("Error fetching companies:", companiesError);
      throw new Error(`Błąd podczas ładowania firm: ${companiesError.message}`);
    }

    // Create lookup maps
    const servicesMap = new Map(
      servicesData?.map((service) => [service.id, service]) || []
    );
    const employeesMap = new Map(
      employeesData?.map((employee) => [employee.id, employee]) || []
    );
    const companiesMap = new Map(
      companiesData?.map((company) => [company.id, company]) || []
    );

    // Combine the data
    return appointmentsData.map((apt) => {
      const service = servicesMap.get(apt.service_id);
      const employee = apt.employee_id
        ? employeesMap.get(apt.employee_id)
        : null;
      const company = companiesMap.get(apt.company_id);

      return {
        id: apt.id,
        date: apt.date,
        start_time: apt.start_time,
        end_time: apt.end_time,
        status: apt.status,
        payment_status: apt.payment_status,
        payment_method: apt.payment_method,
        customer_name: apt.customer_name,
        customer_email: apt.customer_email,
        customer_phone: apt.customer_phone,
        notes: apt.notes,
        created_at: apt.created_at,
        service: {
          name: service?.name ?? "",
          price: service?.price ?? 0,
          duration_minutes: service?.duration_minutes ?? 0,
        },
        employee: employee
          ? {
              name: employee.name,
            }
          : undefined,
        company: {
          name: company?.name ?? "",
          address_street: company?.address_street ?? null,
          address_city: company?.address_city ?? null,
        },
      };
    });
  } catch (error) {
    console.error("Error in getCustomerAppointments:", error);
    throw error;
  }
}

export async function cancelAppointmentAction(appointmentId: string) {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", appointmentId);

    if (error) {
      return {
        success: false,
        message: `Błąd podczas anulowania wizyty: ${error.message}`,
      };
    }

    revalidatePath("/customer");
    return {
      success: true,
      message: "Wizyta została anulowana",
    };
  } catch (error) {
    console.error("Error in cancelAppointmentAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}

export async function updatePaymentStatusAction(
  appointmentId: string,
  paymentStatus: "pending" | "paid" | "refunded" | "cancelled"
) {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("appointments")
      .update({ payment_status: paymentStatus })
      .eq("id", appointmentId);

    if (error) {
      return {
        success: false,
        message: `Błąd podczas aktualizacji statusu płatności: ${error.message}`,
      };
    }

    revalidatePath("/dashboard/appointments");
    return {
      success: true,
      message: "Status płatności został zaktualizowany",
    };
  } catch (error) {
    console.error("Error in updatePaymentStatusAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}

export async function updateAppointmentStatusAction(
  appointmentId: string,
  newStatus: "booked" | "cancelled" | "completed"
) {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", appointmentId);

    if (error) {
      return {
        success: false,
        message: `Błąd podczas aktualizacji statusu wizyty: ${error.message}`,
      };
    }

    revalidatePath("/dashboard/appointments");
    return {
      success: true,
      message: "Status wizyty został zaktualizowany",
    };
  } catch (error) {
    console.error("Error in updateAppointmentStatusAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}

// Client-side functions for operations that need to be called from client components
export async function updatePaymentStatusClient(
  appointmentId: string,
  paymentStatus: "pending" | "paid" | "refunded" | "cancelled"
) {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { error } = await supabase
      .from("appointments")
      .update({ payment_status: paymentStatus })
      .eq("id", appointmentId);

    if (error) {
      return {
        success: false,
        message: `Błąd podczas aktualizacji statusu płatności: ${error.message}`,
      };
    }

    return {
      success: true,
      message: "Status płatności został zaktualizowany",
    };
  } catch (error) {
    console.error("Error in updatePaymentStatusClient:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}

export async function cancelAppointmentClient(appointmentId: string) {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", appointmentId);

    if (error) {
      return {
        success: false,
        message: `Błąd podczas anulowania wizyty: ${error.message}`,
      };
    }

    return {
      success: true,
      message: "Wizyta została anulowana",
    };
  } catch (error) {
    console.error("Error in cancelAppointmentClient:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}
