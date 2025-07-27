"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ScheduleCalendar from "@/components/services/ScheduleCalendar";
import type { Employee, Service, Schedule } from "@/lib/types/database";

interface EmployeeWithDetails extends Employee {
  services: Service[];
  schedules: Schedule[];
}

interface ScheduleViewModalProps {
  employee: EmployeeWithDetails;
}

export default function ScheduleViewModal({
  employee,
}: ScheduleViewModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex-1">
          <Eye className="h-4 w-4 mr-1" />
          Pokaż grafik
        </Button>
      </DialogTrigger>
      <DialogContent className="lg:max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Grafik pracy - {employee.name}</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Kalendarzowy widok grafiku pracy pracownika
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <ScheduleCalendar
            schedules={employee.schedules}
            employeeName={employee.name}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
