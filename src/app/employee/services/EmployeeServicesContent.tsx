"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  DollarSign,
  FileText,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import type { Service, Company } from "@/lib/types/database";
import type { AuthUser } from "@/lib/auth/server";

interface EmployeeServicesContentProps {
  services: Service[];
  company: Company;
  user: AuthUser;
}

export function EmployeeServicesContent({
  services,
  company,
  user,
}: EmployeeServicesContentProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0 && remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${remainingMinutes}min`;
    }
  };

  const formatPrice = (price: number) => {
    return `${price} zł`;
  };

  return (
    <div className="space-y-6">
      {/* Services Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Twoje usługi ({services.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nie masz przypisanych usług</p>
              <p className="text-sm">Skontaktuj się z administratorem firmy</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                      {service.name}
                    </h3>
                    <Badge
                      className={
                        service.active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                      }
                    >
                      {service.active ? "Aktywna" : "Nieaktywna"}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Czas: {formatDuration(service.duration_minutes)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Cena: {formatPrice(service.price)}</span>
                    </div>

                    {service.description && (
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="text-xs">{service.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Statistics */}
      {services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Statystyki usług</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {services.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Przypisane usługi
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {services.filter((s) => s.active).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Aktywne usługi
                </div>
              </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(
                    (services.reduce((sum, s) => sum + s.duration_minutes, 0) /
                      60) *
                      10
                  ) / 10}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Łączny czas (h)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informacje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>• Usługi są przypisywane przez administratora firmy</p>
            <p>• Możesz świadczyć tylko usługi, które zostały Ci przypisane</p>
            <p>
              • Czas trwania usługi określa ile czasu potrzebujesz na jej
              wykonanie
            </p>
            <p>
              • Jeśli potrzebujesz zmiany przypisanych usług, skontaktuj się z
              administratorem
            </p>
            <p>• Aktywne usługi są dostępne dla klientów do rezerwacji</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
