import { Company, Employee, Service } from "@/lib/types/database";
import { UseFormReturn } from "react-hook-form";
import { BookingFormData } from "@/lib/validations/booking";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { CheckCircle, FileText, CreditCard } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface BookingSuccessModalProps {
  company: Company;
  service: Service;
  form: UseFormReturn<BookingFormData>;
  assignedEmployee: Employee | null;
  onClose: () => void;
}

export default function BookingSuccessModal({
  company,
  service,
  form,
  assignedEmployee,
  onClose,
}: BookingSuccessModalProps) {
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
              <span className="text-gray-500 dark:text-gray-400">Godzina</span>
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
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Płatność
              </span>
              <Badge
                variant="outline"
                className="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
              >
                Na miejscu
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
          onClick={onClose}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
        >
          Świetnie, dziękuję!
        </Button>
      </div>
    </div>
  );
}
