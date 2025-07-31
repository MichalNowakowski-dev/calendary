import { UseFormReturn } from "react-hook-form";
import { BookingFormData } from "@/lib/validations/booking";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Employee, Service } from "@/lib/types/database";
import { getMinDate, getMaxDate } from "@/lib/utils";
import { Calendar, AlertCircle, CheckCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookingStepDateProps {
  form: UseFormReturn<BookingFormData>;
  availableTimeSlots: string[];
  isLoadingAvailability: boolean;
  service: Service & { employees: Employee[] };
}

export default function BookingStepDate({
  form,
  availableTimeSlots,
  isLoadingAvailability,
  service,
}: BookingStepDateProps) {
  return (
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
                Data *{" "}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  - max 30 dni w przód
                </span>
              </FormLabel>
              <FormControl>
                <DatePicker
                  date={
                    field.value
                      ? new Date(field.value + "T12:00:00")
                      : undefined
                  }
                  onDateChange={(date) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0"
                      );
                      const day = String(date.getDate()).padStart(2, "0");
                      field.onChange(`${year}-${month}-${day}`);
                    } else {
                      field.onChange("");
                    }
                  }}
                  minDate={new Date(getMinDate() + "T12:00:00")}
                  maxDate={new Date(getMaxDate() + "T12:00:00")}
                  placeholder="Wybierz datę"
                />
              </FormControl>
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
                disabled={!form.watch("date") || isLoadingAvailability}
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
                <Select onValueChange={field.onChange} value={field.value}>
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
                  Opcjonalne - jeśli nie wybierzesz, przypiszemy pierwszego
                  dostępnego
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
