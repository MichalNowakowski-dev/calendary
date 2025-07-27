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
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
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

  // Find schedules that include the given date
  const getSchedulesForDay = (date: Date) => {
    return schedules.filter((schedule) => {
      const scheduleStart = parseISO(schedule.start_date);
      const scheduleEnd = parseISO(schedule.end_date);
      return isWithinInterval(date, {
        start: startOfDay(scheduleStart),
        end: endOfDay(scheduleEnd),
      });
    });
  };

  const isWorkingDay = (date: Date) => {
    return getSchedulesForDay(date).length > 0;
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

    return daysInMonth.filter((day) => isWorkingDay(day)).length;
  };

  // Calculate total hours in current month
  const getMonthlyHours = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    let totalHours = 0;

    daysInMonth.forEach((day) => {
      const daySchedules = getSchedulesForDay(day);
      daySchedules.forEach((schedule) => {
        const dailyHours = calculateDuration(
          schedule.start_time,
          schedule.end_time
        );
        totalHours += dailyHours;
      });
    });

    return totalHours;
  };

  // Get all unique time ranges for summary
  const getUniqueTimeRanges = () => {
    const timeRanges = new Map();

    schedules.forEach((schedule) => {
      const timeKey = `${schedule.start_time.substring(
        0,
        5
      )}-${schedule.end_time.substring(0, 5)}`;
      if (!timeRanges.has(timeKey)) {
        timeRanges.set(timeKey, {
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          schedules: [],
        });
      }
      timeRanges.get(timeKey).schedules.push(schedule);
    });

    return Array.from(timeRanges.values());
  };

  // Calculate total scheduled days across all schedules
  const getTotalScheduledDays = () => {
    let totalDays = 0;
    schedules.forEach((schedule) => {
      const startDate = parseISO(schedule.start_date);
      const endDate = parseISO(schedule.end_date);
      const daysInPeriod = eachDayOfInterval({
        start: startDate,
        end: endDate,
      }).length;
      totalDays += daysInPeriod;
    });
    return totalDays;
  };

  return (
    <div className="w-full space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
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
      <Card className="p-6 dark:bg-gray-800">
        <div className="space-y-4">
          {/* Calendar Header - Days of Week */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="h-12 flex items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg"
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
              const daySchedules = getSchedulesForDay(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`
                    min-h-[120px] p-2 border border-gray-100 dark:border-gray-600 rounded-lg transition-all duration-200
                    ${
                      isCurrentMonth
                        ? "bg-white dark:bg-gray-800"
                        : "bg-gray-50 dark:bg-gray-900"
                    }
                    ${isToday ? "ring-2 ring-blue-500" : ""}
                    ${
                      isWorking && isCurrentMonth
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
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
                          ${
                            !isCurrentMonth
                              ? "text-gray-400 dark:text-gray-500"
                              : "text-gray-900 dark:text-gray-100"
                          }
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
                        <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>

                    {/* Schedule Info */}
                    {isWorking && isCurrentMonth && daySchedules.length > 0 && (
                      <div className="space-y-1">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/50 w-full justify-center"
                        >
                          Praca
                        </Badge>
                        {daySchedules.slice(0, 2).map((schedule, index) => (
                          <div
                            key={`${schedule.id}-${index}`}
                            className="text-xs text-blue-700 dark:text-blue-300 font-medium text-center bg-blue-50 dark:bg-blue-900/20 rounded px-1 py-0.5"
                          >
                            {schedule.start_time.substring(0, 5)} -{" "}
                            {schedule.end_time.substring(0, 5)}
                          </div>
                        ))}
                        {daySchedules.length > 2 && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 text-center">
                            +{daySchedules.length - 2} więcej
                          </div>
                        )}
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
      <Card className="p-6 dark:bg-gray-800">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Podsumowanie grafiku - {employeeName}
          </h3>

          {schedules.length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Brak ustalonego grafiku pracy
              </p>
            </div>
          )}

          {schedules.length > 0 && (
            <div className="space-y-6">
              {/* Time Ranges Summary */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Godziny pracy:
                </h4>
                <div className="space-y-2">
                  {getUniqueTimeRanges().map((range, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium dark:text-gray-100">
                          {range.start_time.substring(0, 5)} -{" "}
                          {range.end_time.substring(0, 5)}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {range.schedules.length}{" "}
                        {range.schedules.length === 1 ? "okres" : "okresów"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                <div className="text-center">
                  <div className="text-gray-600 dark:text-gray-400">
                    Dni robocze w miesiącu
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {getWorkingDaysInMonth()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600 dark:text-gray-400">
                    Godzin w miesiącu
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {getMonthlyHours().toFixed(1)}h
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600 dark:text-gray-400">
                    Łącznie okresów
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {schedules.length}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600 dark:text-gray-400">
                    Łącznie zaplanowane dni
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {getTotalScheduledDays()}
                  </div>
                </div>
              </div>

              {/* Active Schedules List */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Aktywne okresy pracy:
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {schedules
                    .filter(
                      (schedule) => parseISO(schedule.end_date) >= new Date()
                    )
                    .map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded-md"
                      >
                        <div className="text-sm">
                          <span className="font-medium dark:text-gray-100">
                            {format(
                              parseISO(schedule.start_date),
                              "dd.MM.yyyy"
                            )}{" "}
                            -{" "}
                            {format(parseISO(schedule.end_date), "dd.MM.yyyy")}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {schedule.start_time.substring(0, 5)} -{" "}
                          {schedule.end_time.substring(0, 5)}
                        </div>
                      </div>
                    ))}
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
