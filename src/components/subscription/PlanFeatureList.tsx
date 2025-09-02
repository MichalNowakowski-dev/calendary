import { Check } from "lucide-react";

interface PlanFeatureListProps {
  features: Record<string, string>;
  className?: string;
}

export function PlanFeatureList({ features, className = "grid gap-2 md:grid-cols-2" }: PlanFeatureListProps) {
  if (!features || Object.keys(features).length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {Object.entries(features).map(([key, value]) => (
        <div key={key} className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-green-500" />
          {value}
        </div>
      ))}
    </div>
  );
}