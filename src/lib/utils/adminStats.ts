import type {
  Company,
  CompanyWithOptionalSubscription,
} from "@/lib/types/database";

export interface AdminStats {
  totalCompanies: number;
  activeSubscriptions: number;
  totalRevenue: number;
  planDistribution: Record<string, number>;
}

export function calculateAdminStats(
  allCompanies: Company[],
  companiesWithSubscription: CompanyWithOptionalSubscription[]
): AdminStats {
  const activeSubscriptions = companiesWithSubscription.filter(
    (c) => c.company_subscriptions?.[0]?.status === "active"
  ).length;

  const totalRevenue = companiesWithSubscription.reduce((sum, c) => {
    const subscription = c.company_subscriptions?.[0];
    if (subscription?.status === "active") {
      return sum + (subscription.subscription_plan?.price_monthly || 0);
    }
    return sum;
  }, 0);

  const planDistribution = calculatePlanDistribution(companiesWithSubscription);

  return {
    totalCompanies: allCompanies.length,
    activeSubscriptions,
    totalRevenue,
    planDistribution,
  };
}

export function calculatePlanDistribution(
  companiesWithSubscription: CompanyWithOptionalSubscription[]
): Record<string, number> {
  return companiesWithSubscription.reduce((acc, c) => {
    const planName =
      c.company_subscriptions?.[0]?.subscription_plan?.name || "none";
    acc[planName] = (acc[planName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export function calculateSubscriptionPercentage(
  activeSubscriptions: number,
  totalCompanies: number
): string {
  if (totalCompanies === 0) return "0.0";
  return ((activeSubscriptions / totalCompanies) * 100).toFixed(1);
}