import { formatLimitValue } from "@/lib/utils/planFormatters";

interface PlanLimitsProps {
  maxEmployees: number | null;
  maxLocations: number | null;
}

export default function PlanLimits({
  maxEmployees,
  maxLocations,
}: PlanLimitsProps) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Limits:</h4>
      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span>Employees:</span>
          <span className="font-medium">
            {formatLimitValue(maxEmployees)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Locations:</span>
          <span className="font-medium">
            {formatLimitValue(maxLocations)}
          </span>
        </div>
      </div>
    </div>
  );
}