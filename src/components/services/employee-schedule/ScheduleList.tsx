"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { Schedule } from "@/lib/types/database";
import { getActiveSchedules } from "./utils";
import { ScheduleCard } from "./ScheduleCard";

interface ScheduleListProps {
  schedules: Schedule[];
  onDeleteSchedule: (schedule: Schedule) => void;
}

export const ScheduleList = ({
  schedules,
  onDeleteSchedule,
}: ScheduleListProps) => {
  const activeSchedules = getActiveSchedules(schedules);

  if (activeSchedules.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-200">
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <h4 className="text-lg font-medium text-gray-700 mb-1">
              Brak aktywnych grafików
            </h4>
            <p className="text-sm">
              Użyj formularza poniżej, aby dodać grafik pracy
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {activeSchedules.map((schedule) => (
        <ScheduleCard
          key={schedule.id}
          schedule={schedule}
          onDelete={onDeleteSchedule}
        />
      ))}
    </div>
  );
};
