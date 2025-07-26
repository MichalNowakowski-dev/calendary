import type { Employee, Schedule } from "@/lib/types/database";

export interface EmployeeScheduleProps {
  employee: Employee;
  schedules: Schedule[];
  onScheduleUpdate: (schedules: Schedule[]) => void;
  hideCurrentSchedule?: boolean;
  buttonText?: string;
}

export interface ScheduleFormData {
  startDate: Date;
  endDate: Date;
  start_time: string;
  end_time: string;
  selectedDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

export interface ScheduleStats {
  totalWorkingDays: number;
  totalHours: number;
}

export interface WorkPeriod {
  earliestStart: Date;
  latestEnd: Date;
}

export const dayLabels = {
  monday: "Poniedziałek",
  tuesday: "Wtorek",
  wednesday: "Środa",
  thursday: "Czwartek",
  friday: "Piątek",
  saturday: "Sobota",
  sunday: "Niedziela",
} as const;
