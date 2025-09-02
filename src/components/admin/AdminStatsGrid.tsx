import { Building2, CreditCard, Activity } from "lucide-react";
import { getAllCompaniesWithSubscriptions } from "@/lib/actions/subscriptions";
import { getAllCompanies } from "@/lib/actions";
import StatsCard from "./StatsCard";
import PlanDistributionCard from "./PlanDistributionCard";
import {
  calculateAdminStats,
  calculateSubscriptionPercentage,
} from "@/lib/utils/adminStats";

export default async function AdminStatsGrid() {
  try {
    const companiesWithSubscription = await getAllCompaniesWithSubscriptions();
    const allCompanies = await getAllCompanies();

    const stats = calculateAdminStats(allCompanies, companiesWithSubscription);

    const subscriptionPercentage = calculateSubscriptionPercentage(
      stats.activeSubscriptions,
      stats.totalCompanies
    );

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Companies"
          value={stats.totalCompanies}
          icon={Building2}
        />

        <StatsCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={Activity}
          subtitle={`${subscriptionPercentage}% of total`}
        />

        <StatsCard
          title="Monthly Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={CreditCard}
        />

        <PlanDistributionCard planDistribution={stats.planDistribution} />
      </div>
    );
  } catch (error) {
    console.error("Error loading admin stats:", error);
    return (
      <div className="text-center text-red-600 p-4">
        Error loading statistics. Please check your permissions.
      </div>
    );
  }
}