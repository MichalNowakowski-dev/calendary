"use server";

import { stripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
import {
  CompanySubscriptionInsert,
  CompanySubscriptionUpdate,
} from "@/lib/types/database";
import { PostgrestError } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

type companyOwnerIdAndEmail = {
  id: string;
  email: string;
};

export async function createStripeCustomer(
  email: string,
  companyName: string,
  companyId: string
): Promise<string> {
  try {
    const customer = await stripe.customers.create({
      email,
      name: companyName,
      metadata: {
        company_id: companyId,
      },
    });

    return customer.id;
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    throw new Error("Failed to create Stripe customer");
  }
}

export async function createCheckoutSession(
  priceId: string,
  companyId: string,
  planId: string
): Promise<string> {
  try {
    const supabase = await createClient();

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("name, slug")
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      throw new Error("Company not found");
    }

    // Get or create Stripe customer
    let customerId: string;

    // Check if company already has a subscription with customer ID
    const { data: existingSubscription } = await supabase
      .from("company_subscriptions")
      .select("stripe_customer_id")
      .eq("company_id", companyId)
      .single();

    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id;
    } else {
      // Get company owner email for customer creation
      const {
        data: owner,
        error: ownerError,
      }: { data: companyOwnerIdAndEmail | null; error: PostgrestError | null } =
        await supabase
          .from("company_owners")
          .select(
            `
          user_id,
          email
        `
          )
          .eq("company_id", companyId)
          .single();

      if (ownerError || !owner) {
        throw new Error("Company owner not found");
      }

      const ownerEmail = owner.email;
      if (!ownerEmail) {
        throw new Error("Owner email not found");
      }

      customerId = await createStripeCustomer(
        ownerEmail,
        company.name,
        companyId
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      metadata: {
        company_id: companyId,
        plan_id: planId,
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
    });

    // Update or create company subscription with customer ID
    const subscriptionData: CompanySubscriptionInsert = {
      company_id: companyId,
      subscription_plan_id: planId,
      stripe_customer_id: customerId,
      status: "inactive",
      billing_cycle: priceId.includes("yearly") ? "yearly" : "monthly",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(), // 30 days from now
    };

    const { error: upsertError } = await supabase
      .from("company_subscriptions")
      .upsert(subscriptionData, {
        onConflict: "company_id",
      });

    if (upsertError) {
      console.error("Error upserting subscription:", upsertError);
      throw new Error("Failed to update subscription");
    }

    return session.url!;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw new Error("Failed to create checkout session");
  }
}

export async function handlePaymentSuccess(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.metadata?.company_id) {
      throw new Error("Company ID not found in session metadata");
    }

    const companyId = session.metadata.company_id;

    // The webhook will handle the subscription activation
    // This is just for immediate feedback to the user
    revalidatePath(`/dashboard/${companyId}`);
    revalidatePath("/admin/companies");
  } catch (error) {
    console.error("Error handling payment success:", error);
    throw new Error("Failed to process payment success");
  }
}

export async function cancelSubscription(companyId: string) {
  try {
    const supabase = await createClient();

    // Get the subscription details
    const { data: subscription, error } = await supabase
      .from("company_subscriptions")
      .select("stripe_subscription_id")
      .eq("company_id", companyId)
      .single();

    if (error || !subscription?.stripe_subscription_id) {
      throw new Error("Subscription not found");
    }

    // Cancel the subscription in Stripe
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Update local subscription status
    const { error: updateError } = await supabase
      .from("company_subscriptions")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("company_id", companyId);

    if (updateError) {
      throw new Error("Failed to update local subscription status");
    }

    revalidatePath(`/dashboard/${companyId}`);
    revalidatePath("/admin/companies");
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw new Error("Failed to cancel subscription");
  }
}

export async function reactivateSubscription(companyId: string) {
  try {
    const supabase = await createClient();

    // Get the subscription details
    const { data: subscription, error } = await supabase
      .from("company_subscriptions")
      .select("stripe_subscription_id")
      .eq("company_id", companyId)
      .single();

    if (error || !subscription?.stripe_subscription_id) {
      throw new Error("Subscription not found");
    }

    // Reactivate the subscription in Stripe
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false,
    });

    // Update local subscription status
    const { error: updateError } = await supabase
      .from("company_subscriptions")
      .update({
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("company_id", companyId);

    if (updateError) {
      throw new Error("Failed to update local subscription status");
    }

    revalidatePath(`/dashboard/${companyId}`);
    revalidatePath("/admin/companies");
  } catch (error) {
    console.error("Error reactivating subscription:", error);
    throw new Error("Failed to reactivate subscription");
  }
}

export async function getSubscriptionDetails(companyId: string) {
  try {
    const supabase = await createClient();

    const { data: subscription, error } = await supabase
      .from("company_subscriptions")
      .select(
        `
        *,
        subscription_plan:subscription_plans(*)
      `
      )
      .eq("company_id", companyId)
      .single();

    if (error) {
      throw new Error("Subscription not found");
    }

    // If there's a Stripe subscription ID, get fresh data from Stripe
    if (subscription.stripe_subscription_id) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id
        );

        return {
          ...subscription,
          stripe_status: stripeSubscription.status,
          current_period_start: new Date(
            stripeSubscription.items.data[0].current_period_start * 1000
          ).toISOString(),
          current_period_end: new Date(
            stripeSubscription.items.data[0].current_period_end * 1000
          ).toISOString(),
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        };
      } catch (stripeError) {
        console.error("Error fetching Stripe subscription:", stripeError);
        // Return local data if Stripe fetch fails
        return subscription;
      }
    }

    return subscription;
  } catch (error) {
    console.error("Error getting subscription details:", error);
    throw new Error("Failed to get subscription details");
  }
}

export async function syncSubscriptionWithStripe(companyId: string) {
  try {
    const supabase = await createClient();

    const { data: subscription, error } = await supabase
      .from("company_subscriptions")
      .select("stripe_subscription_id")
      .eq("company_id", companyId)
      .single();

    if (error || !subscription?.stripe_subscription_id) {
      throw new Error("Subscription not found");
    }

    // Fetch fresh data from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    );

    // Update local subscription with Stripe data
    const updates: CompanySubscriptionUpdate = {
      payment_status: stripeSubscription.status,
      status:
        stripeSubscription.status === "active"
          ? "active"
          : stripeSubscription.status === "past_due"
            ? "past_due"
            : stripeSubscription.status === "canceled"
              ? "cancelled"
              : "inactive",
      current_period_start: new Date(
        stripeSubscription.items.data[0].current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        stripeSubscription.items.data[0].current_period_end * 1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("company_subscriptions")
      .update(updates)
      .eq("company_id", companyId);

    if (updateError) {
      throw new Error("Failed to sync subscription data");
    }

    revalidatePath(`/dashboard/${companyId}`);
    revalidatePath("/admin/companies");
  } catch (error) {
    console.error("Error syncing subscription:", error);
    throw new Error("Failed to sync subscription");
  }
}

export async function createUpgradeCheckoutSession(
  companyId: string,
  newPlanId: string,
  billingCycle: "monthly" | "yearly" = "monthly"
): Promise<string> {
  try {
    const supabase = await createClient();

    // Get company details and current subscription
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("name, slug")
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      throw new Error("Company not found");
    }

    // Get current subscription (may not exist for free plan companies)
    const { data: currentSubscription, error: subscriptionError } = await supabase
      .from("company_subscriptions")
      .select(`
        *,
        subscription_plan:subscription_plans(*)
      `)
      .eq("company_id", companyId)
      .maybeSingle();

    // Get new plan details for validation
    const { data: newPlan, error: newPlanError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", newPlanId)
      .single();

    if (newPlanError || !newPlan) {
      throw new Error("Target plan not found");
    }

    // Validate upgrade - if there's a current subscription, ensure this is an upgrade
    if (currentSubscription && currentSubscription.subscription_plan) {
      const currentPrice = billingCycle === "yearly" 
        ? currentSubscription.subscription_plan.price_yearly 
        : currentSubscription.subscription_plan.price_monthly;
      const newPrice = billingCycle === "yearly" 
        ? newPlan.price_yearly 
        : newPlan.price_monthly;

      if (newPrice <= currentPrice) {
        throw new Error("Plan change must be an upgrade to a higher-tier plan");
      }
    }
    // If no current subscription (free plan), any paid plan is considered an upgrade

    // Get the Stripe price ID from the new plan
    const priceId = billingCycle === "yearly" 
      ? newPlan.stripe_price_id_yearly 
      : newPlan.stripe_price_id_monthly;

    if (!priceId) {
      throw new Error(`No ${billingCycle} price ID configured for ${newPlan.display_name}`);
    }

    // Get or use existing Stripe customer
    let customerId = currentSubscription?.stripe_customer_id;
    
    if (!customerId) {
      // Get company owner email for customer creation
      const { data: owner, error: ownerError } = await supabase
        .from("company_owners")
        .select("email")
        .eq("company_id", companyId)
        .single();

      if (ownerError || !owner?.email) {
        throw new Error("Company owner not found");
      }

      customerId = await createStripeCustomer(owner.email, company.name, companyId);
    }

    // Create checkout session for upgrade
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&upgrade=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel?upgrade=true`,
      metadata: {
        company_id: companyId,
        plan_id: newPlanId,
        upgrade_from_plan: currentSubscription?.subscription_plan_id || "free",
        upgrade_type: "plan_upgrade",
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
      // For upgrades, we want to cancel the existing subscription and create a new one
      subscription_data: {
        metadata: {
          company_id: companyId,
          plan_id: newPlanId,
          upgrade_from_plan: currentSubscription?.subscription_plan_id || "free",
        },
      },
    });

    return session.url!;
  } catch (error) {
    console.error("Error creating upgrade checkout session:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create upgrade checkout session"
    );
  }
}
