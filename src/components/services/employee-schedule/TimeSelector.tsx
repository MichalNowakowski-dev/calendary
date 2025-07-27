"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TimeSelectorProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

export const TimeSelector = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}: TimeSelectorProps) => {
  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">
        Godziny pracy
      </Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label
            htmlFor="start_time"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Godzina rozpoczęcia
          </Label>
          <Input
            id="start_time"
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className="h-12 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-700"
            required
          />
        </div>

        <div className="space-y-3">
          <Label
            htmlFor="end_time"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Godzina zakończenia
          </Label>
          <Input
            id="end_time"
            type="time"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            className="h-12 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-700"
            required
          />
        </div>
      </div>
    </div>
  );
};
