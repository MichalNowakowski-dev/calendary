"use server";

import {
  createClient as createServerClient,
  createAdminClient,
} from "@/lib/supabase/server";
import { serverDb } from "@/lib/db-server";
import { sendInvitationEmail } from "@/lib/email";
import {
  employeeFormSchema,
  type EmployeeFormData,
  type EmployeeActionResult,
} from "@/lib/validations/employee";
import { z } from "zod";

interface CreateEmployeeData extends EmployeeFormData {
  companyId: string;
}

export async function createEmployee(
  data: CreateEmployeeData
): Promise<EmployeeActionResult> {
  const supabase = createServerClient();

  // Server-side validation
  const validationResult = employeeFormSchema.safeParse(data);
  if (!validationResult.success) {
    const errors: Record<string, string[]> = {};
    validationResult.error.issues.forEach((error: z.core.$ZodIssue) => {
      const field = error.path[0] as string;
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(error.message);
    });

    return {
      success: false,
      message: "Dane formularza są nieprawidłowe",
      errors,
    };
  }

  let supabaseAdmin;
  try {
    supabaseAdmin = createAdminClient();
  } catch (error) {
    console.error("Admin client creation error:", error);
    return {
      success: false,
      message:
        "Konfiguracja serwera nie jest kompletna. Skontaktuj się z administratorem.",
    };
  }

  try {
    // Generate a random temporary password
    const tempPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);

    // Create user in Supabase Auth using admin client
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          first_name: data.first_name,
          last_name: data.last_name,
          role: "employee",
        },
      });

    if (authError) {
      console.error("Auth error:", authError);
      return {
        success: false,
        message: "Nie udało się utworzyć konta użytkownika",
      };
    }

    if (!authData.user) {
      return {
        success: false,
        message: "Nie udało się utworzyć konta użytkownika",
      };
    }

    // Get company name for email
    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .select("name")
      .eq("id", data.companyId)
      .single();

    if (companyError) {
      console.error("Company fetch error:", companyError);
      return {
        success: false,
        message: "Nie udało się pobrać danych firmy",
      };
    }

    // Create employee record in database with new structure
    const { data: employeeData, error: employeeError } = await supabase
      .from("employees")
      .insert({
        company_id: data.companyId,
        user_id: authData.user.id,
        name: `${data.first_name} ${data.last_name}`,
        visible: data.visible,
        phone_number: data.phone_number || null,
        email: data.email,
        auth_user_id: authData.user.id,
      })
      .select()
      .single();

    if (employeeError) {
      console.error("Employee creation error:", employeeError);
      return {
        success: false,
        message: "Nie udało się utworzyć rekordu pracownika",
      };
    }

    // Create company_user record
    const { error: companyUserError } = await supabase
      .from("company_users")
      .insert({
        company_id: data.companyId,
        user_id: authData.user.id,
        role: data.role,
        status: "invited",
      });

    if (companyUserError) {
      console.error("Company user creation error:", companyUserError);
      return {
        success: false,
        message: "Nie udało się przypisać pracownika do firmy",
      };
    }

    // Create employee-service relationships
    if (data.selectedServices.length > 0) {
      const serviceRelations = data.selectedServices.map((serviceId) => ({
        employee_id: employeeData.id,
        service_id: serviceId,
      }));

      const { error: serviceError } = await supabase
        .from("employee_services")
        .insert(serviceRelations);

      if (serviceError) {
        console.error("Service assignment error:", serviceError);
        return {
          success: false,
          message: "Nie udało się przypisać usług do pracownika",
        };
      }
    }

    // Send invitation email
    const employeeName = `${data.first_name} ${data.last_name}`;

    await sendInvitationEmail({
      to: data.email,
      subject: `Zaproszenie do systemu zarządzania ${companyData.name}`,
      employeeName,
      companyName: companyData.name,
      tempPassword,
    });

    return {
      success: true,
      message: "Pracownik został dodany i otrzyma email z danymi logowania",
      employee: employeeData,
    };
  } catch (error) {
    console.error("Create employee error:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd podczas dodawania pracownika",
    };
  }
}

export async function getEmployeesWithServices(companyId: string) {
  try {
    const employees = await serverDb.getEmployeesWithDetails(companyId);
    return employees;
  } catch (error) {
    console.error("Get employees error:", error);
    throw error;
  }
}

export async function updateEmployee(
  employeeId: string,
  data: EmployeeFormData
): Promise<EmployeeActionResult> {
  const supabase = createServerClient();

  // Server-side validation
  const validationResult = employeeFormSchema.safeParse(data);
  if (!validationResult.success) {
    const errors: Record<string, string[]> = {};
    validationResult.error.issues.forEach((error: z.ZodIssue) => {
      const field = error.path[0] as string;
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(error.message);
    });

    return {
      success: false,
      message: "Dane formularza są nieprawidłowe",
      errors,
    };
  }

  try {
    // Update employee record
    const { error: employeeError } = await supabase
      .from("employees")
      .update({
        name: `${data.first_name} ${data.last_name}`,
        visible: data.visible,
        email: data.email,
        phone_number: data.phone_number,
      })
      .eq("id", employeeId);

    if (employeeError) {
      return {
        success: false,
        message: "Nie udało się zaktualizować pracownika",
      };
    }

    // Update role in company_users table
    const { data: employeeData } = await supabase
      .from("employees")
      .select("auth_user_id")
      .eq("id", employeeId)
      .single();

    if (employeeData?.auth_user_id) {
      const { error: roleError } = await supabase
        .from("company_users")
        .update({ role: data.role })
        .eq("user_id", employeeData.auth_user_id);

      if (roleError) {
        return {
          success: false,
          message: "Nie udało się zaktualizować roli pracownika",
        };
      }
    }

    // Update service assignments
    // First, remove all current assignments
    const { error: deleteError } = await supabase
      .from("employee_services")
      .delete()
      .eq("employee_id", employeeId);

    if (deleteError) {
      return {
        success: false,
        message: "Nie udało się zaktualizować przypisania usług",
      };
    }

    // Then, add new assignments
    if (data.selectedServices.length > 0) {
      const serviceRelations = data.selectedServices.map((serviceId) => ({
        employee_id: employeeId,
        service_id: serviceId,
      }));

      const { error: insertError } = await supabase
        .from("employee_services")
        .insert(serviceRelations);

      if (insertError) {
        return {
          success: false,
          message: "Nie udało się przypisać usług do pracownika",
        };
      }
    }

    return {
      success: true,
      message: "Pracownik został zaktualizowany",
    };
  } catch (error) {
    console.error("Update employee error:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd podczas aktualizacji pracownika",
    };
  }
}

export async function deleteEmployee(employeeId: string) {
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin.auth.admin.deleteUser(employeeId);

  if (error) {
    console.error("Delete employee error:", error);
    return { success: false, message: "Nie udało się usunąć pracownika" };
  }

  return { success: true, message: "Pracownik został usunięty" };
}

// Client-side function for deleting employee database records
export async function deleteEmployeeClient(
  employeeId: string,
  authUserId?: string
) {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    // Delete employee record
    const { error: employeeError } = await supabase
      .from("employees")
      .delete()
      .eq("id", employeeId);

    if (employeeError) {
      return {
        success: false,
        message: `Błąd podczas usuwania pracownika: ${employeeError.message}`,
      };
    }

    // Delete company_user record if auth_user_id exists
    if (authUserId) {
      const { error: companyUserError } = await supabase
        .from("company_users")
        .delete()
        .eq("user_id", authUserId);

      if (companyUserError) {
        console.error("Error deleting company_user record:", companyUserError);
        // Don't fail the operation if this fails, as the main employee record is deleted
      }
    }

    return {
      success: true,
      message: "Pracownik został usunięty",
    };
  } catch (error) {
    console.error("Error in deleteEmployeeClient:", error);
    return {
      success: false,
      message: "Wystąpił nieoczekiwany błąd",
    };
  }
}
