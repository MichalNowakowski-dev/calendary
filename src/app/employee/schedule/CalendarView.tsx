"use client";

import { Calendar } from "@/components/ui/calendar";
import { Appointment } from "@/lib/types/database";

interface CalendarViewProps {
  appointments: Appointment[];
}

export default function CalendarView({ appointments }: CalendarViewProps) {
  return (
    <div className="space-y-4">
      <Calendar
        mode="multiple"
        selected={appointments.map((a) => new Date(a.date))}
      />
      <div className="text-sm text-muted-foreground">
        {appointments.length} appointment{appointments.length !== 1 ? "s" : ""}{" "}
        selected
      </div>
    </div>
  );
}
