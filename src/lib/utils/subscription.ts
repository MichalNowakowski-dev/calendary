import type { SubscriptionStatus, BillingCycle, SubscriptionPlanWithModules } from "@/lib/types/database";

export const getSubscriptionStatusLabel = (status: SubscriptionStatus): string => {
  switch (status) {
    case "active":
      return "Aktywny";
    case "cancelled":
      return "Anulowany";
    case "past_due":
      return "Zaległy";
    case "inactive":
    default:
      return "Nieaktywny";
  }
};

export const getBillingCycleLabel = (cycle: BillingCycle): string => {
  return cycle === "monthly" ? "miesięczny" : "roczny";
};

export const formatSubscriptionDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("pl-PL");
};

export const isCurrentPlan = (currentPlanId: string, planId: string): boolean => {
  return currentPlanId === planId;
};

export const isFreePlan = (planName: string): boolean => {
  return planName === "free";
};

export const getPlanLimitsDisplay = (plan: SubscriptionPlanWithModules): { label: string; value: string }[] => {
  const limits: { label: string; value: string }[] = [];
  
  if (plan.max_employees) {
    limits.push({
      label: "Maksymalnie pracowników",
      value: plan.max_employees.toString()
    });
  }
  
  if (plan.max_locations) {
    limits.push({
      label: "Maksymalnie lokalizacji", 
      value: plan.max_locations.toString()
    });
  }
  
  if (limits.length === 0) {
    limits.push({
      label: "Limity",
      value: "Bez limitów"
    });
  }
  
  return limits;
};

export const getSubscriptionStatusVariant = (status: SubscriptionStatus): "default" | "secondary" => {
  return status === "active" ? "default" : "secondary";
};