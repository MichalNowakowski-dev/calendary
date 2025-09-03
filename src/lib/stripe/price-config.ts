// Stripe Price Configuration
// This file maps subscription plans to Stripe price IDs

export const STRIPE_PRICE_CONFIG = {
  // Free/Starter Plan - typically no Stripe prices since it's free
  free: {
    monthly: null, // Free plan doesn't need Stripe price
    yearly: null, // Free plan doesn't need Stripe price
  },
  starter: {
    monthly: null, // Free plan doesn't need Stripe price
    yearly: null, // Free plan doesn't need Stripe price
  },

  // Professional Plan
  professional: {
    monthly: "price_1XXXXXXXXX", // Replace with actual monthly price ID
    yearly: "price_1XXXXXXXXX", // Replace with actual yearly price ID
  },

  // Enterprise Plan
  enterprise: {
    monthly: "price_1XXXXXXXXX", // Replace with actual monthly price ID
    yearly: "price_1XXXXXXXXX", // Replace with actual yearly price ID
  },
} as const;

export type PlanName = keyof typeof STRIPE_PRICE_CONFIG;
export type BillingCycle = "monthly" | "yearly";

export function getStripePriceId(
  planName: string,
  billingCycle: BillingCycle
): string | null {
  const plan = STRIPE_PRICE_CONFIG[planName as PlanName];
  if (!plan) {
    console.warn(`No Stripe configuration found for plan: ${planName}`);
    return null;
  }

  return plan[billingCycle];
}

export function validatePriceConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [planName, config] of Object.entries(STRIPE_PRICE_CONFIG)) {
    if (planName === "starter") continue; // Skip validation for free plan

    if (!config.monthly) {
      errors.push(`Missing monthly price ID for ${planName} plan`);
    }

    if (!config.yearly) {
      errors.push(`Missing yearly price ID for ${planName} plan`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
