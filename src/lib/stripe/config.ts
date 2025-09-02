export const STRIPE_CONFIG = {
  API_VERSION: '2024-11-20.acacia' as const,
  CURRENCY: 'usd' as const,
  WEBHOOK_EVENTS: [
    'checkout.session.completed',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
    'customer.subscription.updated',
    'customer.subscription.deleted',
  ] as const,
  PAYMENT_STATUS: {
    ACTIVE: 'active',
    TRIALING: 'trialing',
    PAST_DUE: 'past_due',
    CANCELED: 'canceled',
    UNPAID: 'unpaid',
    INCOMPLETE: 'incomplete',
    INCOMPLETE_EXPIRED: 'incomplete_expired',
    PAUSED: 'paused',
  } as const,
} as const;

export const STRIPE_ERRORS = {
  NO_SECRET_KEY: 'STRIPE_SECRET_KEY is not set in environment variables',
  NO_WEBHOOK_SECRET: 'STRIPE_WEBHOOK_SECRET is not set in environment variables',
  NO_PUBLISHABLE_KEY: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables',
  INVALID_SIGNATURE: 'Invalid webhook signature',
  WEBHOOK_PROCESSING_FAILED: 'Webhook processing failed',
} as const;

export type StripePaymentStatus = typeof STRIPE_CONFIG.PAYMENT_STATUS[keyof typeof STRIPE_CONFIG.PAYMENT_STATUS];
export type StripeWebhookEvent = typeof STRIPE_CONFIG.WEBHOOK_EVENTS[number];