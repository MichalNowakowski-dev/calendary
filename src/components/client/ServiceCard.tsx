import { Clock, Euro, Users, ArrowRight } from "lucide-react";
import { Service, Employee } from "@/lib/types/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDuration } from "@/lib/utils";

interface ServiceCardProps {
  service: Service & { employees: Employee[] };
  onBookService: (service: Service & { employees: Employee[] }) => void;
}

export default function ServiceCard({ service, onBookService }: ServiceCardProps) {
  return (
    <Card
      className="group hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer"
      onClick={() => onBookService(service)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-gray-900 dark:text-white">
              {service.name}
            </CardTitle>
            {service.description && (
              <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
                {service.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-1 font-bold text-2xl text-blue-600 dark:text-blue-400">
            <Euro className="h-5 w-5" />
            <span>{formatPrice(service.price)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(service.duration_minutes)}</span>
            </div>

            {service.employees && service.employees.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{service.employees.length} specjalistów</span>
              </div>
            )}
          </div>

          {service.employees && service.employees.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
                Dostępni specjaliści:
              </p>
              <div className="flex flex-wrap gap-1">
                {service.employees
                  .slice(0, 3)
                  .map((employee: Employee) => (
                    <Badge
                      key={employee.id}
                      variant="outline"
                      className="text-xs bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                    >
                      {employee.name}
                    </Badge>
                  ))}
                {service.employees.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                  >
                    +{service.employees.length - 3} więcej
                  </Badge>
                )}
              </div>
            </div>
          )}

          <Button
            className="w-full group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors"
            size="lg"
          >
            <span>Zarezerwuj wizytę</span>
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}