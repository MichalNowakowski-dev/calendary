import { Users } from "lucide-react";
import StatsCard from "./StatsCard";

interface PlanDistributionCardProps {
  planDistribution: Record<string, number>;
}

export default function PlanDistributionCard({
  planDistribution,
}: PlanDistributionCardProps) {
  const totalPlans = Object.values(planDistribution).reduce((sum, count) => sum + count, 0);

  return (
    <StatsCard
      title="Plan Distribution"
      value={totalPlans}
      icon={Users}
    >
      <div className="space-y-1">
        {Object.entries(planDistribution).map(([plan, count]) => (
          <div key={plan} className="flex justify-between text-sm">
            <span className="capitalize">{plan}</span>
            <span>{count}</span>
          </div>
        ))}
      </div>
    </StatsCard>
  );
}