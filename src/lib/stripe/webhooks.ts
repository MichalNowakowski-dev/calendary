import Stripe from "stripe";
import { stripe } from "./client";
import { STRIPE_CONFIG, STRIPE_ERRORS } from "./config";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  if (!session.customer || !session.subscription) {
    throw new StripeWebhookError(
      "Missing customer or subscription in checkout session"
    );
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Extract metadata from session
  const companyId = session.metadata?.company_id;
  const planId = session.metadata?.plan_id;

  if (!companyId || !planId) {
    throw new StripeWebhookError(
      "Missing company_id or plan_id in session metadata"
    );
  }

  // Fetch the subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Determine billing cycle from subscription interval
  const priceId = subscription.items.data[0]?.price?.id;
  const interval = subscription.items.data[0]?.price?.recurring?.interval;
  const billingCycle = interval === "year" ? "yearly" : "monthly";

  // Create or update the company subscription with all details
  const supabase = await createClient();
  
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

  // Use upsert to handle both new subscriptions and updates
  const { error } = await supabase
    .from("company_subscriptions")
    .upsert(subscriptionUpsertData, {
      onConflict: "company_id",
    });

  if (error) {
    throw new StripeWebhookError(
      `Failed to upsert company subscription: ${error.message}`
    );
  }
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

  await updateCompanySubscription(companyId, {
    payment_status: "canceled",
    status: "cancelled",
  });
}

export async function processWebhookEvent(event: Stripe.Event): Promise<void> {
  const companyId: string | null = null;

  try {
    // Log the event first
    await logPaymentEvent(event, companyId);

    // Process different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice
        );
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark as successfully processed
    await markEventAsProcessed(event.id);
  } catch (error) {
    // Mark as failed with error message
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    await markEventAsProcessed(event.id, errorMessage);
    throw error;
  }
}
