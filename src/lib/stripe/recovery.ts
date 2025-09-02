import { stripe } from './client';
import { createClient } from '@/lib/supabase/server';
import { updateCompanySubscription, findCompanyByStripeCustomerId } from './webhooks';

export interface PaymentFailureInfo {
  companyId: string;
  subscriptionId: string;
  customerId: string;
  failureReason: string;
  attemptCount: number;
  nextRetryDate?: Date;
}

export interface RecoveryAction {
  type: 'retry_payment' | 'update_payment_method' | 'downgrade_plan' | 'contact_support';
  description: string;
  actionUrl?: string;
}

export async function getPaymentFailureInfo(companyId: string): Promise<PaymentFailureInfo | null> {
  try {
    const supabase = createClient();
    
    const { data: subscription, error } = await supabase
      .from('company_subscriptions')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('company_id', companyId)
      .eq('status', 'past_due')
      .single();

    if (error || !subscription?.stripe_subscription_id) {
      return null;
    }

    // Get details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    );

    // Get recent invoice failures
    const invoices = await stripe.invoices.list({
      customer: subscription.stripe_customer_id,
      subscription: subscription.stripe_subscription_id,
      status: 'open',
      limit: 1,
    });

    const failedInvoice = invoices.data[0];
    let failureReason = 'Payment failed';
    let attemptCount = 0;
    let nextRetryDate: Date | undefined;

    if (failedInvoice) {
      attemptCount = failedInvoice.attempt_count;
      nextRetryDate = failedInvoice.next_payment_attempt 
        ? new Date(failedInvoice.next_payment_attempt * 1000)
        : undefined;

      // Get failure reason from payment attempts
      if (failedInvoice.last_finalization_error) {
        failureReason = failedInvoice.last_finalization_error.message || 'Payment failed';
      }
    }

    return {
      companyId,
      subscriptionId: subscription.stripe_subscription_id,
      customerId: subscription.stripe_customer_id,
      failureReason,
      attemptCount,
      nextRetryDate,
    };

  } catch (error) {
    console.error('Error getting payment failure info:', error);
    return null;
  }
}

export function getRecoveryActions(failureInfo: PaymentFailureInfo): RecoveryAction[] {
  const actions: RecoveryAction[] = [];

  // Always offer to update payment method
  actions.push({
    type: 'update_payment_method',
    description: 'Update your payment method to resolve the issue',
    actionUrl: `/payment/update-method?customer_id=${failureInfo.customerId}`,
  });

  // Offer retry if we haven't exceeded attempts
  if (failureInfo.attemptCount < 3) {
    actions.push({
      type: 'retry_payment',
      description: 'Retry the payment with your current method',
    });
  }

  // Offer downgrade option
  actions.push({
    type: 'downgrade_plan',
    description: 'Downgrade to a free plan to avoid service interruption',
    actionUrl: `/admin/companies/subscription/downgrade`,
  });

  // Always offer support contact
  actions.push({
    type: 'contact_support',
    description: 'Contact support for assistance with payment issues',
    actionUrl: '/support',
  });

  return actions;
}

export async function retryFailedPayment(companyId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { data: subscription, error } = await supabase
      .from('company_subscriptions')
      .select('stripe_subscription_id')
      .eq('company_id', companyId)
      .single();

    if (error || !subscription?.stripe_subscription_id) {
      throw new Error('Subscription not found');
    }

    // Get the latest invoice for this subscription
    const invoices = await stripe.invoices.list({
      subscription: subscription.stripe_subscription_id,
      status: 'open',
      limit: 1,
    });

    if (invoices.data.length === 0) {
      throw new Error('No pending invoice found');
    }

    const invoice = invoices.data[0];
    
    // Attempt to pay the invoice
    const paidInvoice = await stripe.invoices.pay(invoice.id);
    
    if (paidInvoice.status === 'paid') {
      // Update subscription status
      await updateCompanySubscription(companyId, {
        status: 'active',
        payment_status: 'active',
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error retrying failed payment:', error);
    return false;
  }
}

export async function createPaymentMethodUpdateSession(
  customerId: string,
  companyId: string
): Promise<string> {
  try {
    // Create a setup session for updating payment method
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'setup',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/method-updated?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      metadata: {
        company_id: companyId,
        purpose: 'update_payment_method',
      },
    });

    return session.url!;
  } catch (error) {
    console.error('Error creating payment method update session:', error);
    throw new Error('Failed to create payment method update session');
  }
}

export async function downgradeToFreePlan(companyId: string): Promise<void> {
  try {
    const supabase = createClient();
    
    // Get the free plan ID
    const { data: freePlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('name', 'free')
      .single();

    if (planError || !freePlan) {
      throw new Error('Free plan not found');
    }

    // Get current subscription
    const { data: currentSubscription, error: subError } = await supabase
      .from('company_subscriptions')
      .select('stripe_subscription_id')
      .eq('company_id', companyId)
      .single();

    if (subError) {
      throw new Error('Current subscription not found');
    }

    // Cancel Stripe subscription if it exists
    if (currentSubscription.stripe_subscription_id) {
      await stripe.subscriptions.cancel(currentSubscription.stripe_subscription_id);
    }

    // Update to free plan
    const { error: updateError } = await supabase
      .from('company_subscriptions')
      .update({
        subscription_plan_id: freePlan.id,
        status: 'active',
        payment_status: null,
        stripe_subscription_id: null,
        billing_cycle: 'monthly',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        updated_at: new Date().toISOString(),
      })
      .eq('company_id', companyId);

    if (updateError) {
      throw new Error('Failed to downgrade subscription');
    }

    // Revoke premium modules
    await supabase
      .from('company_modules')
      .update({ is_enabled: false })
      .eq('company_id', companyId)
      .neq('module_name', 'employee_management'); // Keep basic employee management

  } catch (error) {
    console.error('Error downgrading to free plan:', error);
    throw new Error('Failed to downgrade to free plan');
  }
}

export async function checkPaymentHealthStatus(companyId: string): Promise<{
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  actions: RecoveryAction[];
}> {
  try {
    const supabase = createClient();
    
    const { data: subscription, error } = await supabase
      .from('company_subscriptions')
      .select('status, payment_status, current_period_end')
      .eq('company_id', companyId)
      .single();

    if (error || !subscription) {
      return {
        status: 'critical',
        message: 'Subscription not found',
        actions: [{ type: 'contact_support', description: 'Contact support for assistance' }],
      };
    }

    const periodEndDate = new Date(subscription.current_period_end);
    const daysUntilExpiry = Math.ceil((periodEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (subscription.status === 'past_due') {
      const failureInfo = await getPaymentFailureInfo(companyId);
      return {
        status: 'critical',
        message: 'Your payment has failed. Please update your payment method to avoid service interruption.',
        actions: failureInfo ? getRecoveryActions(failureInfo) : [],
      };
    }

    if (subscription.status === 'cancelled') {
      return {
        status: 'critical',
        message: 'Your subscription has been cancelled. Reactivate to continue using premium features.',
        actions: [
          { type: 'contact_support', description: 'Contact support to reactivate your subscription' },
        ],
      };
    }

    if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) {
      return {
        status: 'warning',
        message: `Your subscription expires in ${daysUntilExpiry} day(s). Make sure your payment method is up to date.`,
        actions: [
          { type: 'update_payment_method', description: 'Verify your payment method' },
        ],
      };
    }

    return {
      status: 'healthy',
      message: 'Your subscription is active and payments are up to date.',
      actions: [],
    };

  } catch (error) {
    console.error('Error checking payment health:', error);
    return {
      status: 'critical',
      message: 'Unable to check payment status',
      actions: [{ type: 'contact_support', description: 'Contact support for assistance' }],
    };
  }
}