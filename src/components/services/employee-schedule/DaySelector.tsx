"use client";

import { Label } from "@/components/ui/label";
import { dayLabels } from "./types";

interface DaySelectorProps {
  selectedDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  onDaysChange: (selectedDays: DaySelectorProps["selectedDays"]) => void;
}

export const DaySelector = ({
  selectedDays,
  onDaysChange,
}: DaySelectorProps) => {
  const handleDayChange = (
    day: keyof typeof selectedDays,
    checked: boolean
  ) => {
    onDaysChange({
      ...selectedDays,
      [day]: checked,
    });
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-700">
        Dni tygodnia do uwzględnienia
      </Label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        {Object.entries(dayLabels).map(([key, label]) => (
          <label
            key={key}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedDays[key as keyof typeof selectedDays]}
              onChange={(e) =>
                handleDayChange(
                  key as keyof typeof selectedDays,
                  e.target.checked
                )
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
