"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign } from "lucide-react";
import type { Service } from "@/lib/types/database";

interface ServiceStats {
  service: Service;
  revenue: number;
  appointments: number;
}

interface TopServicesTableProps {
  services: ServiceStats[];
}

export default function TopServicesTable({ services }: TopServicesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Performing Services
        </CardTitle>
      </CardHeader>
      <CardContent>
        {services.length > 0 ? (
          <div className="space-y-4">
            {services.map((serviceStats, index) => (
              <div
                key={serviceStats.service.id || `service-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {serviceStats.service.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {serviceStats.appointments} appointments
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {serviceStats.revenue.toFixed(2)} zł
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No service data available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
