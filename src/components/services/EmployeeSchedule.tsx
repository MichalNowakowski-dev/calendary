"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Employee, Schedule } from "@/lib/types/database";
import { showToast, showConfirmToast } from "@/lib/toast";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getMonth,
  getYear,
} from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmployeeScheduleProps {
  employee: Employee;
  schedules: Schedule[];
  onScheduleUpdate: (schedules: Schedule[]) => void;
  hideCurrentSchedule?: boolean;
  buttonText?: string;
}

interface ScheduleFormData {
  mode: "dateRange" | "month";
  dateRange: DateRange | undefined;
  selectedPeriod: "1month" | "3months" | "6months" | "1year" | "2years";
  start_time: string;
  end_time: string;
  includeSaturday: boolean;
  includeSunday: boolean;
}

const weekdays = [
  { value: 0, label: "Niedziela" },
  { value: 1, label: "Poniedziałek" },
  { value: 2, label: "Wtorek" },
  { value: 3, label: "Środa" },
  { value: 4, label: "Czwartek" },
  { value: 5, label: "Piątek" },
  { value: 6, label: "Sobota" },
];

const periodOptions = [
  { value: "1month", label: "1 miesiąc" },
  { value: "3months", label: "3 miesiące" },
  { value: "6months", label: "6 miesięcy" },
  { value: "1year", label: "1 rok" },
  { value: "2years", label: "2 lata" },
];

export default function EmployeeSchedule({
  employee,
  schedules,
  onScheduleUpdate,
  hideCurrentSchedule = false,
  buttonText = "Grafik",
}: EmployeeScheduleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSchedules, setCurrentSchedules] =
    useState<Schedule[]>(schedules);
  const [formData, setFormData] = useState<ScheduleFormData>({
    mode: "dateRange",
    dateRange: undefined,
    selectedPeriod: "1month",
    start_time: "09:00",
    end_time: "17:00",
    includeSaturday: false,
    includeSunday: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    setCurrentSchedules(schedules);
  }, [schedules]);

  const validateTimeRange = (start: string, end: string): boolean => {
    const startTime = new Date(`2000-01-01T${start}:00`);
    const endTime = new Date(`2000-01-01T${end}:00`);
    return startTime < endTime;
  };

  const checkTimeConflict = (
    weekday: number,
    start: string,
    end: string,
    excludeId?: string
  ): boolean => {
    const newStart = new Date(`2000-01-01T${start}:00`);
    const newEnd = new Date(`2000-01-01T${end}:00`);

    return currentSchedules.some((schedule) => {
      if (schedule.weekday !== weekday || schedule.id === excludeId) {
        return false;
      }

      const existingStart = new Date(`2000-01-01T${schedule.start_time}:00`);
      const existingEnd = new Date(`2000-01-01T${schedule.end_time}:00`);

      // Check for overlap
      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });
  };

  const getDateRangeArray = (dateRange: DateRange): Date[] => {
    if (!dateRange.from || !dateRange.to) return [];

    const dates: Date[] = [];
    const currentDate = new Date(dateRange.from);
    const endDate = new Date(dateRange.to);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const getPeriodDates = (
    period: "1month" | "3months" | "6months" | "1year" | "2years",
    includeSaturday: boolean,
    includeSunday: boolean
  ): Date[] => {
    const today = new Date();
    const startDate = startOfMonth(today);
    let endDate: Date;

    switch (period) {
      case "1month":
        endDate = endOfMonth(today);
        break;
      case "3months":
        endDate = endOfMonth(
          new Date(today.getFullYear(), today.getMonth() + 2, 1)
        );
        break;
      case "6months":
        endDate = endOfMonth(
          new Date(today.getFullYear(), today.getMonth() + 5, 1)
        );
        break;
      case "1year":
        endDate = endOfMonth(
          new Date(today.getFullYear() + 1, today.getMonth(), 1)
        );
        break;
      case "2years":
        endDate = endOfMonth(
          new Date(today.getFullYear() + 2, today.getMonth(), 1)
        );
        break;
      default:
        endDate = endOfMonth(today);
    }

    const allDates = eachDayOfInterval({ start: startDate, end: endDate });

    return allDates.filter((date) => {
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 6 && !includeSaturday) return false; // Saturday
      if (dayOfWeek === 0 && !includeSunday) return false; // Sunday
      return true;
    });
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let dates: Date[] = [];

      if (formData.mode === "dateRange") {
        // Validate date range
        if (!formData.dateRange?.from || !formData.dateRange?.to) {
          showToast.error("Proszę wybrać zakres dat");
          return;
        }
        dates = getDateRangeArray(formData.dateRange);
      } else {
        // Period mode
        dates = getPeriodDates(
          formData.selectedPeriod,
          formData.includeSaturday,
          formData.includeSunday
        );
      }

      // Validate time range
      if (!validateTimeRange(formData.start_time, formData.end_time)) {
        showToast.error(
          "Godzina rozpoczęcia musi być wcześniejsza niż zakończenia"
        );
        return;
      }

      const scheduleEntries = [];
      const conflicts = [];

      // Check for conflicts and prepare entries
      for (const date of dates) {
        const weekday = date.getDay();

        // Check for conflicts
        if (
          checkTimeConflict(weekday, formData.start_time, formData.end_time)
        ) {
          conflicts.push(
            `${format(date, "dd.MM.yyyy")} (${
              weekdays.find((w) => w.value === weekday)?.label
            })`
          );
          continue;
        }

        // Check if schedule for this weekday already exists
        const existingSchedule = currentSchedules.find(
          (s) => s.weekday === weekday
        );

        if (existingSchedule) {
          conflicts.push(`${format(date, "dd.MM.yyyy")} (już istnieje)`);
          continue;
        }

        scheduleEntries.push({
          employee_id: employee.id,
          weekday: weekday,
          start_time: formData.start_time,
          end_time: formData.end_time,
        });
      }

      // Show conflicts if any
      if (conflicts.length > 0) {
        const maxDisplayed = 5;
        const displayedConflicts = conflicts.slice(0, maxDisplayed);
        const remainingCount = conflicts.length - maxDisplayed;
        const conflictMessage =
          remainingCount > 0
            ? `Konflikty: ${displayedConflicts.join(
                ", "
              )} i ${remainingCount} więcej...`
            : `Konflikty: ${displayedConflicts.join(", ")}`;

        showToast.error(conflictMessage);
        if (scheduleEntries.length === 0) return;
      }

      // Insert valid entries
      if (scheduleEntries.length > 0) {
        const { data, error } = await supabase
          .from("schedules")
          .insert(scheduleEntries)
          .select();

        if (error) throw error;

        const newSchedules = [...currentSchedules, ...data];
        setCurrentSchedules(newSchedules);
        onScheduleUpdate(newSchedules);

        // Reset form
        setFormData({
          mode: "dateRange",
          dateRange: undefined,
          selectedPeriod: "1month",
          start_time: "09:00",
          end_time: "17:00",
          includeSaturday: false,
          includeSunday: false,
        });

        const modeText =
          formData.mode === "month"
            ? `okresu: ${
                periodOptions.find((p) => p.value === formData.selectedPeriod)
                  ?.label || "wybrany okres"
              }`
            : "wybranym zakresie dat";

        showToast.success(
          `Dodano grafik dla ${scheduleEntries.length} dni w ${modeText}`
        );
      }
    } catch (error) {
      console.error("Error adding schedule:", error);
      showToast.error("Błąd podczas dodawania grafiku");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSchedule = async (schedule: Schedule) => {
    showConfirmToast(
      `Czy na pewno chcesz usunąć grafik na ${
        weekdays.find((w) => w.value === schedule.weekday)?.label
      }?`,
      async () => {
        try {
          const { error } = await supabase
            .from("schedules")
            .delete()
            .eq("id", schedule.id);

          if (error) throw error;

          const newSchedules = currentSchedules.filter(
            (s) => s.id !== schedule.id
          );
          setCurrentSchedules(newSchedules);
          onScheduleUpdate(newSchedules);

          showToast.success("Grafik został usunięty");
        } catch (error) {
          console.error("Error deleting schedule:", error);
          showToast.error("Błąd podczas usuwania grafiku");
        }
      }
    );
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // Remove seconds if present
  };

  // Create a summary of the work schedule
  const getScheduleSummary = () => {
    if (currentSchedules.length === 0) return null;

    // Group schedules by time range to show patterns
    const timeGroups = currentSchedules.reduce((acc, schedule) => {
      const timeKey = `${formatTime(schedule.start_time)}-${formatTime(
        schedule.end_time
      )}`;
      if (!acc[timeKey]) {
        acc[timeKey] = [];
      }
      acc[timeKey].push(schedule.weekday);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(timeGroups).map(([timeRange, weekdays]) => ({
      timeRange,
      weekdays: weekdays.sort((a, b) => a - b),
      count: weekdays.length,
    }));
  };

  const scheduleStats = {
    totalDays: currentSchedules.length,
    workingDays: [...new Set(currentSchedules.map((s) => s.weekday))].length,
    totalHours: currentSchedules.reduce((total, schedule) => {
      const start = new Date(`2000-01-01T${schedule.start_time}:00`);
      const end = new Date(`2000-01-01T${schedule.end_time}:00`);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0),
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex-1">
          <CalendarIcon className="h-4 w-4 mr-1" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Grafik pracy - {employee.name}
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Zarządzaj grafikiem pracy pracownika - dodawaj dla konkretnych dat
            lub różnych okresów czasowych
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 p-1">
          {/* Current schedule summary - only show if not hidden */}
          {!hideCurrentSchedule && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Aktualny grafik
                  </h3>
                  {currentSchedules.length > 0 && (
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {scheduleStats.workingDays} dni w tygodniu
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        {scheduleStats.totalHours.toFixed(0)}h tygodniowo
                      </Badge>
                    </div>
                  )}
                </div>

                {currentSchedules.length === 0 ? (
                  <Card className="border-dashed border-2 border-gray-200">
                    <CardContent className="py-12">
                      <div className="text-center text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <h4 className="text-lg font-medium text-gray-700 mb-1">
                          Brak grafiku
                        </h4>
                        <p className="text-sm">
                          Użyj formularza poniżej, aby dodać grafik pracy
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {getScheduleSummary()?.map((group, index) => (
                      <Card
                        key={index}
                        className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-lg font-semibold text-gray-900">
                                  {group.timeRange}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {group.weekdays.map((weekday) => (
                                  <Badge
                                    key={weekday}
                                    variant="secondary"
                                    className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  >
                                    {
                                      weekdays.find((w) => w.value === weekday)
                                        ?.label
                                    }
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-500 font-medium">
                                {group.count}{" "}
                                {group.count === 1 ? "dzień" : "dni"}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  // Delete all schedules in this time group
                                  showConfirmToast(
                                    `Czy na pewno chcesz usunąć wszystkie grafiki dla godzin ${group.timeRange}?`,
                                    async () => {
                                      try {
                                        const schedulesToDelete =
                                          currentSchedules.filter(
                                            (s) =>
                                              `${formatTime(
                                                s.start_time
                                              )}-${formatTime(s.end_time)}` ===
                                              group.timeRange
                                          );

                                        const { error } = await supabase
                                          .from("schedules")
                                          .delete()
                                          .in(
                                            "id",
                                            schedulesToDelete.map((s) => s.id)
                                          );

                                        if (error) throw error;

                                        const newSchedules =
                                          currentSchedules.filter(
                                            (s) =>
                                              !schedulesToDelete.some(
                                                (d) => d.id === s.id
                                              )
                                          );
                                        setCurrentSchedules(newSchedules);
                                        onScheduleUpdate(newSchedules);

                                        showToast.success(
                                          "Grafiki zostały usunięte"
                                        );
                                      } catch (error) {
                                        console.error(
                                          "Error deleting schedules:",
                                          error
                                        );
                                        showToast.error(
                                          "Błąd podczas usuwania grafików"
                                        );
                                      }
                                    }
                                  );
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <Separator className="my-8" />
            </>
          )}

          {/* Add new schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {hideCurrentSchedule
                ? "Zarządzaj grafikiem"
                : "Dodaj nowy grafik"}
            </h3>
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <form onSubmit={handleAddSchedule} className="space-y-6">
                  {/* Mode Selection */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold text-gray-900">
                      Sposób dodawania
                    </Label>
                    <Tabs
                      value={formData.mode}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          mode: value as "dateRange" | "month",
                        }))
                      }
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100">
                        <TabsTrigger
                          value="dateRange"
                          className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                        >
                          Zakres dat
                        </TabsTrigger>
                        <TabsTrigger
                          value="month"
                          className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                        >
                          Według okresu
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="dateRange" className="space-y-4 mt-6">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">
                            Wybierz zakres dat
                          </Label>
                          <Popover
                            open={isCalendarOpen}
                            onOpenChange={setIsCalendarOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal h-12 bg-gray-50 border-gray-200 hover:bg-gray-100",
                                  !formData.dateRange && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-3 h-4 w-4" />
                                {formData.dateRange?.from ? (
                                  formData.dateRange.to ? (
                                    <>
                                      {format(
                                        formData.dateRange.from,
                                        "dd.MM.yyyy"
                                      )}{" "}
                                      -{" "}
                                      {format(
                                        formData.dateRange.to,
                                        "dd.MM.yyyy"
                                      )}
                                    </>
                                  ) : (
                                    format(
                                      formData.dateRange.from,
                                      "dd.MM.yyyy"
                                    )
                                  )
                                ) : (
                                  "Wybierz zakres dat"
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={formData.dateRange?.from}
                                selected={formData.dateRange}
                                onSelect={(range) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    dateRange: range,
                                  }));
                                  if (range?.from && range?.to) {
                                    setIsCalendarOpen(false);
                                  }
                                }}
                                numberOfMonths={2}
                                disabled={(date) => date < new Date()}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </TabsContent>

                      <TabsContent value="month" className="space-y-4 mt-6">
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">
                              Wybierz okres
                            </Label>
                            <Select
                              value={formData.selectedPeriod}
                              onValueChange={(value) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  selectedPeriod: value as
                                    | "1month"
                                    | "3months"
                                    | "6months"
                                    | "1year"
                                    | "2years",
                                }));
                              }}
                            >
                              <SelectTrigger className="h-12 bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Wybierz okres" />
                              </SelectTrigger>
                              <SelectContent>
                                {periodOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">
                              Grafik zostanie dodany od dzisiaj na wybrany okres
                            </p>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">
                              Dni tygodnia do uwzględnienia
                            </Label>
                            <div className="flex gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.includeSaturday}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      includeSaturday: e.target.checked,
                                    }))
                                  }
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  Soboty
                                </span>
                              </label>
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.includeSunday}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      includeSunday: e.target.checked,
                                    }))
                                  }
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  Niedziele
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Time Selection */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold text-gray-900">
                      Godziny pracy
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="start_time"
                          className="text-sm font-medium text-gray-700"
                        >
                          Godzina rozpoczęcia
                        </Label>
                        <Input
                          id="start_time"
                          type="time"
                          value={formData.start_time}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              start_time: e.target.value,
                            }))
                          }
                          className="h-12 bg-gray-50 border-gray-200 focus:bg-white"
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="end_time"
                          className="text-sm font-medium text-gray-700"
                        >
                          Godzina zakończenia
                        </Label>
                        <Input
                          id="end_time"
                          type="time"
                          value={formData.end_time}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              end_time: e.target.value,
                            }))
                          }
                          className="h-12 bg-gray-50 border-gray-200 focus:bg-white"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base shadow-sm"
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
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
