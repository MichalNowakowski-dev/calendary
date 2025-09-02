# Stripe Sandbox Integration Plan

## Current State Analysis
- ✅ Full subscription system with `subscription_plans`, `company_subscriptions`, `plan_modules` tables
- ✅ Admin-only subscription management with module toggles  
- ✅ Three subscription tiers: Starter, Professional, Enterprise
- ✅ Module lifecycle management with graceful degradation
- ✅ Payment links created in `STRIPE_SUBSCRIPTIONS_LINKS.ts`
- ❌ No Stripe SDK integration
- ❌ No webhook handlers for payment events
- ❌ No connection between payment links and subscription activation

## Manual Setup Required (You Need to Do This)

### 1. Stripe Account Setup
- Ensure you have Stripe test keys from your sandbox account
- Configure webhook endpoints in Stripe dashboard pointing to: `https://yourdomain.com/api/stripe/webhook`
- Set up these webhook events:
  - `checkout.session.completed`
  - `invoice.payment_succeeded` 
  - `invoice.payment_failed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

### 2. Environment Variables
Add to your `.env.local` file:
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Map Payment Links to Plans
Update `STRIPE_SUBSCRIPTIONS_LINKS.ts` to include Stripe price IDs:
```typescript
const STRIPE_SUBSCRIPTIONS_LINKS = {
  starter: {
    monthly: "https://buy.stripe.com/test_fZucMY5iJ0YPb0AgCK2Ry00",
    price_id: "price_xxx", // Add this
  },
  // ... etc
};
```

## Implementation Tasks (I Will Do This)

### Phase 1: Core Stripe Integration
1. **Install Dependencies**
   - Add `stripe` SDK to package.json
   - Install TypeScript types

2. **Create Stripe Configuration**
   - `src/lib/stripe/client.ts` - Stripe client setup
   - `src/lib/stripe/config.ts` - Configuration constants

3. **Database Schema Updates**
   - Add `stripe_customer_id` to `company_subscriptions` 
   - Add `stripe_subscription_id` to `company_subscriptions`
   - Add `payment_status` enum to `company_subscriptions`
   - Add `stripe_price_id` to `subscription_plans`
   - Create `payment_events` table for audit trail

### Phase 2: Webhook System
4. **Create Webhook Infrastructure**
   - `src/lib/stripe/webhooks.ts` - Webhook event handlers
   - `src/app/api/stripe/webhook/route.ts` - API endpoint
   - Event handlers for each subscription lifecycle event

5. **Payment Processing Logic**
   - `src/lib/actions/payments.ts` - Payment-related server actions
   - Automatic subscription activation after successful payment
   - Subscription cancellation handling
   - Payment failure recovery flows

### Phase 3: Frontend Integration
6. **Update Subscription Management**
   - Modify `SubscriptionDialog.tsx` to redirect to Stripe Checkout
   - Create payment success/cancel pages
   - Add payment status indicators to admin dashboard
   - Update subscription status displays

7. **User Experience Enhancements**
   - Add loading states during payment processing
   - Implement payment failure notifications
   - Create billing history views
   - Add subscription upgrade/downgrade flows

### Phase 4: Testing & Monitoring
8. **Testing Infrastructure**
   - Webhook testing utilities
   - Payment simulation tools
   - Error handling test scenarios
   - Integration test suite

9. **Monitoring & Logging**
   - Payment event logging
   - Failed webhook handling
   - Subscription sync verification
   - Error alerting system

## Key Integration Points

### Subscription Flow
1. User selects plan in `SubscriptionDialog`
2. Redirect to Stripe Checkout using payment links
3. After payment, Stripe sends webhook to `/api/stripe/webhook`
4. Webhook handler activates subscription in database
5. User gets access to paid features immediately

### Sync Strategy
- Stripe is source of truth for payment status
- Database subscription status mirrors Stripe
- Webhook events keep systems in sync
- Periodic sync job as backup (optional)

### Error Handling
- Webhook retry mechanism for failed events
- Payment failure recovery flows
- Subscription grace periods
- Automatic subscription reactivation

## Success Criteria
- ✅ Payment links successfully charge test cards
- ✅ Webhook events activate subscriptions automatically
- ✅ Failed payments are handled gracefully
- ✅ Subscription changes sync between Stripe and database
- ✅ Admin can view payment status and history
- ✅ Users get immediate access after successful payment

## Files to be Created/Modified

### New Files
- `src/lib/stripe/client.ts`
- `src/lib/stripe/config.ts` 
- `src/lib/stripe/webhooks.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/lib/actions/payments.ts`
- `src/app/(dashboards)/admin/billing/page.tsx` (optional)
- `src/app/payment/success/page.tsx`
- `src/app/payment/cancel/page.tsx`

### Modified Files
- `package.json` (add Stripe dependency)
- `src/lib/types/database.ts` (add payment fields)
- `src/app/(dashboards)/admin/companies/components/SubscriptionDialog.tsx`
- `src/lib/actions/subscriptions.ts` (integrate with Stripe)
- Database migration files

## Timeline Estimate
- Phase 1: 2-3 hours (setup and configuration)
- Phase 2: 4-5 hours (webhook system)
- Phase 3: 3-4 hours (frontend integration) 
- Phase 4: 2-3 hours (testing and polish)

**Total: ~12-15 hours of development time**