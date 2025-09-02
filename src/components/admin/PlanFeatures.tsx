import {
  formatFeatureName,
  formatFeatureValue,
} from "@/lib/utils/planFormatters";

interface PlanFeaturesProps {
  features: Record<string, string> | null;
}

export default function PlanFeatures({ features }: PlanFeaturesProps) {
  if (!features || Object.keys(features).length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Features:</h4>
      <div className="space-y-1 text-sm">
        {Object.entries(features).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="capitalize">{formatFeatureName(key)}:</span>
            <span className="font-medium">{formatFeatureValue(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
