"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, CreditCard, Banknote } from "lucide-react";

interface PaymentMethodBadgeProps {
  status: "online" | "on_site" | "deposit";
  className?: string;
}

export default function PaymentMethodBadge({
  status,
  className = "",
}: PaymentMethodBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "online":
        return {
          label: "Online",
          variant: "secondary" as const,
          icon: CreditCard,
          className:
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        };
      case "on_site":
        return {
          label: "Na miejscu",
          variant: "default" as const,
          icon: Banknote,
          className:
            "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        };
      case "deposit":
        return {
          label: "Zaliczka",
          variant: "outline" as const,
          icon: CreditCard,
          className:
            "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        };

      default:
        return {
          label: "Nieznana",
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
