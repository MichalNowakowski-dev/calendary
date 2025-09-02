'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  CreditCard,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CompanySubscription, SubscriptionPlan } from '@/lib/types/database';
import { format, differenceInDays } from 'date-fns';

export interface PaymentStatusIndicatorProps {
  subscription: CompanySubscription & {
    subscription_plan: SubscriptionPlan;
  };
  showActions?: boolean;
  onUpdatePaymentMethod?: () => void;
  onRetryPayment?: () => void;
  onContactSupport?: () => void;
  className?: string;
}

export function PaymentStatusIndicator({
  subscription,
  showActions = false,
  onUpdatePaymentMethod,
  onRetryPayment,
  onContactSupport,
  className
}: PaymentStatusIndicatorProps) {
  const getPaymentStatusInfo = () => {
    const status = subscription.payment_status;
    const subscriptionStatus = subscription.status;
    const daysUntilExpiry = differenceInDays(new Date(subscription.current_period_end), new Date());

    switch (status) {
      case 'active':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          label: 'Active',
          variant: 'default' as const,
          severity: 'success' as const,
          description: 'Your subscription is active and payments are up to date.',
        };
        
      case 'trialing':
        return {
          icon: <Clock className="h-4 w-4 text-blue-600" />,
          label: 'Trial',
          variant: 'secondary' as const,
          severity: 'info' as const,
          description: `You're on a free trial. ${daysUntilExpiry > 0 ? `${daysUntilExpiry} days remaining.` : 'Trial has ended.'}`,
        };
        
      case 'past_due':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
          label: 'Past Due',
          variant: 'destructive' as const,
          severity: 'error' as const,
          description: 'Payment failed. Please update your payment method to avoid service interruption.',
        };
        
      case 'canceled':
        return {
          icon: <XCircle className="h-4 w-4 text-red-600" />,
          label: 'Cancelled',
          variant: 'destructive' as const,
          severity: 'error' as const,
          description: 'Your subscription has been cancelled.',
        };
        
      case 'unpaid':
        return {
          icon: <XCircle className="h-4 w-4 text-red-600" />,
          label: 'Unpaid',
          variant: 'destructive' as const,
          severity: 'error' as const,
          description: 'Payment is overdue. Service may be limited.',
        };
        
      case 'incomplete':
        return {
          icon: <AlertCircle className="h-4 w-4 text-yellow-600" />,
          label: 'Incomplete',
          variant: 'secondary' as const,
          severity: 'warning' as const,
          description: 'Payment setup incomplete. Please complete your payment information.',
        };
        
      case 'incomplete_expired':
        return {
          icon: <XCircle className="h-4 w-4 text-red-600" />,
          label: 'Expired',
          variant: 'destructive' as const,
          severity: 'error' as const,
          description: 'Payment setup expired. Please restart the subscription process.',
        };
        
      case 'paused':
        return {
          icon: <Clock className="h-4 w-4 text-yellow-600" />,
          label: 'Paused',
          variant: 'secondary' as const,
          severity: 'warning' as const,
          description: 'Your subscription is temporarily paused.',
        };
        
      default:
        if (subscriptionStatus === 'active') {
          return {
            icon: <CheckCircle className="h-4 w-4 text-green-600" />,
            label: 'Active',
            variant: 'default' as const,
            severity: 'success' as const,
            description: 'Your subscription is active.',
          };
        }
        
        return {
          icon: <AlertCircle className="h-4 w-4 text-gray-600" />,
          label: 'Unknown',
          variant: 'secondary' as const,
          severity: 'info' as const,
          description: 'Payment status unknown.',
        };
    }
  };

  const statusInfo = getPaymentStatusInfo();
  const isStripeSubscription = !!subscription.stripe_subscription_id;
  const daysUntilExpiry = differenceInDays(new Date(subscription.current_period_end), new Date());
  const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Payment Status Badge */}
      <div className="flex items-center space-x-2">
        {statusInfo.icon}
        <Badge variant={statusInfo.variant}>
          {statusInfo.label}
        </Badge>
        {isStripeSubscription && (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Stripe
          </Badge>
        )}
      </div>

      {/* Status Alert */}
      {statusInfo.severity !== 'success' && (
        <Alert className={cn(
          statusInfo.severity === 'error' && 'border-red-200 bg-red-50',
          statusInfo.severity === 'warning' && 'border-yellow-200 bg-yellow-50',
          statusInfo.severity === 'info' && 'border-blue-200 bg-blue-50'
        )}>
          <AlertCircle className={cn(
            'h-4 w-4',
            statusInfo.severity === 'error' && 'text-red-600',
            statusInfo.severity === 'warning' && 'text-yellow-600',
            statusInfo.severity === 'info' && 'text-blue-600'
          )} />
          <AlertTitle>Payment Status</AlertTitle>
          <AlertDescription>{statusInfo.description}</AlertDescription>
        </Alert>
      )}

      {/* Expiring Soon Warning */}
      {statusInfo.severity === 'success' && isExpiringSoon && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Subscription Expiring Soon</AlertTitle>
          <AlertDescription>
            Your subscription expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}. 
            Make sure your payment method is up to date.
          </AlertDescription>
        </Alert>
      )}

      {/* Subscription Details */}
      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-600">Plan:</span>
          <span className="font-medium">{subscription.subscription_plan.display_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Billing:</span>
          <span className="font-medium">
            ${subscription.billing_cycle === 'yearly' 
              ? subscription.subscription_plan.price_yearly 
              : subscription.subscription_plan.price_monthly}
            /{subscription.billing_cycle === 'yearly' ? 'year' : 'month'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Current Period:</span>
          <span className="font-medium">
            {format(new Date(subscription.current_period_start), 'MMM dd')} - {' '}
            {format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}
          </span>
        </div>
        {isStripeSubscription && subscription.stripe_customer_id && (
          <div className="flex justify-between">
            <span className="text-gray-600">Customer ID:</span>
            <span className="font-mono text-xs">
              {subscription.stripe_customer_id.substring(0, 12)}...
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && statusInfo.severity !== 'success' && (
        <div className="flex flex-wrap gap-2">
          {subscription.payment_status === 'past_due' && onRetryPayment && (
            <Button onClick={onRetryPayment} size="sm" variant="default">
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry Payment
            </Button>
          )}
          
          {['past_due', 'incomplete'].includes(subscription.payment_status || '') && onUpdatePaymentMethod && (
            <Button onClick={onUpdatePaymentMethod} size="sm" variant="outline">
              <CreditCard className="h-3 w-3 mr-1" />
              Update Payment Method
            </Button>
          )}
          
          {onContactSupport && (
            <Button onClick={onContactSupport} size="sm" variant="ghost">
              Contact Support
            </Button>
          )}
        </div>
      )}
    </div>
  );
}