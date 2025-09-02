// Example of how to modify SubscriptionDialog.tsx to use the price config file
// This would replace the existing handleSelectPlan function

import { getStripePriceId } from "@/lib/stripe/price-config";

const handleSelectPlan = async (plan: SubscriptionPlanWithModules, billingCycle: 'monthly' | 'yearly') => {
  try {
    setUpdating(plan.id);
    
    // Get price ID from config file instead of database
    const priceId = getStripePriceId(plan.name, billingCycle);
    
    if (!priceId) {
      toast({
        title: "Error",
        description: "Payment configuration not available for this plan",
        variant: "destructive",
      });
      return;
    }

    // Create Stripe checkout session
    const checkoutUrl = await createCheckoutSession(priceId, company.id, plan.id);
    
    // Redirect to Stripe Checkout
    window.location.href = checkoutUrl;
    
  } catch (error) {
    console.error("Error creating checkout session:", error);
    toast({
      title: "Error",
      description: "Failed to initiate payment. Please try again.",
      variant: "destructive",
    });
    setUpdating(null);
  }
};