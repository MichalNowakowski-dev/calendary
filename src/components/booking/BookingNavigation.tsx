import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle, X } from "lucide-react";

interface BookingNavigationProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  handlePrevStep: () => void;
  handleNextStep: () => void;
  onClose: () => void;
}

export default function BookingNavigation({
  currentStep,
  totalSteps,
  isSubmitting,
  handlePrevStep,
  handleNextStep,
  onClose,
}: BookingNavigationProps) {
  return (
    <div className="flex gap-3 pt-6 border-t">
      {currentStep === 1 && (
        <Button type="button" variant="outline" onClick={onClose}>
          <X className="h-4 w-4" /> Zamknij
        </Button>
      )}
      {currentStep > 1 && (
        <Button type="button" variant="outline" onClick={handlePrevStep}>
          <ChevronLeft className="h-4 w-4" /> Wstecz
        </Button>
      )}
      <div className="flex-1" />
      {currentStep < totalSteps ? (
        <Button type="button" onClick={handleNextStep} disabled={isSubmitting}>
          Dalej <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>Rezerwuję...</>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" /> Potwierdź
            </>
          )}
        </Button>
      )}
    </div>
  );
}
