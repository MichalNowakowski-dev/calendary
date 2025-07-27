"use client";

import { useState } from "react";
import { addDays, format, isSameDay } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/lib/toast";
import type { Employee, Schedule } from "@/lib/types/database";
import type { ScheduleFormData } from "./types";
import {
  validateTimeRange,
  validateDateRange,
  checkDateTimeConflict,
  getSelectedDatesInRange,
} from "./utils";
import { DateRangeSelector } from "./DateRangeSelector";
import { DaySelector } from "./DaySelector";
import { TimeSelector } from "./TimeSelector";

interface ScheduleFormProps {
  employee: Employee;
  currentSchedules: Schedule[];
  onScheduleUpdate: (schedules: Schedule[]) => void;
  hideCurrentSchedule?: boolean;
}

export const ScheduleForm = ({
  employee,
  currentSchedules,
  onScheduleUpdate,
  hideCurrentSchedule = false,
}: ScheduleFormProps) => {
  const [formData, setFormData] = useState<ScheduleFormData>({
    startDate: new Date(),
    endDate: addDays(new Date(), 30), // Default to 30 days
    start_time: "09:00",
    end_time: "17:00",
    selectedDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate inputs
      if (!validateTimeRange(formData.start_time, formData.end_time)) {
        showToast.error(
          "Godzina rozpoczęcia musi być wcześniejsza niż zakończenia"
        );
        return;
      }

      if (!validateDateRange(formData.startDate, formData.endDate)) {
        showToast.error(
          "Data rozpoczęcia musi być wcześniejsza niż zakończenia"
        );
        return;
      }

      // Check if any days are selected
      const hasSelectedDays = Object.values(formData.selectedDays).some(
        Boolean
      );
      if (!hasSelectedDays) {
        showToast.error("Wybierz przynajmniej jeden dzień tygodnia");
        return;
      }

      // Get all selected dates in the range
      const selectedDates = getSelectedDatesInRange(
        formData.startDate,
        formData.endDate,
        formData.selectedDays
      );

      if (selectedDates.length === 0) {
        showToast.error("Brak wybranych dni w podanym zakresie dat");
        return;
      }

      // Group consecutive dates for efficient storage
      const scheduleEntries = [];
      let currentGroup: Date[] = [];

      for (let i = 0; i < selectedDates.length; i++) {
        const currentDate = selectedDates[i];
        const nextDate = selectedDates[i + 1];

        currentGroup.push(currentDate);

        // If next date is not consecutive or is the last date, create a schedule entry
        if (!nextDate || !isSameDay(addDays(currentDate, 1), nextDate)) {
          const startDate = currentGroup[0];
          const endDate = currentGroup[currentGroup.length - 1];

          // Check for conflicts with this date range
          const hasConflict = checkDateTimeConflict(
            format(startDate, "yyyy-MM-dd"),
            format(endDate, "yyyy-MM-dd"),
            formData.start_time,
            formData.end_time,
            currentSchedules
          );

          if (hasConflict) {
            showToast.error(
              `Konflikt z istniejącym grafikiem w okresie ${format(
                startDate,
                "dd.MM.yyyy"
              )} - ${format(endDate, "dd.MM.yyyy")}`
            );
            currentGroup = [];
            continue;
          }

          scheduleEntries.push({
            employee_id: employee.id,
            start_date: format(startDate, "yyyy-MM-dd"),
            end_date: format(endDate, "yyyy-MM-dd"),
            start_time: formData.start_time,
            end_time: formData.end_time,
          });

          currentGroup = [];
        }
      }

      if (scheduleEntries.length === 0) {
        showToast.error(
          "Wszystkie wybrane terminy mają konflikty z istniejącym grafikiem"
        );
        return;
      }

      // Insert schedule entries
      const { data, error } = await supabase
        .from("schedules")
        .insert(scheduleEntries)
        .select();

      if (error) throw error;

      const newSchedules = [...currentSchedules, ...data];
      onScheduleUpdate(newSchedules);

      // Reset form
      setFormData({
        startDate: new Date(),
        endDate: addDays(new Date(), 30),
        start_time: "09:00",
        end_time: "17:00",
        selectedDays: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false,
        },
      });

      showToast.success(
        `Dodano ${scheduleEntries.length} ${
          scheduleEntries.length === 1 ? "grafik" : "grafików"
        } dla ${selectedDates.length} dni`
      );
    } catch (error) {
      console.error("Error adding schedule:", error);
      showToast.error("Błąd podczas dodawania grafiku");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {hideCurrentSchedule ? "Zarządzaj grafikiem" : "Dodaj nowy grafik"}
      </h3>
      <Card className="border border-gray-200 dark:border-gray-700 shadow-sm dark:bg-gray-800">
        <CardContent className="p-6">
          <form onSubmit={handleAddSchedule} className="space-y-6">
            {/* Date Range Selection */}
            <div className="space-y-6">
              <DateRangeSelector
                startDate={formData.startDate}
                endDate={formData.endDate}
                onStartDateChange={(date) =>
                  setFormData((prev) => ({ ...prev, startDate: date }))
                }
                onEndDateChange={(date) =>
                  setFormData((prev) => ({ ...prev, endDate: date }))
                }
              />

              <DaySelector
                selectedDays={formData.selectedDays}
                onDaysChange={(selectedDays) =>
                  setFormData((prev) => ({ ...prev, selectedDays }))
                }
              />
            </div>

            {/* Time Selection */}
            <TimeSelector
              startTime={formData.start_time}
              endTime={formData.end_time}
              onStartTimeChange={(time) =>
                setFormData((prev) => ({ ...prev, start_time: time }))
              }
              onEndTimeChange={(time) =>
                setFormData((prev) => ({ ...prev, end_time: time }))
              }
            />

            <Separator className="my-4" />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium text-base shadow-sm"
            >
              {isLoading ? (
                <>
                  <Clock className="h-5 w-5 mr-2 animate-spin" />
                  Dodawanie grafiku...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Dodaj grafik pracy
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
