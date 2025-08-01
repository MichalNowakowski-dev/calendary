"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Calendar as CalendarIcon, Clock, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type {
  Service,
  Employee,
  Company,
  Appointment,
} from "@/lib/types/database";
import { showToast } from "@/lib/toast";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

const appointmentEditSchema = z.object({
  serviceId: z.string().min(1, "Wybierz usługę"),
  employeeId: z.string().min(1, "Wybierz pracownika"),
  customerName: z
    .string()
    .min(2, "Imię i nazwisko musi mieć co najmniej 2 znaki"),
  customerEmail: z.string().email("Nieprawidłowy adres email"),
  customerPhone: z.string().optional(),
  date: z.string().min(1, "Wybierz datę"),
  time: z.string().min(1, "Wybierz godzinę"),
  status: z.enum(["booked", "completed", "cancelled"]),
});

type AppointmentEditFormData = z.infer<typeof appointmentEditSchema>;

interface AppointmentWithDetails extends Appointment {
  service: Service;
  employee?: Employee;
}

interface AppointmentEditFormProps {
  appointment: AppointmentWithDetails;
  company: Company;
  isOpen: boolean;
  onClose: () => void;
  onAppointmentUpdated: () => void;
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

export default function AppointmentEditForm({
  appointment,
  company,
  isOpen,
  onClose,
  onAppointmentUpdated,
}: AppointmentEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const supabase = createClient();

  const form = useForm<AppointmentEditFormData>({
    resolver: zodResolver(appointmentEditSchema),
    defaultValues: {
      serviceId: appointment.service_id,
      employeeId: appointment.employee_id || "",
      customerName: appointment.customer_name,
      customerEmail: appointment.customer_email,
      customerPhone: appointment.customer_phone || "",
      date: appointment.date,
      time: appointment.start_time,
      status: appointment.status,
    },
  });

  const timeSlots = generateTimeSlots();
  const watchedServiceId = form.watch("serviceId");
  const watchedEmployeeId = form.watch("employeeId");
  const watchedDate = form.watch("date");

  // Reset form when appointment changes
  useEffect(() => {
    if (appointment && isOpen) {
      form.reset({
        serviceId: appointment.service_id,
        employeeId: appointment.employee_id || "",
        customerName: appointment.customer_name,
        customerEmail: appointment.customer_email,
        customerPhone: appointment.customer_phone || "",
        date: appointment.date,
        time: appointment.start_time,
        status: appointment.status,
      });
    }
  }, [appointment, isOpen, form]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load services
        const { data: servicesData, error: servicesError } = await supabase
          .from("services")
          .select("*")
          .eq("company_id", company.id)
          .eq("active", true)
          .order("name", { ascending: true });

        if (servicesError) throw servicesError;
        setServices(servicesData || []);

        // Load employees
        const { data: employeesData, error: employeesError } = await supabase
          .from("employees")
          .select("*")
          .eq("company_id", company.id)
          .order("name", { ascending: true });

        if (employeesError) throw employeesError;
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen, company.id]);

  // Filter employees based on selected service
  useEffect(() => {
    if (!watchedServiceId) {
      setFilteredEmployees([]);
      return;
    }

    const getServiceEmployees = async () => {
      try {
        const { data: serviceEmployees, error } = await supabase
          .from("employee_services")
          .select(
            `
            employee:employees(
              id,
              name,
              visible
            )
          `
          )
          .eq("service_id", watchedServiceId);

        if (error) throw error;

        const availableEmployees = (serviceEmployees || [])
          .flatMap((se) =>
            Array.isArray(se.employee) ? se.employee : [se.employee]
          )
          .filter((emp) => emp && emp.visible) as Employee[];

        setFilteredEmployees(availableEmployees);

        // Reset employee selection if current selection is not available for this service
        const currentEmployeeId = form.getValues("employeeId");
        if (
          currentEmployeeId &&
          !availableEmployees.find((emp) => emp.id === currentEmployeeId)
        ) {
          form.setValue("employeeId", "");
        }
      } catch (error) {
        console.error("Error loading service employees:", error);
        setFilteredEmployees([]);
      }
    };

    getServiceEmployees();
  }, [watchedServiceId]);

  // Check availability when date or employee changes
  useEffect(() => {
    if (watchedDate && watchedEmployeeId && watchedServiceId) {
      checkAvailability(watchedDate, watchedEmployeeId, watchedServiceId);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [watchedDate, watchedEmployeeId, watchedServiceId]);

  const checkAvailability = async (
    selectedDate: string,
    employeeId: string,
    serviceId: string
  ) => {
    setIsLoadingAvailability(true);
    try {
      // Get service duration
      const service = services.find((s) => s.id === serviceId);
      if (!service) return;

      // Get employee schedule for the selected date
      const { data: schedules, error: scheduleError } = await supabase
        .from("schedules")
        .select("start_time, end_time")
        .eq("employee_id", employeeId)
        .lte("start_date", selectedDate)
        .gte("end_date", selectedDate);

      const schedule = schedules && schedules.length > 0 ? schedules[0] : null;

      if (scheduleError || !schedule) {
        setAvailableTimeSlots([]);
        return;
      }

      // Get existing appointments for the selected date and employee (excluding current appointment)
      const { data: appointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select("start_time, end_time")
        .eq("employee_id", employeeId)
        .eq("date", selectedDate)
        .neq("status", "cancelled")
        .neq("id", appointment.id); // Exclude current appointment

      if (appointmentsError) throw appointmentsError;

      // Calculate available time slots
      const available: string[] = [];
      const workStart = new Date(`${selectedDate}T${schedule.start_time}`);
      const workEnd = new Date(`${selectedDate}T${schedule.end_time}`);

      for (const slot of timeSlots) {
        const slotStart = new Date(`${selectedDate}T${slot}:00`);
        const slotEnd = new Date(
          slotStart.getTime() + service.duration_minutes * 60000
        );

        // Check if slot fits within working hours
        if (slotStart < workStart || slotEnd > workEnd) continue;

        // Check if there are no conflicting appointments
        const hasConflict = appointments?.some((apt) => {
          const aptStart = new Date(`${selectedDate}T${apt.start_time}`);
          const aptEnd = new Date(`${selectedDate}T${apt.end_time}`);

          // Check for overlap
          return slotStart < aptEnd && slotEnd > aptStart;
        });

        if (!hasConflict) {
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

  const onSubmit = async (data: AppointmentEditFormData) => {
    setIsSubmitting(true);

    try {
      // Get service to calculate end time
      const service = services.find((s) => s.id === data.serviceId);
      if (!service) throw new Error("Service not found");

      const startTime = data.time;
      const startDate = new Date(`${data.date}T${startTime}:00`);
      const endDate = new Date(
        startDate.getTime() + service.duration_minutes * 60000
      );
      const endTime = endDate.toTimeString().substring(0, 5);

      // Update appointment
      const { error: appointmentError } = await supabase
        .from("appointments")
        .update({
          service_id: data.serviceId,
          employee_id: data.employeeId || null,
          customer_name: data.customerName,
          customer_email: data.customerEmail,
          customer_phone: data.customerPhone || null,
          date: data.date,
          start_time: startTime,
          end_time: endTime,
          status: data.status,
        })
        .eq("id", appointment.id);

      if (appointmentError) throw appointmentError;

      showToast.success("Wizyta została pomyślnie zaktualizowana");
      onClose();
      onAppointmentUpdated();
    } catch (error) {
      console.error("Error updating appointment:", error);
      showToast.error("Błąd podczas aktualizacji wizyty");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edytuj wizytę</DialogTitle>
          <DialogDescription>
            Zmodyfikuj szczegóły wizyty w systemie
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Service and Employee Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usługa *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("employeeId", "");
                        form.setValue("time", "");
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Wybierz usługę" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pracownik *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("time", "");
                      }}
                      defaultValue={field.value}
                      disabled={!watchedServiceId}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              !watchedServiceId
                                ? "Najpierw wybierz usługę"
                                : "Wybierz pracownika"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredEmployees.map((employee) => (
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

            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Dane klienta
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                <CalendarIcon className="h-5 w-5" />
                Termin wizyty
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data *</FormLabel>
                        <Popover
                          open={calendarOpen}
                          onOpenChange={setCalendarOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP", {
                                    locale: pl,
                                  })
                                ) : (
                                  <span>Wybierz datę</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) => {
                                field.onChange(
                                  date ? format(date, "yyyy-MM-dd") : ""
                                );
                                setCalendarOpen(false);
                              }}
                              disabled={(date) => {
                                const today = new Date();
                                const maxDate = new Date();
                                maxDate.setDate(maxDate.getDate() + 90);
                                return date < today || date > maxDate;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                        <div className="min-h-[1.5rem]">
                          {field.value && isLoadingAvailability && (
                            <p className="text-sm text-blue-600 mt-1">
                              Sprawdzam dostępność...
                            </p>
                          )}
                          {field.value &&
                            !isLoadingAvailability &&
                            availableTimeSlots.length === 0 &&
                            watchedEmployeeId && (
                              <p className="text-sm text-red-600 mt-1">
                                Brak dostępnych terminów w tym dniu
                              </p>
                            )}
                        </div>
                      </FormItem>
                    );
                  }}
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
                          !watchedDate ||
                          !watchedEmployeeId ||
                          isLoadingAvailability
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                !watchedDate
                                  ? "Najpierw wybierz datę"
                                  : !watchedEmployeeId
                                    ? "Najpierw wybierz pracownika"
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
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      <div className="min-h-[1.5rem]">
                        {/* Reserved space for consistent alignment with date field */}
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Status Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Status wizyty
              </h3>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Wybierz status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="booked">Zarezerwowana</SelectItem>
                        <SelectItem value="completed">Zakończona</SelectItem>
                        <SelectItem value="cancelled">Anulowana</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Aktualizuję wizytę..." : "Aktualizuj wizytę"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
