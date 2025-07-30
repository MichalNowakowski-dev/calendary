"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarIcon } from "lucide-react";
import type { EmployeeScheduleProps } from "./types";
import { ScheduleStats } from "./ScheduleStats";
import { ScheduleForm } from "./ScheduleForm";

export const EmployeeSchedule = ({
  employee,
  schedules,
  onScheduleUpdate,
  hideCurrentSchedule = false,
  buttonText = "Grafik",
}: EmployeeScheduleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSchedules, setCurrentSchedules] = useState(schedules);

  useEffect(() => {
    setCurrentSchedules(schedules);
  }, [schedules]);

  const handleScheduleUpdate = (newSchedules: typeof schedules) => {
    setCurrentSchedules(newSchedules);
    onScheduleUpdate(newSchedules);
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
          <DialogDescription className="text-base text-gray-600 dark:text-gray-400">
            Zarządzaj grafikiem pracy pracownika - dodawaj grafiki dla
            konkretnych okresów dat
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 p-1">
          {/* Current schedule summary */}
          {!hideCurrentSchedule && (
            <>
              <ScheduleStats schedules={currentSchedules} />

              <Separator className="my-8" />
            </>
          )}

          {/* Add new schedule */}
          <ScheduleForm
            employee={employee}
            currentSchedules={currentSchedules}
            onScheduleUpdate={handleScheduleUpdate}
            hideCurrentSchedule={hideCurrentSchedule}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
