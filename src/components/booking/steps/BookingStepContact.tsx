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
import { Textarea } from "@/components/ui/textarea";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import BookingStepCreateAccount from "./BookingStepCreateAccount";

interface BookingStepContactProps {
  form: UseFormReturn<BookingFormData>;
}

export default function BookingStepContact({ form }: BookingStepContactProps) {
  return (
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

      <BookingStepCreateAccount form={form} />
    </div>
  );
}
