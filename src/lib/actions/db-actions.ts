"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { serviceSchema } from "@/lib/validations/service";
import type {
  Company,
  Employee,
  Service,
  Appointment,
  Schedule,
  Customer,
  CompanyUser,
  Settings,
} from "@/lib/types/database";

// Common action state type
export type ActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: any;
};

// ===== COMPANY ACTIONS =====

export async function createCompanyAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "Nie jesteś zalogowany",
      };
    }

    const companyData = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      industry: formData.get("industry") as string,
    };

    // Create company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert(companyData)
      .select()
      .single();

    if (companyError) {
      return {
        success: false,
        message: `Błąd podczas tworzenia firmy: ${companyError.message}`,
      };
    }

    // Link user to company as owner
    const { error: linkError } = await supabase.from("company_users").insert({
      company_id: company.id,
      user_id: user.id,
      role: "owner",
      status: "active",
    });

    if (linkError) {
      return {
        success: false,
        message: `Błąd podczas łączenia użytkownika z firmą: ${linkError.message}`,
      };
    }

    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Firma została utworzona pomyślnie",
      data: company,
    };
  } catch (error) {
    console.error("Error in createCompanyAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}

export async function updateCompanyAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const companyId = formData.get("companyId") as string;
    if (!companyId) {
      return {
        success: false,
        message: "Brak ID firmy",
      };
    }

    const updates = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      industry: formData.get("industry") as string,
    };

    const { data, error } = await supabase
      .from("companies")
      .update(updates)
      .eq("id", companyId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: `Błąd podczas aktualizacji firmy: ${error.message}`,
      };
    }

    revalidatePath("/dashboard/settings");
    return {
      success: true,
      message: "Firma została zaktualizowana pomyślnie",
      data,
    };
  } catch (error) {
    console.error("Error in updateCompanyAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}

// ===== SERVICE ACTIONS =====

export async function createServiceAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "Nie jesteś zalogowany",
      };
    }

    // Get user's company
    const { data: companyUsers, error: companyError } = await supabase
      .from("company_users")
      .select("company_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (companyError || !companyUsers) {
      return {
        success: false,
        message: "Nie znaleziono firmy",
      };
    }

    // Parse and validate form data
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      duration_minutes: Number(formData.get("duration_minutes")),
      price: Number(formData.get("price")),
      active: formData.get("active") === "on",
    };

    const validationResult = serviceSchema.safeParse(rawData);

    if (!validationResult.success) {
      const errors: Record<string, string[]> = {};
      validationResult.error.issues.forEach((error: z.ZodIssue) => {
        const field = error.path.join(".");
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(error.message);
      });

      return {
        success: false,
        message: "Błąd walidacji danych",
        errors,
      };
    }

    const validatedData = validationResult.data;

    // Create service
    const { data, error } = await supabase
      .from("services")
      .insert({
        company_id: companyUsers.company_id,
        name: validatedData.name,
        description: validatedData.description || null,
        duration_minutes: validatedData.duration_minutes,
        price: validatedData.price,
        active: validatedData.active,
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: `Błąd podczas tworzenia usługi: ${error.message}`,
      };
    }

    revalidatePath("/dashboard/services");
    return {
      success: true,
      message: "Usługa została utworzona pomyślnie",
      data,
    };
  } catch (error) {
    console.error("Error in createServiceAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}

export async function updateServiceAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const serviceId = formData.get("serviceId") as string;
    if (!serviceId) {
      return {
        success: false,
        message: "Brak ID usługi",
      };
    }

    // Parse and validate form data
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      duration_minutes: Number(formData.get("duration_minutes")),
      price: Number(formData.get("price")),
      active: formData.get("active") === "on",
    };

    const validationResult = serviceSchema.safeParse(rawData);

    if (!validationResult.success) {
      const errors: Record<string, string[]> = {};
      validationResult.error.issues.forEach((error: z.ZodIssue) => {
        const field = error.path.join(".");
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(error.message);
      });

      return {
        success: false,
        message: "Błąd walidacji danych",
        errors,
      };
    }

    const validatedData = validationResult.data;

    // Update service
    const { data, error } = await supabase
      .from("services")
      .update({
        name: validatedData.name,
        description: validatedData.description || null,
        duration_minutes: validatedData.duration_minutes,
        price: validatedData.price,
        active: validatedData.active,
      })
      .eq("id", serviceId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: `Błąd podczas aktualizacji usługi: ${error.message}`,
      };
    }

    revalidatePath("/dashboard/services");
    return {
      success: true,
      message: "Usługa została zaktualizowana pomyślnie",
      data,
    };
  } catch (error) {
    console.error("Error in updateServiceAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}

export async function deleteServiceAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const serviceId = formData.get("serviceId") as string;
    if (!serviceId) {
      return {
        success: false,
        message: "Brak ID usługi",
      };
    }

    // Delete service
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId);

    if (error) {
      return {
        success: false,
        message: `Błąd podczas usuwania usługi: ${error.message}`,
      };
    }

    revalidatePath("/dashboard/services");
    return {
      success: true,
      message: "Usługa została usunięta pomyślnie",
    };
  } catch (error) {
    console.error("Error in deleteServiceAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}

// ===== EMPLOYEE ACTIONS =====

export async function createEmployeeAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "Nie jesteś zalogowany",
      };
    }

    // Get user's company
    const { data: companyUsers, error: companyError } = await supabase
      .from("company_users")
      .select("company_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (companyError || !companyUsers) {
      return {
        success: false,
        message: "Nie znaleziono firmy",
      };
    }

    const employeeData = {
      company_id: companyUsers.company_id,
      name: formData.get("name") as string,
      visible: formData.get("visible") === "on",
    };

    const { data, error } = await supabase
      .from("employees")
      .insert(employeeData)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: `Błąd podczas tworzenia pracownika: ${error.message}`,
      };
    }

    revalidatePath("/dashboard/employees");
    return {
      success: true,
      message: "Pracownik został utworzony pomyślnie",
      data,
    };
  } catch (error) {
    console.error("Error in createEmployeeAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}

export async function updateEmployeeAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const employeeId = formData.get("employeeId") as string;
    if (!employeeId) {
      return {
        success: false,
        message: "Brak ID pracownika",
      };
    }

    const updates = {
      name: formData.get("name") as string,
      visible: formData.get("visible") === "on",
    };

    const { data, error } = await supabase
      .from("employees")
      .update(updates)
      .eq("id", employeeId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: `Błąd podczas aktualizacji pracownika: ${error.message}`,
      };
    }

    revalidatePath("/dashboard/employees");
    return {
      success: true,
      message: "Pracownik został zaktualizowany pomyślnie",
      data,
    };
  } catch (error) {
    console.error("Error in updateEmployeeAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}

export async function deleteEmployeeAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const employeeId = formData.get("employeeId") as string;
    if (!employeeId) {
      return {
        success: false,
        message: "Brak ID pracownika",
      };
    }

    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", employeeId);

    if (error) {
      return {
        success: false,
        message: `Błąd podczas usuwania pracownika: ${error.message}`,
      };
    }

    revalidatePath("/dashboard/employees");
    return {
      success: true,
      message: "Pracownik został usunięty pomyślnie",
    };
  } catch (error) {
    console.error("Error in deleteEmployeeAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}

// ===== EMPLOYEE SERVICE ASSIGNMENT ACTIONS =====

export async function assignEmployeeToServiceAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const employeeId = formData.get("employeeId") as string;
    const serviceId = formData.get("serviceId") as string;

    if (!employeeId || !serviceId) {
      return {
        success: false,
        message: "Brak wymaganych danych",
      };
    }

    const { error } = await supabase.from("employee_services").insert({
      employee_id: employeeId,
      service_id: serviceId,
    });

    if (error) {
      return {
        success: false,
        message: `Błąd podczas przypisywania pracownika: ${error.message}`,
      };
    }

    revalidatePath("/dashboard/services");
    revalidatePath("/dashboard/employees");
    return {
      success: true,
      message: "Pracownik został przypisany do usługi pomyślnie",
    };
  } catch (error) {
    console.error("Error in assignEmployeeToServiceAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}

export async function unassignEmployeeFromServiceAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const employeeId = formData.get("employeeId") as string;
    const serviceId = formData.get("serviceId") as string;

    if (!employeeId || !serviceId) {
      return {
        success: false,
        message: "Brak wymaganych danych",
      };
    }

    const { error } = await supabase
      .from("employee_services")
      .delete()
      .eq("employee_id", employeeId)
      .eq("service_id", serviceId);

    if (error) {
      return {
        success: false,
        message: `Błąd podczas usuwania przypisania: ${error.message}`,
      };
    }

    revalidatePath("/dashboard/services");
    revalidatePath("/dashboard/employees");
    return {
      success: true,
      message: "Przypisanie zostało usunięte pomyślnie",
    };
  } catch (error) {
    console.error("Error in unassignEmployeeFromServiceAction:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}

// ===== SCHEDULE ACTIONS =====

export async function createScheduleAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

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
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

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
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

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

// ===== APPOINTMENT ACTIONS =====

export async function createAppointmentAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

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
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

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
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

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

// ===== SETTINGS ACTIONS =====

export async function updateCompanySettingsAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

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

// ===== DATA FETCHING FUNCTIONS =====

export async function getServicesData() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get current user from server-side
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // Get user's company
  const { data: companyUsers, error: companyError } = await supabase
    .from("company_users")
    .select(
      `
      id,
      role,
      status,
      company:companies (
        id,
        name,
        slug,
        description,
        address,
        phone,
        industry,
        created_at
      )
    `
    )
    .eq("user_id", user.id)
    .eq("status", "active");

  if (companyError) {
    console.error("Error loading company:", companyError);
    throw companyError;
  }

  if (!companyUsers || companyUsers.length === 0) {
    throw new Error("No company found for user");
  }

  const company = companyUsers[0]?.company as unknown as Company;

  // Get services with assigned employees
  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select(
      `
      *,
      employee_services(
        employee:employees(
          id,
          name,
          visible
        )
      )
    `
    )
    .eq("company_id", company.id)
    .order("name", { ascending: true });

  if (servicesError) {
    console.error("Error loading services:", servicesError);
    throw servicesError;
  }

  // Get all employees for assignment management
  const { data: employees, error: employeesError } = await supabase
    .from("employees")
    .select("id, name, visible")
    .eq("company_id", company.id)
    .eq("visible", true)
    .order("name", { ascending: true });

  if (employeesError) {
    console.error("Error loading employees:", employeesError);
    throw employeesError;
  }

  return {
    services: (services as any[]) || [],
    employees: (employees as any[]) || [],
    company,
  };
}
