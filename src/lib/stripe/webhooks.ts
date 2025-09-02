import Stripe from 'stripe';
import { stripe } from './client';
import { STRIPE_CONFIG, STRIPE_ERRORS } from './config';
import { createClient } from '@/lib/supabase/server';
import { PaymentEventInsert, CompanySubscriptionUpdate } from '@/lib/types/database';

export class StripeWebhookError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'StripeWebhookError';
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
  const supabase = createClient();
  
  const paymentEvent: PaymentEventInsert = {
    company_id: companyId,
    stripe_event_id: event.id,
    event_type: event.type,
    event_data: event.data,
    processed: false,
  };

  const { error } = await supabase
    .from('payment_events')
    .insert(paymentEvent);

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
  const supabase = createClient();
  
  const { error } = await supabase
    .from('payment_events')
    .update({
      processed: true,
      processed_at: new Date().toISOString(),
      error_message: errorMessage,
    })
    .eq('stripe_event_id', eventId);

  if (error) {
    throw new StripeWebhookError(
      `Failed to mark event as processed: ${error.message}`
    );
  }
}

export async function findCompanyByStripeCustomerId(
  customerId: string
): Promise<string | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('company_subscriptions')
    .select('company_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.company_id;
}

export async function updateCompanySubscription(
  companyId: string,
  updates: CompanySubscriptionUpdate
): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('company_subscriptions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('company_id', companyId);

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
    throw new StripeWebhookError('Missing customer or subscription in checkout session');
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Fetch the subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Find the company associated with this customer
  const companyId = await findCompanyByStripeCustomerId(customerId);
  
  if (!companyId) {
    throw new StripeWebhookError(`No company found for customer: ${customerId}`);
  }

  // Update the company subscription with Stripe details
  await updateCompanySubscription(companyId, {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    payment_status: subscription.status as any,
    status: subscription.status === 'active' ? 'active' : 'inactive',
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  });
}

export async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice
): Promise<void> {
  if (!invoice.customer || !invoice.subscription) {
    return; // Skip if not a subscription invoice
  }

  const customerId = invoice.customer as string;
  const companyId = await findCompanyByStripeCustomerId(customerId);
  
  if (!companyId) {
    throw new StripeWebhookError(`No company found for customer: ${customerId}`);
  }

  // Fetch fresh subscription data
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  
  // Update subscription to active status
  await updateCompanySubscription(companyId, {
    payment_status: subscription.status as any,
    status: 'active',
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  });
}

export async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
): Promise<void> {
  if (!invoice.customer || !invoice.subscription) {
    return; // Skip if not a subscription invoice
  }

  const customerId = invoice.customer as string;
  const companyId = await findCompanyByStripeCustomerId(customerId);
  
  if (!companyId) {
    throw new StripeWebhookError(`No company found for customer: ${customerId}`);
  }

  // Fetch fresh subscription data
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  
  // Update subscription to past_due status
  await updateCompanySubscription(companyId, {
    payment_status: subscription.status as any,
    status: 'past_due',
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
    throw new StripeWebhookError(`No company found for customer: ${customerId}`);
  }

  // Map Stripe status to our internal status
  let internalStatus: 'active' | 'inactive' | 'cancelled' | 'past_due' = 'inactive';
  
  switch (subscription.status) {
    case 'active':
    case 'trialing':
      internalStatus = 'active';
      break;
    case 'past_due':
      internalStatus = 'past_due';
      break;
    case 'canceled':
    case 'incomplete':
    case 'incomplete_expired':
    case 'unpaid':
      internalStatus = 'cancelled';
      break;
    case 'paused':
      internalStatus = 'inactive';
      break;
  }

  await updateCompanySubscription(companyId, {
    payment_status: subscription.status as any,
    status: internalStatus,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
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
    throw new StripeWebhookError(`No company found for customer: ${customerId}`);
  }

  await updateCompanySubscription(companyId, {
    payment_status: 'canceled',
    status: 'cancelled',
  });
}

export async function processWebhookEvent(event: Stripe.Event): Promise<void> {
  let companyId: string | null = null;

  try {
    // Log the event first
    await logPaymentEvent(event, companyId);

    // Process different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark as successfully processed
    await markEventAsProcessed(event.id);
    
  } catch (error) {
    // Mark as failed with error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await markEventAsProcessed(event.id, errorMessage);
    throw error;
  }
}