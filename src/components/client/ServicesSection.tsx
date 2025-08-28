import { Clock } from "lucide-react";
import { Service, Employee } from "@/lib/types/database";
import { Card, CardContent } from "@/components/ui/card";
import ServiceCard from "./ServiceCard";

interface ServicesSectionProps {
  services: (Service & { employees: Employee[] })[];
  onBookService: (service: Service & { employees: Employee[] }) => void;
}

export default function ServicesSection({ services, onBookService }: ServicesSectionProps) {
  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Wybierz usługę
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Dostępne {services.length}{" "}
          {services.length === 1
            ? "usługa"
            : services.length < 5
              ? "usługi"
              : "usług"}
        </p>
      </div>

      {services.length === 0 ? (
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Brak dostępnych usług
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  W tej chwili nie ma dostępnych usług. Sprawdź ponownie
                  później.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onBookService={onBookService}
            />
          ))}
        </div>
      )}
    </div>
  );
}