"use client";

import { format, eachDayOfInterval } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import type { Schedule } from "@/lib/types/database";
import { getScheduleStats, getOverallWorkPeriod } from "./utils";

interface ScheduleStatsProps {
  schedules: Schedule[];
}

export const ScheduleStats = ({ schedules }: ScheduleStatsProps) => {
  const scheduleStats = getScheduleStats(schedules);

  const overallWorkPeriod = getOverallWorkPeriod(schedules);

  if (schedules.length === 0)
    return (
      <Card className="border-dashed border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800">
        <CardContent className="py-12">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-1">
              Brak aktywnych grafików
            </h4>
            <p className="text-sm dark:text-gray-400">
              Użyj formularza poniżej, aby dodać grafik pracy
            </p>
          </div>
        </CardContent>
      </Card>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Aktywne grafiki pracy
        </h3>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
          >
            {scheduleStats.totalWorkingDays} dni robocze
          </Badge>
          <Badge
            variant="outline"
            className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
          >
            {scheduleStats.totalHours.toFixed(0)}h łącznie
          </Badge>
        </div>
      </div>

      {/* Overall work period */}
      {overallWorkPeriod && (
        <Card className="border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Okres pracy:
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Badge
                  variant="outline"
                  className="bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600"
                >
                  {format(overallWorkPeriod.earliestStart, "dd.MM.yyyy")} -{" "}
                  {format(overallWorkPeriod.latestEnd, "dd.MM.yyyy")}
                </Badge>
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  {
                    eachDayOfInterval({
                      start: overallWorkPeriod.earliestStart,
                      end: overallWorkPeriod.latestEnd,
                    }).length
                  }{" "}
                  dni kalendarzowych
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
