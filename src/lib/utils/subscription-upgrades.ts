import type { SubscriptionPlanWithModules } from "@/lib/types/database";

export interface UpgradeValidationResult {
  canUpgrade: boolean;
  reason?: string;
  missingPriceIds?: string[];
}

export function validateUpgradeEligibility(
  currentPlan: SubscriptionPlanWithModules,
  targetPlan: SubscriptionPlanWithModules,
  billingCycle: "monthly" | "yearly" = "monthly"
): UpgradeValidationResult {
  // Check if it's actually an upgrade (higher price)
  const currentPrice = billingCycle === "yearly" 
    ? currentPlan.price_yearly 
    : currentPlan.price_monthly;
  const targetPrice = billingCycle === "yearly" 
    ? targetPlan.price_yearly 
    : targetPlan.price_monthly;

  if (targetPrice <= currentPrice) {
    return {
      canUpgrade: false,
      reason: "Target plan must be higher tier than current plan"
    };
  }

  // Check if target plan has valid Stripe price IDs in database
  const monthlyPriceId = targetPlan.stripe_price_id_monthly;
  const yearlyPriceId = targetPlan.stripe_price_id_yearly;
  
  const missingPriceIds: string[] = [];
  
  if (!monthlyPriceId) {
    missingPriceIds.push(`${targetPlan.display_name} monthly`);
  }
  
  if (targetPlan.price_yearly > 0 && !yearlyPriceId) {
    missingPriceIds.push(`${targetPlan.display_name} yearly`);
  }

  // Check if the specific billing cycle we need is configured
  const requiredPriceId = billingCycle === "yearly" 
    ? targetPlan.stripe_price_id_yearly 
    : targetPlan.stripe_price_id_monthly;
    
  if (!requiredPriceId) {
    return {
      canUpgrade: false,
      reason: `Stripe price ID missing for ${targetPlan.display_name} (${billingCycle})`,
      missingPriceIds
    };
  }

  return {
    canUpgrade: true
  };
}

export function getUpgradeBenefits(
  currentPlan: SubscriptionPlanWithModules,
  targetPlan: SubscriptionPlanWithModules
): string[] {
  const benefits: string[] = [];
  
  // Employee limit increase
  if (targetPlan.max_employees && currentPlan.max_employees) {
    if (targetPlan.max_employees > currentPlan.max_employees) {
      benefits.push(`Increase employee limit from ${currentPlan.max_employees} to ${targetPlan.max_employees}`);
    }
  } else if (targetPlan.max_employees && !currentPlan.max_employees) {
    benefits.push(`Support for up to ${targetPlan.max_employees} employees`);
  } else if (!targetPlan.max_employees && currentPlan.max_employees) {
    benefits.push("Unlimited employees");
  }

  // Feature differences (basic comparison)
  const currentFeatures = Object.keys(currentPlan.features || {});
  const targetFeatures = Object.keys(targetPlan.features || {});
  const newFeatures = targetFeatures.filter(feature => !currentFeatures.includes(feature));
  
  if (newFeatures.length > 0) {
    benefits.push(`Access to ${newFeatures.length} additional features`);
  }

  return benefits;
}

export function calculateUpgradeCost(
  currentPlan: SubscriptionPlanWithModules,
  targetPlan: SubscriptionPlanWithModules,
  billingCycle: "monthly" | "yearly" = "monthly"
): {
  currentCost: number;
  targetCost: number;
  additionalCost: number;
  savings?: number;
} {
  const currentCost = billingCycle === "yearly" 
    ? currentPlan.price_yearly 
    : currentPlan.price_monthly;
  const targetCost = billingCycle === "yearly" 
    ? targetPlan.price_yearly 
    : targetPlan.price_monthly;
  
  const additionalCost = targetCost - currentCost;
  
  // Calculate yearly savings if applicable
  let savings: number | undefined;
  if (billingCycle === "yearly" && targetPlan.price_yearly > 0 && targetPlan.price_monthly > 0) {
    savings = (targetPlan.price_monthly * 12) - targetPlan.price_yearly;
  }

  return {
    currentCost,
    targetCost,
    additionalCost,
    savings
  };
}

export function isUpgradeAvailable(
  currentPlan: SubscriptionPlanWithModules,
  targetPlan: SubscriptionPlanWithModules
): boolean {
  const validation = validateUpgradeEligibility(currentPlan, targetPlan);
  return validation.canUpgrade;
}