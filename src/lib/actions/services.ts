"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

import { serviceSchema } from "@/lib/validations/service";
import type {
  Company,
  Employee,
  Service,
  ServiceWithEmployees,
} from "@/lib/types/database";

import type { ActionState } from "./types";

export async function createServiceAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await createClient();

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
    const supabase = await createClient();

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
    const supabase = await createClient();

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

// Employee service assignment actions
export async function assignEmployeeToServiceAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await createClient();

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
    const supabase = await createClient();

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

// Data fetching function
export async function getServicesData() {
  const supabase = await createClient();

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
      status,
      company:companies (
        id,
        name,
        slug,
        description,
        address_street,
        address_city,
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
    services: (services as ServiceWithEmployees[]) || [],
    employees: (employees as Employee[]) || [],
    company,
  };
}
