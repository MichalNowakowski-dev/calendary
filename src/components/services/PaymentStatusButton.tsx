"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { updatePaymentStatusClient } from "@/lib/actions/appointments";
import { showToast } from "@/lib/toast";

interface PaymentStatusButtonProps {
  appointmentId: string;
  currentStatus: "pending" | "paid" | "refunded" | "cancelled";
  onStatusUpdate?: () => void;
}

export default function PaymentStatusButton({
  appointmentId,
  currentStatus,
  onStatusUpdate,
}: PaymentStatusButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsPaid = async () => {
    setIsLoading(true);
    try {
      const result = await updatePaymentStatusClient(appointmentId, "paid");

      if (result.success) {
        showToast.success(result.message);
        onStatusUpdate?.();
      } else {
        showToast.error(result.message);
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      showToast.error("Wystąpił błąd podczas aktualizacji statusu płatności");
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStatus === "paid") {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800"
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        Opłacone
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleMarkAsPaid}
      disabled={isLoading}
      className="hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-950 dark:hover:text-green-300 dark:hover:border-green-700"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <CheckCircle className="h-4 w-4 mr-1" />
      )}
      Oznacz jako opłacone
    </Button>
  );
}
