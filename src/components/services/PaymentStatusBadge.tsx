"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, RotateCcw } from "lucide-react";

interface PaymentStatusBadgeProps {
  status: "pending" | "paid" | "refunded" | "cancelled";
  className?: string;
}

export default function PaymentStatusBadge({
  status,
  className = "",
}: PaymentStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Oczekuje na płatność",
          variant: "secondary" as const,
          icon: Clock,
          className:
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        };
      case "paid":
        return {
          label: "Opłacone",
          variant: "default" as const,
          icon: CheckCircle,
          className:
            "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        };
      case "refunded":
        return {
          label: "Zwrócone",
          variant: "outline" as const,
          icon: RotateCcw,
          className:
            "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        };
      case "cancelled":
        return {
          label: "Anulowane",
          variant: "destructive" as const,
          icon: XCircle,
          className:
            "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        };
      default:
        return {
          label: "Nieznany",
          variant: "secondary" as const,
          icon: Clock,
          className:
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`flex items-center gap-1 ${config.className} ${className}`}
    >
      <IconComponent className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
