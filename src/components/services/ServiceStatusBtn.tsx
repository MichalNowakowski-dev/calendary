"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ToggleLeft, ToggleRight } from "lucide-react";

import type { Service } from "@/lib/types/database";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface ServiceStatusBtnProps {
  service: Service;
  onToggle: () => void;
  className?: string;
}

export default function ServiceStatusBtn({
  service,
  onToggle,
  className,
}: ServiceStatusBtnProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    try {
      setIsUpdating(true);
      onToggle();
    } catch (error) {
      console.error("Error toggling service status:", error);
      showToast.error("Błąd podczas zmiany statusu usługi");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleToggle}
      disabled={isUpdating}
      className={cn("", className)}
    >
      {service.active ? (
        <div className="flex items-center">
          <ToggleRight className="h-4 w-4 mr-1 text-green-500" />
          <span>Dezaktywuj</span>
        </div>
      ) : (
        <div className="flex items-center">
          <ToggleLeft className="h-4 w-4 mr-1" />
          <span>Aktywuj</span>
        </div>
      )}
    </Button>
  );
}
