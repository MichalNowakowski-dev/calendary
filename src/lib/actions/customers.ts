import { createClient } from "@/lib/supabase/client";
import type {
  Customer,
  CustomerInsert,
  CustomerUpdate,
} from "@/lib/types/database";

export interface CustomerWithStats extends Customer {
  appointment_count: number;
  last_visit: string | null;
  total_spent: number;
}

interface CustomerWithAppointments extends Customer {
  appointments: Array<{
    id: string;
    date: string;
    service: {
      price: number;
    };
  }>;
}

export async function getCustomers(
  companyId: string
): Promise<CustomerWithStats[]> {
  const supabase = createClient();

  try {
    // First, check if company_id column exists
    const { data: customersData, error } = await supabase
      .from("customers")
      .select(
        `
        *,
        appointments:appointments(
          id,
          date,
          service:services(price)
        )
      `
      )
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching customers:", error);
      return [];
    }

    // Filter by company_id if the column exists
    const filteredCustomers =
      customersData?.filter(
        (customer: CustomerWithAppointments) =>
          customer.company_id === companyId
      ) || [];

    // Transform data to include statistics
    const customersWithStats = filteredCustomers.map(
      (customer: CustomerWithAppointments) => {
        const appointments = customer.appointments || [];
        const totalSpent = appointments.reduce((sum: number, apt) => {
          return sum + (apt.service?.price || 0);
        }, 0);

        const lastVisit =
          appointments.length > 0
            ? appointments.sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )[0]?.date
            : null;

        return {
          ...customer,
          appointment_count: appointments.length,
          last_visit: lastVisit,
          total_spent: totalSpent,
        };
      }
    );

    return customersWithStats;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
}

export async function getCustomerById(
  customerId: string
): Promise<Customer | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return null;
  }
}

export async function createCustomer(
  customerData: CustomerInsert
): Promise<Customer | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("customers")
      .insert(customerData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
}

export async function updateCustomer(
  customerId: string,
  customerData: CustomerUpdate
): Promise<Customer | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("customers")
      .update(customerData)
      .eq("id", customerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
}

export async function deleteCustomer(customerId: string): Promise<boolean> {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", customerId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
}

export async function findOrCreateCustomer(
  email: string,
  name: string,
  phone: string | null,
  companyId: string
): Promise<Customer> {
  const supabase = createClient();

  try {
    // First, try to find existing customer by email
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("*")
      .eq("email", email)
      .eq("company_id", companyId)
      .single();

    if (existingCustomer) {
      return existingCustomer;
    }

    // If not found, create new customer
    const { data: newCustomer, error: createError } = await supabase
      .from("customers")
      .insert({
        name,
        email,
        phone,
        company_id: companyId,
      })
      .select()
      .single();

    if (createError) throw createError;
    return newCustomer;
  } catch (error) {
    console.error("Error finding or creating customer:", error);
    throw error;
  }
}

export async function getCustomerAppointments(
  customerId: string,
  companyId: string
): Promise<
  Array<{
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
    service: {
      name: string;
      price: number;
    };
    employee?: {
      name: string;
    };
  }>
> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        service:services(name, price),
        employee:employees(name)
      `
      )
      .eq("customer_id", customerId)
      .eq("company_id", companyId)
      .order("date", { ascending: false })
      .order("start_time", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching customer appointments:", error);
    throw error;
  }
}
