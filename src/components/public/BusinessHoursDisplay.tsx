import { Clock } from "lucide-react";
import { DAYS_OF_WEEK } from "@/lib/validations/company";
import type { BusinessHours } from "@/lib/types/database";

interface BusinessHoursDisplayProps {
  businessHours: BusinessHours[];
}

export default function BusinessHoursDisplay({
  businessHours,
}: BusinessHoursDisplayProps) {
  if (!businessHours || businessHours.length === 0) {
    return null;
  }

  const formatTime = (time: string | null) => {
    if (!time) return "";
    return time;
  };

  const getDayLabel = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find((day) => day.value === dayOfWeek)?.label || "";
  };

  const isToday = (dayOfWeek: number) => {
    const today = new Date().getDay();
    return today === dayOfWeek;
  };

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg border border-blue-200 dark:border-blue-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Godziny otwarcia
        </h2>
      </div>

      <div className="space-y-2">
        {businessHours.map((hour) => {
          const isOpen = hour.is_open;
          const openTime = formatTime(hour.open_time);
          const closeTime = formatTime(hour.close_time);
          const dayLabel = getDayLabel(hour.day_of_week);
          const today = isToday(hour.day_of_week);

          return (
            <div
              key={hour.day_of_week}
              className={`flex justify-between items-center py-2 px-3 rounded-lg ${
                today
                  ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                  : "bg-gray-50 dark:bg-gray-800/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`font-medium ${
                    today
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {dayLabel}
                </span>
                {today && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                    Dziś
                  </span>
                )}
              </div>

              <div className="text-right">
                {isOpen ? (
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {openTime} - {closeTime}
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    Zamknięte
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
