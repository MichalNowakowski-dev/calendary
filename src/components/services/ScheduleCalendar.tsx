"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { pl } from "date-fns/locale";
import type { Schedule } from "@/lib/types/database";

interface ScheduleCalendarProps {
  schedules: Schedule[];
  employeeName: string;
}

const weekDays = ["Ndz", "Pon", "Wt", "Śr", "Czw", "Pt", "Sob"];

const months = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
];

export default function ScheduleCalendar({
  schedules,
  employeeName,
}: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getScheduleForDay = (date: Date) => {
    const jsWeekday = getDay(date); // JavaScript: 0=Sunday, 1=Monday, etc.
    // Convert to database format: 0=Monday, 1=Tuesday, etc.
    const dbWeekday = jsWeekday === 0 ? 6 : jsWeekday - 1;
    return schedules.find((schedule) => schedule.weekday === dbWeekday);
  };

  const isWorkingDay = (date: Date) => {
    return getScheduleForDay(date) !== undefined;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate working days in current month
  const getWorkingDaysInMonth = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const workingDays = daysInMonth.filter((day) => {
      const jsWeekday = getDay(day);
      // Convert to database format: 0=Monday, 1=Tuesday, etc.
      const dbWeekday = jsWeekday === 0 ? 6 : jsWeekday - 1;
      return schedules.some((schedule) => schedule.weekday === dbWeekday);
    });

    return workingDays.length;
  };

  // Calculate total weekly hours
  const getWeeklyHours = () => {
    // Create a map to ensure we only count each weekday once
    const weeklyScheduleMap = new Map();

    schedules.forEach((schedule) => {
      if (!weeklyScheduleMap.has(schedule.weekday)) {
        const dailyHours = calculateDuration(
          schedule.start_time,
          schedule.end_time
        );
        weeklyScheduleMap.set(schedule.weekday, dailyHours);
      }
    });

    // Sum up all daily hours to get weekly total
    return Array.from(weeklyScheduleMap.values()).reduce(
      (total, hours) => total + hours,
      0
    );
  };

  // Calculate total monthly hours based on actual working days
  const getMonthlyHours = () => {
    const workingDaysInMonth = getWorkingDaysInMonth();
    if (schedules.length === 0 || workingDaysInMonth === 0) return 0;

    // Calculate average daily hours from actual schedule
    const totalWeeklyHours = getWeeklyHours();

    // Get unique weekdays to calculate actual working days per week
    const uniqueWeekdays = new Set(
      schedules.map((schedule) => schedule.weekday)
    );
    const workingDaysPerWeek = uniqueWeekdays.size;
    const avgDailyHours = totalWeeklyHours / workingDaysPerWeek;

    return workingDaysInMonth * avgDailyHours;
  };

  return (
    <div className="w-full space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Dziś
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            className="p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            className="p-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Calendar Header - Days of Week */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="h-12 flex items-center justify-center text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, dayIdx) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              const isWorking = isWorkingDay(day);
              const schedule = getScheduleForDay(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`
                    min-h-[120px] p-2 border border-gray-100 rounded-lg transition-all duration-200
                    ${isCurrentMonth ? "bg-white" : "bg-gray-50"}
                    ${isToday ? "ring-2 ring-blue-500" : ""}
                    ${
                      isWorking && isCurrentMonth
                        ? "bg-blue-50 border-blue-200"
                        : ""
                    }
                    hover:shadow-sm
                  `}
                >
                  <div className="space-y-2">
                    {/* Day Number */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`
                          text-sm font-medium
                          ${!isCurrentMonth ? "text-gray-400" : "text-gray-900"}
                          ${
                            isToday
                              ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                              : ""
                          }
                        `}
                      >
                        {format(day, "d")}
                      </span>
                      {isWorking && isCurrentMonth && (
                        <Clock className="h-3 w-3 text-blue-600" />
                      )}
                    </div>

                    {/* Schedule Info */}
                    {isWorking && isCurrentMonth && schedule && (
                      <div className="space-y-1">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 w-full justify-center"
                        >
                          Praca
                        </Badge>
                        <div className="text-xs text-blue-700 font-medium text-center bg-blue-50 rounded px-1 py-0.5">
                          {schedule.start_time.substring(0, 5)} -{" "}
                          {schedule.end_time.substring(0, 5)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Schedule Summary */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Podsumowanie grafiku - {employeeName}
          </h3>

          {schedules.length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Brak ustalonego grafiku pracy</p>
            </div>
          )}

          {schedules.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-gray-600">Dni robocze w miesiącu</div>
                  <div className="font-semibold text-gray-900">
                    {getWorkingDaysInMonth()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">Godzin tygodniowo</div>
                  <div className="font-semibold text-gray-900">
                    {getWeeklyHours().toFixed(1)}h
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">Godzin w miesiącu</div>
                  <div className="font-semibold text-gray-900">
                    {getMonthlyHours().toFixed(1)}h
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">Status</div>
                  <div className="font-semibold text-gray-900">
                    {schedules.length === 7 ? "Pełny etat" : "Część etatu"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function calculateDuration(startTime: string, endTime: string): number {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}
