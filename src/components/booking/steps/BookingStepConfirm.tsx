import { UseFormReturn } from "react-hook-form";
import { BookingFormData } from "@/lib/validations/booking";
import { CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Shield } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Service } from "@/lib/types/database";

interface BookingStepConfirmProps {
  form: UseFormReturn<BookingFormData>;
  service: Service;
}

export default function BookingStepConfirm({
  form,
  service,
}: BookingStepConfirmProps) {
  return (
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
                  <strong>Email:</strong> {form.getValues("customerEmail")}
                </p>
                {form.getValues("customerPhone") && (
                  <p>
                    <strong>Telefon:</strong> {form.getValues("customerPhone")}
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
                  <strong>Cena:</strong> {formatPrice(service.price)}
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
  );
}
