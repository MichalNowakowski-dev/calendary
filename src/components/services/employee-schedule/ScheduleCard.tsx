"use client";

import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import type { Schedule } from "@/lib/types/database";
import { formatTime, getWorkingDaysForSchedule } from "./utils";

interface ScheduleCardProps {
  schedule: Schedule;
  onDelete: (schedule: Schedule) => void;
}

export const ScheduleCard = ({ schedule, onDelete }: ScheduleCardProps) => {
  const handleDelete = () => {
    onDelete(schedule);
  };

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-lg font-semibold text-gray-900">
                {formatTime(schedule.start_time)} -{" "}
                {formatTime(schedule.end_time)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              <Badge
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-700"
              >
                {format(parseISO(schedule.start_date), "dd.MM.yyyy")} -{" "}
                {format(parseISO(schedule.end_date), "dd.MM.yyyy")}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500 font-medium">
              {getWorkingDaysForSchedule(schedule)} dni roboczych
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
