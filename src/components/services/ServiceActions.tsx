"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Service } from "@/lib/types/database";
import { showToast, showConfirmToast } from "@/lib/toast";
import { useRouter } from "next/navigation";

interface ServiceActionsProps {
  service: Service;
  onEdit?: (service: Service) => void;
}

export default function ServiceActions({
  service,
  onEdit,
}: ServiceActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const toggleServiceStatus = async () => {
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from("services")
        .update({ active: !service.active })
        .eq("id", service.id);

      if (error) throw error;

      showToast.success(
        `Usługa została ${service.active ? "dezaktywowana" : "aktywowana"}`
      );

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error("Error toggling service status:", error);
      showToast.error("Błąd podczas zmiany statusu usługi");
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteService = async () => {
    showConfirmToast(
      `Czy na pewno chcesz usunąć usługę "${service.name}"?`,
      async () => {
        try {
          const { error } = await supabase
            .from("services")
            .delete()
            .eq("id", service.id);

          if (error) throw error;

          showToast.success("Usługa została usunięta");

          // Refresh the page to show updated data
          router.refresh();
        } catch (error) {
          console.error("Error deleting service:", error);
          showToast.error("Błąd podczas usuwania usługi");
        }
      }
    );
  };

  return (
    <>
      {/* Status toggle button */}
      <button
        onClick={toggleServiceStatus}
        disabled={isUpdating}
        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
      >
        {service.active ? (
          <ToggleRight className="h-6 w-6 text-green-500" />
        ) : (
          <ToggleLeft className="h-6 w-6" />
        )}
      </button>

      {/* Action buttons */}
      <div className="flex space-x-2 mt-4">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit?.(service)}
          className="flex-1"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edytuj
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={deleteService}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
