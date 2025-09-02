// Integration of existing Stripe payment links with our system
import { STRIPE_SUBSCRIPTIONS_PLANS } from '../../../STRIPE_SUBSCRIPTIONS_LINKS';
import { createCheckoutSession } from '@/lib/actions/payments';

export type PaymentMethod = 'payment_links' | 'checkout_api';
export type PlanKey = keyof typeof STRIPE_SUBSCRIPTIONS_PLANS;

export interface PaymentConfig {
  method: PaymentMethod;
  usePaymentLinks: boolean; // Toggle between payment links and API
}

// Default configuration - you can change this
export const PAYMENT_CONFIG: PaymentConfig = {
  method: 'payment_links', // Use your existing payment links by default
  usePaymentLinks: true,
};

/**
 * Get payment URL for a subscription plan
 * This function chooses between payment links and Stripe Checkout API
 */
export async function getPaymentUrl(
  planKey: string,
  billingCycle: 'monthly' | 'yearly',
  companyId: string,
  planId: string
): Promise<string> {
  const plan = STRIPE_SUBSCRIPTIONS_PLANS[planKey as PlanKey];
  
  if (!plan) {
    throw new Error(`No payment configuration found for plan: ${planKey}`);
  }

  // Option 1: Use your existing payment links (simpler, faster)
  if (PAYMENT_CONFIG.usePaymentLinks) {
    const linkKey = billingCycle === 'yearly' ? 'yearly_link' : 'monthly_link';
    const paymentLink = plan[linkKey];
    
    if (!paymentLink) {
      throw new Error(`No ${billingCycle} payment link available for ${planKey} plan`);
    }
    
    // Add metadata to track the company and plan
    const urlWithMetadata = `${paymentLink}?client_reference_id=${companyId}&metadata[plan_id]=${planId}&metadata[company_id]=${companyId}`;
    return urlWithMetadata;
  }
  
  // Option 2: Use Stripe Checkout API (more flexible, tracks better)
  else {
    if (!plan.price_id) {
      throw new Error(`No price ID available for ${planKey} plan`);
    }
    
    return await createCheckoutSession(plan.price_id, companyId, planId);
  }
}

/**
 * Get plan information including payment links and price IDs
 */
export function getPlanPaymentInfo(planKey: string) {
  const plan = STRIPE_SUBSCRIPTIONS_PLANS[planKey as PlanKey];
  
  if (!plan) {
    return null;
  }
  
  return {
    planKey,
    priceId: plan.price_id,
    monthlyLink: plan.monthly_link,
    yearlyLink: plan.yearly_link,
    hasMonthlyLink: !!plan.monthly_link,
    hasYearlyLink: !!plan.yearly_link,
    hasPriceId: !!plan.price_id,
  };
}

/**
 * Map database plan names to your Stripe plan keys
 */
export function mapPlanNameToStripeKey(planName: string): string {
  const mapping: Record<string, string> = {
    'starter': 'starter',
    'free': 'starter',
    'professional': 'pro',
    'pro': 'pro',
    'enterprise': 'enterprise',
  };
  
  return mapping[planName.toLowerCase()] || planName;
}

/**
 * Validate that all plans have proper payment configuration
 */
export function validatePaymentConfiguration(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const [planKey, config] of Object.entries(STRIPE_SUBSCRIPTIONS_PLANS)) {
    // Skip validation for starter/free plans
    if (planKey === 'starter' && !config.monthly_link && !config.price_id) {
      warnings.push(`Starter plan has no payment configuration (this is normal for free plans)`);
      continue;
    }
    
    // Check if plan has at least one payment method
    if (!config.monthly_link && !config.price_id) {
      errors.push(`Plan ${planKey} has no payment configuration (no links or price ID)`);
    }
    
    // Warn about missing yearly options
    if (!config.yearly_link) {
      warnings.push(`Plan ${planKey} missing yearly payment link`);
    }
    
    // Validate price ID format
    if (config.price_id && !config.price_id.startsWith('price_')) {
      errors.push(`Plan ${planKey} has invalid price ID format: ${config.price_id}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Switch between payment methods globally
 */
export function setPaymentMethod(method: PaymentMethod) {
  PAYMENT_CONFIG.method = method;
  PAYMENT_CONFIG.usePaymentLinks = method === 'payment_links';
}

// Export the Stripe plans for backward compatibility
export { STRIPE_SUBSCRIPTIONS_PLANS };