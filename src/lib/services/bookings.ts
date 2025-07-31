import { createClient } from "@/lib/supabase/client";
import { Employee } from "@/lib/types/database";
import { BookingFormData } from "../validations/booking";

const supabase = createClient();

export async function fetchAvailableTimeSlots(
  date: string,
  employeeIds: string[],
  durationMinutes: number
): Promise<string[]> {
  if (!date || employeeIds.length === 0) return [];

  const { data: schedules, error: schedulesError } = await supabase
    .from("schedules")
    .select("employee_id, start_time, end_time, start_date, end_date")
    .in("employee_id", employeeIds)
    .lte("start_date", date)
    .gte("end_date", date);

  if (schedulesError) throw schedulesError;

  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select("employee_id, start_time, end_time")
    .in("employee_id", employeeIds)
    .eq("date", date)
    .neq("status", "cancelled");

  if (appointmentsError) throw appointmentsError;

  // Generowanie slotów
  const slots: string[] = [];
  for (let hour = 8; hour < 18; hour++) {
    for (let minutes = 0; minutes < 60; minutes += 30) {
      slots.push(
        `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
      );
    }
  }

  const available: string[] = [];

  for (const slot of slots) {
    const slotStart = new Date(`${date}T${slot}:00`);
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

    const isAvailable = employeeIds.some((employeeId) => {
      const employeeSchedule = schedules?.find(
        (s) => s.employee_id === employeeId
      );
      if (!employeeSchedule) return false;

      const workStart = new Date(`${date}T${employeeSchedule.start_time}`);
      const workEnd = new Date(`${date}T${employeeSchedule.end_time}`);

      if (slotStart < workStart || slotEnd > workEnd) return false;

      const conflict = appointments?.some((a) => {
        if (a.employee_id !== employeeId) return false;
        const aStart = new Date(`${date}T${a.start_time}`);
        const aEnd = new Date(`${date}T${a.end_time}`);
        return slotStart < aEnd && slotEnd > aStart;
      });

      return !conflict;
    });

    if (isAvailable) available.push(slot);
  }

  return available;
}

// --- 1. Utwórz lub pobierz klienta ---
async function getOrCreateCustomer(
  companyId: string,
  name: string,
  email: string,
  phone?: string
) {
  try {
    // Check for existing customer using maybeSingle to handle no results gracefully
    const { data: existingCustomer, error: lookupError } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email)
      .eq("company_id", companyId)
      .maybeSingle();

    if (lookupError) {
      console.error("Customer lookup error:", lookupError);
      return null;
    }

    if (existingCustomer) return existingCustomer.id;

    // Create new customer if none exists
    const { data: newCustomer, error: insertError } = await supabase
      .from("customers")
      .insert({
        company_id: companyId,
        name,
        email,
        phone: phone || null,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Customer creation error:", insertError);
      return null;
    }

    return newCustomer.id;
  } catch (err) {
    console.error("Customer creation error:", err);
    return null;
  }
}

// --- 2. Wybór pracownika, jeśli klient nie wskazał ---
async function findAvailableEmployee(
  serviceEmployees: Employee[],
  date: string,
  startTime: string,
  endTime: string
): Promise<string | null> {
  for (const employee of serviceEmployees) {
    // Sprawdź czy pracuje tego dnia
    const { data: schedules } = await supabase
      .from("schedules")
      .select("*")
      .eq("employee_id", employee.id)
      .lte("start_date", date)
      .gte("end_date", date);

    if (!schedules || schedules.length === 0) continue;

    // Sprawdź konflikty
    const { data: conflicts } = await supabase
      .from("appointments")
      .select("*")
      .eq("employee_id", employee.id)
      .eq("date", date)
      .neq("status", "cancelled")
      .or(`and(start_time.lte.${endTime},end_time.gt.${startTime})`);

    if (!conflicts || conflicts.length === 0) {
      return employee.id;
    }
  }
  return null;
}

// --- 3. Utworzenie rezerwacji ---
async function createAppointment(data: {
  companyId: string;
  serviceId: string;
  employeeId: string;
  customerId: string | null;
  name: string;
  email: string;
  phone?: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}) {
  const { error } = await supabase.from("appointments").insert({
    company_id: data.companyId,
    service_id: data.serviceId,
    employee_id: data.employeeId,
    customer_id: data.customerId,
    customer_name: data.name,
    customer_email: data.email,
    customer_phone: data.phone || null,
    date: data.date,
    start_time: data.startTime,
    end_time: data.endTime,
    status: "booked",
    notes: data.notes || null,
  });

  if (error) throw error;
}

// --- 4. Główna funkcja submitu ---
export async function submitBooking(
  formData: BookingFormData,
  companyId: string,
  serviceId: string,
  serviceEmployees: Employee[],
  serviceDurationMinutes: number
) {
  const startTime = formData.time;
  const startDate = new Date(`${formData.date}T${startTime}:00`);
  const endDate = new Date(
    startDate.getTime() + serviceDurationMinutes * 60000
  );
  const endTime = endDate.toTimeString().substring(0, 5);

  // 1. Wyznacz pracownika
  let employeeId: string | undefined =
    formData.employeeId && formData.employeeId !== "no-preference"
      ? formData.employeeId
      : ((await findAvailableEmployee(
          serviceEmployees,
          formData.date,
          startTime,
          endTime
        )) ?? undefined);

  if (!employeeId) {
    throw new Error("Brak dostępnych specjalistów w wybranym terminie");
  }

  // 2. Klient
  const customerId = await getOrCreateCustomer(
    companyId,
    formData.customerName,
    formData.customerEmail,
    formData.customerPhone || undefined
  );

  // 3. Utwórz rezerwację
  await createAppointment({
    companyId,
    serviceId,
    employeeId,
    customerId,
    name: formData.customerName,
    email: formData.customerEmail,
    phone: formData.customerPhone || undefined,
    date: formData.date,
    startTime,
    endTime,
    notes: formData.notes || undefined,
  });

  return employeeId;
}
