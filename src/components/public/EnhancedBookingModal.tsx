"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  User,
  X,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  FileText,
  Shield,
} from "lucide-react";
import { Company, Employee, Service } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";
import { bookingSchema, BookingFormData } from "@/lib/validations/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface EnhancedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  service: Service & { employees: Employee[] };
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

const steps = [
  { id: 1, title: "Dane kontaktowe", description: "Podaj swoje dane" },
  { id: 2, title: "Termin wizyty", description: "Wybierz datę i godzinę" },
  { id: 3, title: "Potwierdzenie", description: "Sprawdź szczegóły" },
];

export default function EnhancedBookingModal({
  isOpen,
  onClose,
  company,
  service,
}: EnhancedBookingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [assignedEmployee, setAssignedEmployee] = useState<Employee | null>(
    null
  );

  const supabase = createClient();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      date: "",
      time: "",
      employeeId: "no-preference",
      notes: "",
      termsAccepted: false,
      privacyAccepted: false,
    },
  });

  const timeSlots = generateTimeSlots();

  // Watch form values to trigger availability checking
  const watchedDate = form.watch("date");
  const watchedEmployeeId = form.watch("employeeId");

  useEffect(() => {
    if (watchedDate) {
      checkAvailability(watchedDate, watchedEmployeeId);
      form.setValue("time", "");
    } else {
      setAvailableTimeSlots([]);
    }
  }, [watchedDate, watchedEmployeeId]);

  const checkAvailability = async (
    selectedDate: string,
    selectedEmployeeId?: string
  ) => {
    if (!selectedDate) return;

    setIsLoadingAvailability(true);
    try {
      const employeeIds =
        selectedEmployeeId && selectedEmployeeId !== "no-preference"
          ? [selectedEmployeeId]
          : service.employees.map((emp) => emp.id);

      if (employeeIds.length === 0) {
        setAvailableTimeSlots([]);
        return;
      }

      const { data: schedules, error: schedulesError } = await supabase
        .from("schedules")
        .select("employee_id, start_time, end_time, start_date, end_date")
        .in("employee_id", employeeIds)
        .lte("start_date", selectedDate)
        .gte("end_date", selectedDate);

      if (schedulesError) throw schedulesError;

      const { data: appointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select("employee_id, start_time, end_time")
        .in("employee_id", employeeIds)
        .eq("date", selectedDate)
        .neq("status", "cancelled");

      if (appointmentsError) throw appointmentsError;

      const available: string[] = [];

      for (const slot of timeSlots) {
        const slotStart = new Date(`${selectedDate}T${slot}:00`);
        const slotEnd = new Date(
          slotStart.getTime() + service.duration_minutes * 60000
        );

        const isSlotAvailable = employeeIds.some((employeeId) => {
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

          if (slotStart < workStart || slotEnd > workEnd) return false;

          const hasConflict = appointments?.some((appointment) => {
            if (appointment.employee_id !== employeeId) return false;

            const appointmentStart = new Date(
              `${selectedDate}T${appointment.start_time}`
            );
            const appointmentEnd = new Date(
              `${selectedDate}T${appointment.end_time}`
            );

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

  const handleCloseSuccessModal = () => {
    onClose();
    form.reset();
    setBookingSuccess(false);
    setCurrentStep(1);
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);

    try {
      const startTime = data.time;
      const startDate = new Date(`${data.date}T${startTime}:00`);
      const endDate = new Date(
        startDate.getTime() + service.duration_minutes * 60000
      );
      const endTime = endDate.toTimeString().substring(0, 5);

      let selectedEmployeeId = data.employeeId;
      if (
        (!selectedEmployeeId || selectedEmployeeId === "no-preference") &&
        service.employees.length > 0
      ) {
        for (const employee of service.employees) {
          const { data: schedules } = await supabase
            .from("schedules")
            .select("*")
            .eq("employee_id", employee.id)
            .lte("start_date", data.date)
            .gte("end_date", data.date);

          const schedule =
            schedules && schedules.length > 0 ? schedules[0] : null;

          if (schedule) {
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

      const assignedEmployee = service.employees.find(
        (emp) => emp.id === selectedEmployeeId
      );
      setAssignedEmployee(assignedEmployee || null);

      // First, find or create customer
      let customerId: string | null = null;

      try {
        // Try to find existing customer by email
        const { data: existingCustomer } = await supabase
          .from("customers")
          .select("id")
          .eq("email", data.customerEmail)
          .eq("company_id", company.id)
          .single();

        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          // Create new customer
          const { data: newCustomer, error: customerError } = await supabase
            .from("customers")
            .insert({
              company_id: company.id,
              name: data.customerName,
              email: data.customerEmail,
              phone: data.customerPhone || null,
            })
            .select("id")
            .single();

          if (customerError) {
            throw customerError;
          }

          customerId = newCustomer.id;
        }
      } catch (error) {
        console.error("Customer creation error:", error);
        customerId = null;
      }

      const { error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          company_id: company.id,
          service_id: service.id,
          employee_id: selectedEmployeeId,
          customer_id: customerId,
          customer_name: data.customerName,
          customer_email: data.customerEmail,
          customer_phone: data.customerPhone || null,
          date: data.date,
          start_time: startTime,
          end_time: endTime,
          status: "booked",
          notes: data.notes || null,
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      setBookingSuccess(true);
    } catch (error) {
      console.error("Booking error:", error);
      alert(
        (error as { message?: string })?.message ||
          "Wystąpił błąd podczas rezerwacji. Spróbuj ponownie."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (bookingSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center border-2 border-green-400 dark:border-green-600 transform transition-all scale-100 opacity-100">
          <div className="relative">
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-green-500 dark:bg-green-600 rounded-full p-4 border-8 border-white dark:border-gray-950">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-12 mb-3">
            Rezerwacja potwierdzona!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-sm mx-auto">
            Twoja wizyta została pomyślnie zarezerwowana. Szczegóły znajdziesz
            poniżej oraz w mailu z potwierdzeniem.
          </p>

          <Card className="text-left bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3 text-gray-900 dark:text-white">
                <FileText className="h-5 w-5 text-blue-500" />
                Szczegóły rezerwacji
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Usługa</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {service.name}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Data</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {form.getValues("date")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">
                  Godzina
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {form.getValues("time")}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">
                  Specjalista
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {assignedEmployee?.name || "Dowolny specjalista"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Cena</span>
                <Badge
                  variant="secondary"
                  className="text-base bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200"
                >
                  {formatPrice(service.price)}
                </Badge>
              </div>
              <Separator />
              <div className="text-center pt-2">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {company.name}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {company.address_street}, {company.address_city}
                </p>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleCloseSuccessModal}
            className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
          >
            Świetnie, dziękuję!
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Rezerwacja wizyty
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Krok {currentStep} z {steps.length}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress
              value={(currentStep / steps.length) * 100}
              className="h-2"
            />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 ${
                    step.id <= currentStep
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      step.id <= currentStep
                        ? "bg-blue-600 dark:bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {step.id < currentStep ? "✓" : step.id}
                  </div>
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Customer Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Dane kontaktowe
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-900 dark:text-white">
                            Imię i nazwisko *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Jan Kowalski"
                              {...field}
                              className="focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
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
                          <FormLabel className="text-gray-900 dark:text-white">
                            Telefon
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+48 123 456 789"
                              {...field}
                              className="focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-600 dark:text-gray-400">
                            Opcjonalne - dla potwierdzenia wizyty
                          </FormDescription>
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
                        <FormLabel className="text-gray-900 dark:text-white">
                          Email *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="jan@example.com"
                            type="email"
                            {...field}
                            className="focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-600 dark:text-gray-400">
                          Na ten adres otrzymasz potwierdzenie rezerwacji
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900 dark:text-white">
                          Dodatkowe informacje
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Specjalne wymagania, uwagi..."
                            className="resize-none focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-600 dark:text-gray-400">
                          Opcjonalne - informacje dla specjalisty
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Date and Time Selection */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Termin wizyty
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-900 dark:text-white">
                            Data *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              min={getMinDate()}
                              max={getMaxDate()}
                              {...field}
                              className="focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-600 dark:text-gray-400">
                            Wybierz datę od jutra do 30 dni w przód
                          </FormDescription>
                          <FormMessage />
                          {field.value && isLoadingAvailability && (
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm mt-1">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
                              Sprawdzam dostępność terminów...
                            </div>
                          )}
                          {field.value &&
                            !isLoadingAvailability &&
                            availableTimeSlots.length === 0 && (
                              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mt-1">
                                <AlertCircle className="h-4 w-4" />
                                Brak dostępnych terminów w tym dniu
                              </div>
                            )}
                          {field.value &&
                            !isLoadingAvailability &&
                            availableTimeSlots.length > 0 && (
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm mt-1">
                                <CheckCircle className="h-4 w-4" />
                                Dostępne {availableTimeSlots.length} terminów
                              </div>
                            )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-900 dark:text-white">
                            Godzina *
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={
                              !form.watch("date") || isLoadingAvailability
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
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
                            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                              {availableTimeSlots.map((time) => (
                                <SelectItem
                                  key={time}
                                  value={time}
                                  className="dark:text-white"
                                >
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Employee Selection */}
                  {service.employees && service.employees.length > 1 && (
                    <div>
                      <FormField
                        control={form.control}
                        name="employeeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-900 dark:text-white">
                              Preferowany specjalista
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                                  <SelectValue placeholder="Wybierz specjalistę lub zostaw puste" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                                <SelectItem
                                  value="no-preference"
                                  className="dark:text-white"
                                >
                                  Bez preferencji
                                </SelectItem>
                                {service.employees.map((employee) => (
                                  <SelectItem
                                    key={employee.id}
                                    value={employee.id}
                                    className="dark:text-white"
                                  >
                                    {employee.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-gray-600 dark:text-gray-400">
                              Opcjonalne - jeśli nie wybierzesz, przypiszemy
                              pierwszego dostępnego
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Potwierdzenie rezerwacji
                    </h3>
                  </div>

                  {/* Booking Summary */}
                  <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        Podsumowanie rezerwacji
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Dane kontaktowe
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            <p>
                              <strong>Imię i nazwisko:</strong>{" "}
                              {form.getValues("customerName")}
                            </p>
                            <p>
                              <strong>Email:</strong>{" "}
                              {form.getValues("customerEmail")}
                            </p>
                            {form.getValues("customerPhone") && (
                              <p>
                                <strong>Telefon:</strong>{" "}
                                {form.getValues("customerPhone")}
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Termin wizyty
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            <p>
                              <strong>Data:</strong> {form.getValues("date")}
                            </p>
                            <p>
                              <strong>Godzina:</strong> {form.getValues("time")}
                            </p>
                            <p>
                              <strong>Usługa:</strong> {service.name}
                            </p>
                            <p>
                              <strong>Cena:</strong>{" "}
                              {formatPrice(service.price)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {form.getValues("notes") && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Dodatkowe informacje
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {form.getValues("notes")}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Terms and Privacy */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-2 text-gray-900 dark:text-white">
                              <FileText className="h-4 w-4" />
                              Akceptuję regulamin *
                            </FormLabel>
                            <FormDescription className="text-gray-600 dark:text-gray-400">
                              Zobowiązuję się do przestrzegania zasad rezerwacji
                            </FormDescription>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="privacyAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-2 text-gray-900 dark:text-white">
                              <Shield className="h-4 w-4" />
                              Akceptuję politykę prywatności *
                            </FormLabel>
                            <FormDescription className="text-gray-600 dark:text-gray-400">
                              Wyrażam zgodę na przetwarzanie danych osobowych
                            </FormDescription>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    className="flex items-center gap-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    disabled={isSubmitting}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Wstecz
                  </Button>
                )}

                <div className="flex-1" />

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    Dalej
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Rezerwuję...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Potwierdź rezerwację
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
