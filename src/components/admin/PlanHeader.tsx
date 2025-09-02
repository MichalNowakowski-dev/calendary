import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlanHeaderProps {
  displayName: string;
  isActive: boolean;
  priceMonthly: number;
  priceYearly: number;
  description?: string | null;
}

export default function PlanHeader({
  displayName,
  isActive,
  priceMonthly,
  priceYearly,
  description,
}: PlanHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-xl">{displayName}</CardTitle>
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      </div>
      <div className="text-3xl font-bold text-blue-600">
        ${priceMonthly}
        <span className="text-sm font-normal text-gray-500">/month</span>
      </div>
      <div className="text-lg text-gray-600">
        ${priceYearly}
        <span className="text-sm font-normal text-gray-500">/year</span>
      </div>
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
    </CardHeader>
  );
}