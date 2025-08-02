interface BookingProgressProps {
  currentStep: number;
  totalSteps: number;
  isUserLoggedIn: boolean;
}

const getSteps = (isUserLoggedIn: boolean) => {
  if (isUserLoggedIn) {
    return [
      { id: 1, title: "Termin wizyty" },
      { id: 2, title: "Potwierdzenie" },
    ];
  }
  return [
    { id: 1, title: "Dane kontaktowe" },
    { id: 2, title: "Termin wizyty" },
    { id: 3, title: "Potwierdzenie" },
  ];
};

export default function BookingProgress({
  currentStep,
  totalSteps,
  isUserLoggedIn,
}: BookingProgressProps) {
  const steps = getSteps(isUserLoggedIn);

  return (
    <div className="sticky top-0 bg-white dark:bg-gray-900 border-b p-6">
      <h2 className="text-2xl font-bold mb-2">Rezerwacja wizyty</h2>
      <p className="text-gray-600 dark:text-gray-400">
        Krok {currentStep} z {totalSteps}
      </p>
      <div className="flex justify-between mt-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center gap-2 ${
              step.id <= currentStep
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step.id <= currentStep
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step.id < currentStep ? "✓" : step.id}
            </div>
            <span className="hidden sm:inline">{step.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
