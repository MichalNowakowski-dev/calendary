"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { bookingSchema, BookingFormData } from "@/lib/validations/booking";
import { Company, Employee, Service } from "@/lib/types/database";
import BookingProgress from "./BookingProgress";
import BookingNavigation from "./BookingNavigation";
import BookingSuccessModal from "./BookingSuccessModal";
import BookingStepContact from "./steps/BookingStepContact";
import BookingStepDate from "./steps/BookingStepDate";
import BookingStepConfirm from "./steps/BookingStepConfirm";

import { Form } from "../ui/form";
import {
  fetchAvailableTimeSlots,
  submitBooking,
} from "@/lib/services/bookings";

interface EnhancedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  service: Service & { employees: Employee[] };
}

export default function EnhancedBookingModal({
  isOpen,
  onClose,
  company,
  service,
}: EnhancedBookingModalProps) {
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
      createAccount: false,
      password: "",
      confirmPassword: "",
      termsAccepted: false,
      privacyAccepted: false,
    },
  });

  // --- Stan ---
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [assignedEmployee, setAssignedEmployee] = useState<Employee | null>(
    null
  );

  // --- Efekty ---
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

      const available = await fetchAvailableTimeSlots(
        selectedDate,
        employeeIds,
        service.duration_minutes
      );

      setAvailableTimeSlots(available);
    } catch (err) {
      console.error("Error checking availability:", err);
      setAvailableTimeSlots([]);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      const assignedId = await submitBooking(
        data,
        company.id,
        service.id,
        service.employees,
        service.duration_minutes
      );

      const assigned =
        service.employees.find((e) => e.id === assignedId) || null;
      setAssignedEmployee(assigned);
      setBookingSuccess(true);
    } catch (err) {
      console.error("Booking error:", err);
      alert(
        (err as { message?: string })?.message || "Błąd podczas rezerwacji."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => setCurrentStep((s) => Math.min(s + 1, 3));
  const handlePrevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));
  const handleCloseSuccessModal = () => {
    onClose();
    form.reset();
    setBookingSuccess(false);
    setCurrentStep(1);
  };

  if (!isOpen) return null;
  if (bookingSuccess) {
    return (
      <BookingSuccessModal
        company={company}
        service={service}
        form={form}
        assignedEmployee={assignedEmployee}
        onClose={handleCloseSuccessModal}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <BookingProgress currentStep={currentStep} />

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 1 && <BookingStepContact form={form} />}
              {currentStep === 2 && (
                <BookingStepDate
                  form={form}
                  availableTimeSlots={availableTimeSlots}
                  isLoadingAvailability={isLoadingAvailability}
                  service={service}
                />
              )}
              {currentStep === 3 && (
                <BookingStepConfirm form={form} service={service} />
              )}

              <BookingNavigation
                onClose={onClose}
                currentStep={currentStep}
                isSubmitting={isSubmitting}
                handlePrevStep={handlePrevStep}
                handleNextStep={handleNextStep}
              />
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
