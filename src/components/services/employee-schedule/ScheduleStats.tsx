"use client";

import { format, eachDayOfInterval } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon } from "lucide-react";
import type { Schedule } from "@/lib/types/database";
import { getScheduleStats, getOverallWorkPeriod } from "./utils";

interface ScheduleStatsProps {
  schedules: Schedule[];
}

export const ScheduleStats = ({ schedules }: ScheduleStatsProps) => {
  const scheduleStats = getScheduleStats(schedules);
  console.log("scheduleStats");
  console.log(scheduleStats);
  const overallWorkPeriod = getOverallWorkPeriod(schedules);

  if (schedules.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Aktywne grafiki pracy
        </h3>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            {scheduleStats.totalWorkingDays} dni robocze
          </Badge>
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            {scheduleStats.totalHours.toFixed(0)}h łącznie
          </Badge>
        </div>
      </div>

      {/* Overall work period */}
      {overallWorkPeriod && (
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Okres pracy:
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Badge
                  variant="outline"
                  className="bg-white text-blue-700 border-blue-300"
                >
                  {format(overallWorkPeriod.earliestStart, "dd.MM.yyyy")} -{" "}
                  {format(overallWorkPeriod.latestEnd, "dd.MM.yyyy")}
                </Badge>
                <span className="text-sm text-blue-700 font-medium">
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
