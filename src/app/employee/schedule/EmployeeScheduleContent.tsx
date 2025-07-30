"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import type { Schedule, Company, Appointment } from "@/lib/types/database";
import type { AuthUser } from "@/lib/auth/server";
import CalendarView from "./CalendarView";

interface EmployeeScheduleContentProps {
  schedules: Schedule[];
  appointments: Appointment[];
  company: Company;
  user: AuthUser;
}

export function EmployeeScheduleContent({
  schedules,
  appointments,
}: EmployeeScheduleContentProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const isScheduleActive = (schedule: Schedule) => {
    const today = new Date();
    const startDate = new Date(schedule.start_date);
    const endDate = new Date(schedule.end_date);

    return today >= startDate && today <= endDate;
  };

  const getScheduleStatus = (schedule: Schedule) => {
    if (isScheduleActive(schedule)) {
      return {
        text: "Aktywny",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      };
    } else {
      const today = new Date();
      const startDate = new Date(schedule.start_date);

      if (today < startDate) {
        return {
          text: "Nadchodzący",
          color:
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        };
      } else {
        return {
          text: "Zakończony",
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
        };
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Schedule Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Status harmonogramu
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nie masz ustawionego harmonogramu</p>
              <p className="text-sm">Skontaktuj się z administratorem</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => {
                const status = getScheduleStatus(schedule);
                return (
                  <div
                    key={schedule.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          Harmonogram pracy
                        </h3>
                      </div>
                      <Badge className={status.color}>{status.text}</Badge>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Okres:</span>
                        <span>
                          {formatDate(schedule.start_date)} -{" "}
                          {formatDate(schedule.end_date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatTime(schedule.start_time)} -{" "}
                          {formatTime(schedule.end_time)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Przegląd tygodniowy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarView appointments={appointments} />
        </CardContent>
      </Card>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informacje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>• Twój harmonogram jest ustawiany przez administratora firmy</p>
            <p>• Godziny pracy określają kiedy jesteś dostępny dla klientów</p>
            <p>
              • Jeśli potrzebujesz zmiany harmonogramu, skontaktuj się z
              administratorem
            </p>
            <p>
              • Aktywny harmonogram oznacza, że obecnie pracujesz w tych
              godzinach
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
