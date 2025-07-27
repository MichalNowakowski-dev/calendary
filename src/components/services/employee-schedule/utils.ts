import {
  format,
  parseISO,
  isWithinInterval,
  eachDayOfInterval,
} from "date-fns";
import type { Schedule } from "@/lib/types/database";
import type { ScheduleFormData } from "./types";

export const validateTimeRange = (start: string, end: string): boolean => {
  const startTime = new Date(`2000-01-01T${start}:00`);
  const endTime = new Date(`2000-01-01T${end}:00`);
  return startTime < endTime;
};

export const validateDateRange = (start: Date, end: Date): boolean => {
  return start <= end;
};

export const checkDateTimeConflict = (
  checkStartDate: string,
  checkEndDate: string,
  checkStartTime: string,
  checkEndTime: string,
  currentSchedules: Schedule[],
  excludeId?: string
): boolean => {
  return currentSchedules.some((schedule) => {
    if (schedule.id === excludeId) return false;

    // Check if date ranges overlap
    const existingStart = parseISO(schedule.start_date);
    const existingEnd = parseISO(schedule.end_date);
    const newStart = parseISO(checkStartDate);
    const newEnd = parseISO(checkEndDate);

    const datesOverlap =
      isWithinInterval(newStart, {
        start: existingStart,
        end: existingEnd,
      }) ||
      isWithinInterval(newEnd, { start: existingStart, end: existingEnd }) ||
      isWithinInterval(existingStart, { start: newStart, end: newEnd });

    if (!datesOverlap) return false;

    // If dates overlap, check if times overlap
    const existingStartTime = new Date(`2000-01-01T${schedule.start_time}:00`);
    const existingEndTime = new Date(`2000-01-01T${schedule.end_time}:00`);
    const newStartTime = new Date(`2000-01-01T${checkStartTime}:00`);
    const newEndTime = new Date(`2000-01-01T${checkEndTime}:00`);

    return (
      (newStartTime >= existingStartTime && newStartTime < existingEndTime) ||
      (newEndTime > existingStartTime && newEndTime <= existingEndTime) ||
      (newStartTime <= existingStartTime && newEndTime >= existingEndTime)
    );
  });
};

export const getSelectedDatesInRange = (
  start: Date,
  end: Date,
  selectedDays: ScheduleFormData["selectedDays"]
): Date[] => {
  const allDates = eachDayOfInterval({ start, end });

  return allDates.filter((date) => {
    const dayOfWeek = date.getDay();
    switch (dayOfWeek) {
      case 0:
        return selectedDays.sunday;
      case 1:
        return selectedDays.monday;
      case 2:
        return selectedDays.tuesday;
      case 3:
        return selectedDays.wednesday;
      case 4:
        return selectedDays.thursday;
      case 5:
        return selectedDays.friday;
      case 6:
        return selectedDays.saturday;
      default:
        return false;
    }
  });
};

export const formatTime = (time: string) => {
  return time.substring(0, 5); // Remove seconds if present
};

export const getActiveSchedules = (schedules: Schedule[]) => {
  const today = format(new Date(), "yyyy-MM-dd");
  return schedules.filter((schedule) => schedule.end_date >= today);
};

export const getScheduleStats = (schedules: Schedule[]) => {
  const activeSchedules = getActiveSchedules(schedules);

  let totalWorkingDays = 0;
  let totalHours = 0;

  activeSchedules.forEach((schedule) => {
    const startDate = parseISO(schedule.start_date);
    const endDate = parseISO(schedule.end_date);

    // Get all dates in the schedule period
    const allDates = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    // Count working days (Monday to Friday)
    const workingDays = allDates.filter((date) => {
      const dayOfWeek = date.getDay();
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday = 1, Friday = 5
    }).length;

    const startTime = new Date(`2000-01-01T${schedule.start_time}`);
    const endTime = new Date(`2000-01-01T${schedule.end_time}`);
    const hoursPerDay =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    totalWorkingDays += workingDays;
    totalHours += workingDays * hoursPerDay;
  });

  return { totalWorkingDays, totalHours };
};

export const getOverallWorkPeriod = (schedules: Schedule[]) => {
  const activeSchedules = getActiveSchedules(schedules);

  if (activeSchedules.length === 0) return null;

  const startDates = activeSchedules.map((s) => parseISO(s.start_date));
  const endDates = activeSchedules.map((s) => parseISO(s.end_date));

  const earliestStart = new Date(
    Math.min(...startDates.map((d) => d.getTime()))
  );
  const latestEnd = new Date(Math.max(...endDates.map((d) => d.getTime())));

  return { earliestStart, latestEnd };
};

export const getWorkingDaysForSchedule = (schedule: Schedule) => {
  const startDate = parseISO(schedule.start_date);
  const endDate = parseISO(schedule.end_date);

  return eachDayOfInterval({
    start: startDate,
    end: endDate,
  }).filter((date) => {
    const dayOfWeek = date.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
  }).length;
};
