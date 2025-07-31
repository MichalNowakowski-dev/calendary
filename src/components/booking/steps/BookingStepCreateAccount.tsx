import { UseFormReturn } from "react-hook-form";
import { BookingFormData } from "@/lib/validations/booking";
import { User } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface BookingStepCreateAccountProps {
  form: UseFormReturn<BookingFormData>;
}

export default function BookingStepCreateAccount({
  form,
}: BookingStepCreateAccountProps) {
  return (
    <div className="space-y-6">
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Utwórz konto klienta
          </h4>
        </div>

        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <FormField
              control={form.control}
              name="createAccount"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-gray-900 dark:text-white font-medium">
                      Chcę utworzyć konto klienta
                    </FormLabel>
                    <FormDescription className="text-gray-600 dark:text-gray-400">
                      Zyskaj dostęp do historii wizyt, szybszych rezerwacji i
                      przypomnień
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {form.watch("createAccount") && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 dark:text-white">
                      Hasło *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Minimum 6 znaków"
                        {...field}
                        className="focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </FormControl>
                    <FormDescription className="text-gray-600 dark:text-gray-400">
                      Hasło do Twojego konta klienta
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 dark:text-white">
                      Potwierdź hasło *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Powtórz hasło"
                        {...field}
                        className="focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </FormControl>
                    <FormDescription className="text-gray-600 dark:text-gray-400">
                      Powtórz hasło dla weryfikacji
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Co zyskujesz z kontem klienta?
              </h5>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Szybsze rezerwacje - zapisane dane kontaktowe</li>
                <li>• Historia wszystkich wizyt w jednym miejscu</li>
                <li>• Automatyczne przypomnienia o nadchodzących wizytach</li>
                <li>• Możliwość dodawania ulubionych firm</li>
                <li>• Łatwe zarządzanie rezerwacjami</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
