import Stripe from "stripe";
import { stripe } from "./client";
import { STRIPE_CONFIG, STRIPE_ERRORS } from "./config";
import { createAdminClient } from "@/lib/supabase/server";
import {
  PaymentEventInsert,
  CompanySubscriptionUpdate,
  CompanySubscriptionInsert,
} from "@/lib/types/database";

export class StripeWebhookError extends Error {
  constructor(
    message: string,
    public cause?: Error
  ) {
    super(message);
    this.name = "StripeWebhookError";
  }
}

export async function verifyWebhookSignature(
  payload: string,
  signature: string
): Promise<Stripe.Event> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new StripeWebhookError(STRIPE_ERRORS.NO_WEBHOOK_SECRET);
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    throw new StripeWebhookError(
      STRIPE_ERRORS.INVALID_SIGNATURE,
      error as Error
    );
  }
}

export async function logPaymentEvent(
  event: Stripe.Event,
  companyId?: string | null
): Promise<void> {
  const supabase = createAdminClient(); // Use admin client for webhook operations

  const paymentEvent: PaymentEventInsert = {
    company_id: companyId,
    stripe_event_id: event.id,
    event_type: event.type,
    event_data: event.data,
    processed: false,
  };

  const { error } = await supabase.from("payment_events").insert(paymentEvent);

  if (error) {
    throw new StripeWebhookError(
      `Failed to log payment event: ${error.message}`
    );
  }
}

export async function markEventAsProcessed(
  eventId: string,
  errorMessage?: string
): Promise<void> {
  const supabase = createAdminClient(); // Use admin client for webhook operations

  const { error } = await supabase
    .from("payment_events")
    .update({
      processed: true,
      processed_at: new Date().toISOString(),
      error_message: errorMessage,
    })
    .eq("stripe_event_id", eventId);

  if (error) {
    throw new StripeWebhookError(
      `Failed to mark event as processed: ${error.message}`
    );
  }
}

export async function findCompanyByStripeCustomerId(
  customerId: string
): Promise<string | null> {
  const supabase = createAdminClient(); // Use admin client for webhook operations

  // First try to find by existing subscription record
  const { data: subscriptionData } = await supabase
    .from("company_subscriptions")
    .select("company_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (subscriptionData?.company_id) {
    return subscriptionData.company_id;
  }

  // If no subscription record exists, try to find by Stripe customer metadata
  try {
    const customer = await stripe.customers.retrieve(customerId);
    
    if (customer && !customer.deleted && customer.metadata?.company_id) {
      return customer.metadata.company_id;
    }
  } catch (error) {
    console.error("Error retrieving Stripe customer:", error);
  }

  return null;
}

export async function updateCompanySubscription(
  companyId: string,
  updates: CompanySubscriptionUpdate
): Promise<void> {
  const supabase = createAdminClient(); // Use admin client for webhook operations

  const { error } = await supabase
    .from("company_subscriptions")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("company_id", companyId);

  if (error) {
    throw new StripeWebhookError(
      `Failed to update company subscription: ${error.message}`
    );
  }
}

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  console.log("🎯 Processing checkout.session.completed webhook:", session.id);
  
  if (!session.customer || !session.subscription) {
    console.error("❌ Missing customer or subscription in session:", {
      customer: session.customer,
      subscription: session.subscription,
    });
    throw new StripeWebhookError(
      "Missing customer or subscription in checkout session"
    );
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  
  console.log("📋 Session details:", {
    customerId,
    subscriptionId,
    metadata: session.metadata,
  });

  // Extract metadata from session
  const companyId = session.metadata?.company_id;
  const planId = session.metadata?.plan_id;

  if (!companyId || !planId) {
    console.error("❌ Missing metadata in session:", {
      company_id: companyId,
      plan_id: planId,
      all_metadata: session.metadata,
    });
    throw new StripeWebhookError(
      "Missing company_id or plan_id in session metadata"
    );
  }

  console.log("✅ Extracted metadata:", { companyId, planId });

  // Create Supabase admin client for webhook operations
  const supabase = createAdminClient();

  // Validate plan exists in our database
  console.log("🔍 Validating plan exists in database:", planId);
  const { data: planExists, error: planError } = await supabase
    .from("subscription_plans")
    .select("id, name, display_name")
    .eq("id", planId)
    .single();

  if (planError || !planExists) {
    console.error("❌ Plan not found in database:", {
      planId,
      error: planError?.message,
      planExists,
    });
    throw new StripeWebhookError(
      `Plan with ID ${planId} not found in database: ${planError?.message}`
    );
  }

  console.log("✅ Plan validated:", planExists);

  // Fetch the subscription details from Stripe
  console.log("🔄 Fetching subscription from Stripe:", subscriptionId);
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  console.log("📊 Stripe subscription details:", {
    id: subscription.id,
    status: subscription.status,
    current_period_start: subscription.items.data[0]?.current_period_start,
    current_period_end: subscription.items.data[0]?.current_period_end,
    interval: subscription.items.data[0]?.price?.recurring?.interval,
  });

  // Determine billing cycle from subscription interval
  const priceId = subscription.items.data[0]?.price?.id;
  const interval = subscription.items.data[0]?.price?.recurring?.interval;
  const billingCycle = interval === "year" ? "yearly" : "monthly";

  console.log("💳 Billing details:", { priceId, interval, billingCycle });
  
  const subscriptionUpsertData: CompanySubscriptionInsert = {
    company_id: companyId,
    subscription_plan_id: planId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    payment_status: subscription.status,
    status: subscription.status === "active" ? "active" : "inactive",
    billing_cycle: billingCycle,
    current_period_start: new Date(
      subscription.items.data[0].current_period_start * 1000
    ).toISOString(),
    current_period_end: new Date(
      subscription.items.data[0].current_period_end * 1000
    ).toISOString(),
  };

  console.log("💾 Preparing to upsert subscription data:", subscriptionUpsertData);

  // Use upsert to handle both new subscriptions and updates
  const { data: upsertedData, error } = await supabase
    .from("company_subscriptions")
    .upsert(subscriptionUpsertData, {
      onConflict: "company_id",
    })
    .select("*");

  if (error) {
    console.error("❌ Failed to upsert company subscription:", {
      error: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      subscriptionData: subscriptionUpsertData,
    });
    throw new StripeWebhookError(
      `Failed to upsert company subscription: ${error.message}`
    );
  }

  console.log("✅ Successfully upserted subscription:", upsertedData);

  // Update company's plan_id to reflect the new subscription
  console.log("🔄 Updating company plan_id to:", planId);
  const { error: companyUpdateError } = await supabase
    .from("companies")
    .update({ plan_id: planId })
    .eq("id", companyId);

  if (companyUpdateError) {
    console.error("❌ Failed to update company plan_id:", {
      error: companyUpdateError.message,
      code: companyUpdateError.code,
      companyId,
      planId,
    });
    throw new StripeWebhookError(
      `Failed to update company plan_id: ${companyUpdateError.message}`
    );
  }

  console.log("✅ Successfully updated company plan_id");
  console.log("🎉 Checkout session completed successfully for company:", companyId);
}

export async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice
): Promise<void> {
  if (
    !invoice.customer ||
    !invoice.lines?.data?.length ||
    !invoice.lines.data.some((line) => line.subscription)
  ) {
    return; // Skip if not a subscription invoice
  }

  const customerId = invoice.customer as string;
  const companyId = await findCompanyByStripeCustomerId(customerId);

  if (!companyId) {
    throw new StripeWebhookError(
      `No company found for customer: ${customerId}`
    );
  }

  // Get subscription ID from line items
  const subscriptionId = invoice.lines.data.find((line) => line.subscription)
    ?.subscription as string;

  // Fetch fresh subscription data
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Update subscription to active status
  await updateCompanySubscription(companyId, {
    payment_status: subscription.status,
    status: "active",
    current_period_start: new Date(
      subscription.items.data[0].current_period_start * 1000
    ).toISOString(),
    current_period_end: new Date(
      subscription.items.data[0].current_period_end * 1000
    ).toISOString(),
  });
}

export async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
): Promise<void> {
  if (
    !invoice.customer ||
    !invoice.lines?.data?.length ||
    !invoice.lines.data.some((line) => line.subscription)
  ) {
    return; // Skip if not a subscription invoice
  }

  const customerId = invoice.customer as string;
  const companyId = await findCompanyByStripeCustomerId(customerId);

  if (!companyId) {
    throw new StripeWebhookError(
      `No company found for customer: ${customerId}`
    );
  }

  // Get subscription ID from line items
  const subscriptionId = invoice.lines.data.find((line) => line.subscription)
    ?.subscription as string;

  // Fetch fresh subscription data
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Update subscription to past_due status
  await updateCompanySubscription(companyId, {
    payment_status: subscription.status,
    status: "past_due",
  });
}

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  if (!subscription.customer) {
    return;
  }

  const customerId = subscription.customer as string;
  const companyId = await findCompanyByStripeCustomerId(customerId);

  if (!companyId) {
    throw new StripeWebhookError(
      `No company found for customer: ${customerId}`
    );
  }

  // Map Stripe status to our internal status
  let internalStatus: "active" | "inactive" | "cancelled" | "past_due" =
    "inactive";

  switch (subscription.status) {
    case "active":
    case "trialing":
      internalStatus = "active";
      break;
    case "past_due":
      internalStatus = "past_due";
      break;
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    case "unpaid":
      internalStatus = "cancelled";
      break;
    case "paused":
      internalStatus = "inactive";
      break;
  }

  await updateCompanySubscription(companyId, {
    payment_status: subscription.status,
    status: internalStatus,
    current_period_start: new Date(
      subscription.items.data[0].current_period_start * 1000
    ).toISOString(),
    current_period_end: new Date(
      subscription.items.data[0].current_period_end * 1000
    ).toISOString(),
  });
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  if (!subscription.customer) {
    return;
  }

  const customerId = subscription.customer as string;
  const companyId = await findCompanyByStripeCustomerId(customerId);

  if (!companyId) {
    throw new StripeWebhookError(
      `No company found for customer: ${customerId}`
    );
  }

  // Update subscription status to cancelled
  await updateCompanySubscription(companyId, {
    payment_status: "canceled",
    status: "cancelled",
  });

  // Reset company back to free plan
  console.log("🔄 Resetting company to free plan after subscription deletion");
  const supabase = createAdminClient();
  
  // Get the free plan ID
  const { data: freePlan, error: freePlanError } = await supabase
    .from("subscription_plans")
    .select("id")
    .eq("name", "free")
    .single();

  if (freePlanError || !freePlan) {
    console.error("❌ Failed to find free plan:", freePlanError?.message);
    throw new StripeWebhookError(
      `Failed to find free plan: ${freePlanError?.message}`
    );
  }

  // Update company's plan_id back to free plan
  const { error: companyUpdateError } = await supabase
    .from("companies")
    .update({ plan_id: freePlan.id })
    .eq("id", companyId);

  if (companyUpdateError) {
    console.error("❌ Failed to reset company to free plan:", {
      error: companyUpdateError.message,
      companyId,
      freePlanId: freePlan.id,
    });
    throw new StripeWebhookError(
      `Failed to reset company to free plan: ${companyUpdateError.message}`
    );
  }

  console.log("✅ Successfully reset company to free plan");
}

export async function processWebhookEvent(event: Stripe.Event): Promise<void> {
  console.log("🚀 Processing webhook event:", {
    id: event.id,
    type: event.type,
    created: new Date(event.created * 1000).toISOString(),
  });

  const companyId: string | null = null;

  try {
    // Log the event first
    console.log("📝 Logging payment event to database");
    await logPaymentEvent(event, companyId);

    // Process different event types
    console.log("🔄 Processing event type:", event.type);
    switch (event.type) {
      case "checkout.session.completed":
        console.log("💳 Handling checkout.session.completed");
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "invoice.payment_succeeded":
        console.log("✅ Handling invoice.payment_succeeded");
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice
        );
        break;

      case "invoice.payment_failed":
        console.log("❌ Handling invoice.payment_failed");
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "customer.subscription.updated":
        console.log("🔄 Handling customer.subscription.updated");
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        console.log("🗑️ Handling customer.subscription.deleted");
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    // Mark as successfully processed
    console.log("✅ Marking event as processed:", event.id);
    await markEventAsProcessed(event.id);
    console.log("🎉 Webhook event processed successfully:", event.id);
  } catch (error) {
    // Mark as failed with error message
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("💥 Webhook processing failed:", {
      eventId: event.id,
      eventType: event.type,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    await markEventAsProcessed(event.id, errorMessage);
    throw error;
  }
}
