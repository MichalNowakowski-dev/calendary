"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ToggleLeft, ToggleRight } from "lucide-react";

import type { Service } from "@/lib/types/database";
import { showToast } from "@/lib/toast";

interface ServiceActionsProps {
  service: Service;
  onToggle: () => void;
}

export default function ServiceActions({
  service,
  onToggle,
}: ServiceActionsProps) {
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
    <>
      {/* Status toggle button */}
      <Button
        size="sm"
        variant="outline"
        onClick={handleToggle}
        disabled={isUpdating}
        className="flex items-center"
      >
        {service.active ? (
          <>
            <ToggleRight className="h-4 w-4 mr-1 text-green-500" />
            Dezaktywuj
          </>
        ) : (
          <>
            <ToggleLeft className="h-4 w-4 mr-1" />
            Aktywuj
          </>
        )}
      </Button>
    </>
  );
}
