"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, User, Phone, Mail, X } from "lucide-react";
import { Company, Service } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const bookingSchema = z.object({
  customerName: z
    .string()
    .min(2, "Imię i nazwisko musi mieć co najmniej 2 znaki"),
  customerEmail: z.string().email("Nieprawidłowy adres email"),
  customerPhone: z.string().optional(),
  date: z.string().min(1, "Wybierz datę"),
  time: z.string().min(1, "Wybierz godzinę"),
  employeeId: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  service: Service & { employees: any[] };
}

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour < 18; hour++) {
    for (let minutes = 0; minutes < 60; minutes += 30) {
      const time = `${hour.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      slots.push(time);
    }
  }
  return slots;
};

const getMinDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

const getMaxDate = () => {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  return maxDate.toISOString().split("T")[0];
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(price);
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}min`;
  }
};

export default function BookingModal({
  isOpen,
  onClose,
  company,
  service,
}: BookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  const supabase = createClient();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      date: "",
      time: "",
      employeeId: "",
    },
  });

  const timeSlots = generateTimeSlots();

  // Watch form values to trigger availability checking
  const watchedDate = form.watch("date");
  const watchedEmployeeId = form.watch("employeeId");

  useEffect(() => {
    if (watchedDate) {
      checkAvailability(watchedDate, watchedEmployeeId);
      // Reset time selection when date/employee changes
      form.setValue("time", "");
    } else {
      setAvailableTimeSlots([]);
    }
  }, [watchedDate, watchedEmployeeId]);

  // Check availability when date or employee changes
  const checkAvailability = async (
    selectedDate: string,
    selectedEmployeeId?: string
  ) => {
    if (!selectedDate) return;

    setIsLoadingAvailability(true);
    try {
      // Get employees for this service (either selected one or all)
      const employeeIds = selectedEmployeeId
        ? [selectedEmployeeId]
        : service.employees.map((emp: any) => emp.id);

      if (employeeIds.length === 0) {
        setAvailableTimeSlots([]);
        return;
      }

      // Get employee schedules that include the selected date
      const { data: schedules, error: schedulesError } = await supabase
        .from("schedules")
        .select("employee_id, start_time, end_time, start_date, end_date")
        .in("employee_id", employeeIds)
        .lte("start_date", selectedDate)
        .gte("end_date", selectedDate);

      if (schedulesError) throw schedulesError;

      // Get existing appointments for the selected date
      const { data: appointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select("employee_id, start_time, end_time")
        .in("employee_id", employeeIds)
        .eq("date", selectedDate)
        .neq("status", "cancelled");

      if (appointmentsError) throw appointmentsError;

      // Calculate available time slots
      const available: string[] = [];

      for (const slot of timeSlots) {
        const slotStart = new Date(`${selectedDate}T${slot}:00`);
        const slotEnd = new Date(
          slotStart.getTime() + service.duration_minutes * 60000
        );

        // Check if any employee is available for this slot
        const isSlotAvailable = employeeIds.some((employeeId) => {
          // Check if employee works during this time
          const employeeSchedule = schedules?.find(
            (s) => s.employee_id === employeeId
          );
          if (!employeeSchedule) return false;

          const workStart = new Date(
            `${selectedDate}T${employeeSchedule.start_time}`
          );
          const workEnd = new Date(
            `${selectedDate}T${employeeSchedule.end_time}`
          );

          // Check if slot fits within working hours
          if (slotStart < workStart || slotEnd > workEnd) return false;

          // Check if there are no conflicting appointments
          const hasConflict = appointments?.some((appointment) => {
            if (appointment.employee_id !== employeeId) return false;

            const appointmentStart = new Date(
              `${selectedDate}T${appointment.start_time}`
            );
            const appointmentEnd = new Date(
              `${selectedDate}T${appointment.end_time}`
            );

            // Check for overlap
            return slotStart < appointmentEnd && slotEnd > appointmentStart;
          });

          return !hasConflict;
        });

        if (isSlotAvailable) {
          available.push(slot);
        }
      }

      setAvailableTimeSlots(available);
    } catch (error) {
      console.error("Error checking availability:", error);
      setAvailableTimeSlots([]);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);

    try {
      // Calculate end time
      const startTime = data.time;
      const startDate = new Date(`${data.date}T${startTime}:00`);
      const endDate = new Date(
        startDate.getTime() + service.duration_minutes * 60000
      );
      const endTime = endDate.toTimeString().substring(0, 5);

      // Select employee (either specified or first available)
      let selectedEmployeeId = data.employeeId;
      if (!selectedEmployeeId && service.employees.length > 0) {
        // Find first available employee for this slot
        for (const employee of service.employees) {
          // Check if employee has schedule for this day
          const { data: schedules } = await supabase
            .from("schedules")
            .select("*")
            .eq("employee_id", employee.id)
            .lte("start_date", data.date)
            .gte("end_date", data.date);

          const schedule =
            schedules && schedules.length > 0 ? schedules[0] : null;

          if (schedule) {
            // Check if no conflicting appointments
            const { data: conflicts } = await supabase
              .from("appointments")
              .select("*")
              .eq("employee_id", employee.id)
              .eq("date", data.date)
              .neq("status", "cancelled")
              .or(`and(start_time.lte.${endTime},end_time.gt.${startTime})`);

            if (!conflicts || conflicts.length === 0) {
              selectedEmployeeId = employee.id;
              break;
            }
          }
        }
      }

      if (!selectedEmployeeId) {
        throw new Error("Brak dostępnych specjalistów w wybranym terminie");
      }

      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          company_id: company.id,
          service_id: service.id,
          employee_id: selectedEmployeeId,
          customer_name: data.customerName,
          customer_email: data.customerEmail,
          customer_phone: data.customerPhone || null,
          date: data.date,
          start_time: startTime,
          end_time: endTime,
          status: "booked",
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      alert(
        "Rezerwacja została pomyślnie złożona! Otrzymasz potwierdzenie na adres email."
      );
      onClose();
      form.reset();
    } catch (error: any) {
      console.error("Booking error:", error);
      alert(
        error.message || "Wystąpił błąd podczas rezerwacji. Spróbuj ponownie."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Rezerwacja wizyty</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Service and Company Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">{service.name}</CardTitle>
              <CardDescription>w {company.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {formatDuration(service.duration_minutes)}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <span>{formatPrice(service.price)}</span>
                </div>
              </div>

              {service.description && (
                <p className="text-gray-600 dark:text-gray-300 mt-3">
                  {service.description}
                </p>
              )}

              {service.employees && service.employees.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Wybierz pracownika (opcjonalnie):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {service.employees.map((employee: any) => (
                      <Badge
                        key={employee.id}
                        variant="outline"
                        className="text-xs"
                      >
                        {employee.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dane kontaktowe
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imię i nazwisko *</FormLabel>
                        <FormControl>
                          <Input placeholder="Jan Kowalski" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefon</FormLabel>
                        <FormControl>
                          <Input placeholder="+48 123 456 789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="jan@example.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date and Time Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Termin wizyty
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            min={getMinDate()}
                            max={getMaxDate()}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        {field.value && isLoadingAvailability && (
                          <p className="text-sm text-blue-600 mt-1">
                            Sprawdzam dostępność terminów...
                          </p>
                        )}
                        {field.value &&
                          !isLoadingAvailability &&
                          availableTimeSlots.length === 0 && (
                            <p className="text-sm text-red-600 mt-1">
                              Brak dostępnych terminów w tym dniu. Spróbuj
                              wybrać inny dzień.
                            </p>
                          )}
                        {field.value &&
                          !isLoadingAvailability &&
                          availableTimeSlots.length > 0 && (
                            <p className="text-sm text-green-600 mt-1">
                              Dostępne {availableTimeSlots.length} terminów
                            </p>
                          )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Godzina *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={
                            !form.watch("date") || isLoadingAvailability
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  !form.watch("date")
                                    ? "Najpierw wybierz datę"
                                    : isLoadingAvailability
                                    ? "Sprawdzam dostępność..."
                                    : availableTimeSlots.length === 0
                                    ? "Brak dostępnych terminów"
                                    : "Wybierz godzinę"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableTimeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                            {availableTimeSlots.length === 0 &&
                              form.watch("date") &&
                              !isLoadingAvailability && (
                                <SelectItem value="" disabled>
                                  Brak dostępnych terminów w tym dniu
                                </SelectItem>
                              )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Employee Selection (if multiple available) */}
              {service.employees && service.employees.length > 1 && (
                <div>
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Preferowany specjalista (opcjonalnie)
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz specjalistę lub zostaw puste" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Bez preferencji</SelectItem>
                            {service.employees.map((employee: any) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Anuluj
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Rezerwuję..." : "Zarezerwuj wizytę"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
