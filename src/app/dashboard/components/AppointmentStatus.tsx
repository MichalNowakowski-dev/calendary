"use client";

import { CheckCircle, XCircle, Clock } from "lucide-react";

interface AppointmentStatusProps {
  status: string;
}

export default function AppointmentStatus({ status }: AppointmentStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Zakończona";
      case "cancelled":
        return "Anulowana";
      case "booked":
        return "Zarezerwowana";
      default:
        return status;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {getStatusIcon(status)}
      <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
        {getStatusText(status)}
      </span>
    </div>
  );
}
