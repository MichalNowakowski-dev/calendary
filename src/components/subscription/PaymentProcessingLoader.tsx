'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react';

export type PaymentProcessingState = 
  | 'initializing'
  | 'processing_payment'
  | 'activating_subscription'
  | 'completing_setup'
  | 'success'
  | 'error';

export interface PaymentProcessingLoaderProps {
  state: PaymentProcessingState;
  message?: string;
  progress?: number;
}

export function PaymentProcessingLoader({
  state,
  message,
  progress
}: PaymentProcessingLoaderProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (progress !== undefined) {
      setDisplayProgress(progress);
    } else {
      // Auto-calculate progress based on state
      const progressMap: Record<PaymentProcessingState, number> = {
        initializing: 20,
        processing_payment: 40,
        activating_subscription: 70,
        completing_setup: 90,
        success: 100,
        error: 0,
      };
      setDisplayProgress(progressMap[state]);
    }
  }, [state, progress]);

  const getStateInfo = () => {
    switch (state) {
      case 'initializing':
        return {
          icon: <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />,
          title: 'Initializing Payment',
          description: message || 'Setting up your payment session...',
          color: 'blue',
        };
      case 'processing_payment':
        return {
          icon: <CreditCard className="h-6 w-6 text-purple-600 animate-pulse" />,
          title: 'Processing Payment',
          description: message || 'Securely processing your payment with Stripe...',
          color: 'purple',
        };
      case 'activating_subscription':
        return {
          icon: <Loader2 className="h-6 w-6 text-green-600 animate-spin" />,
          title: 'Activating Subscription',
          description: message || 'Activating your subscription and features...',
          color: 'green',
        };
      case 'completing_setup':
        return {
          icon: <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />,
          title: 'Completing Setup',
          description: message || 'Finalizing your account setup...',
          color: 'blue',
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
          title: 'Payment Successful',
          description: message || 'Your subscription has been activated successfully!',
          color: 'green',
        };
      case 'error':
        return {
          icon: <XCircle className="h-6 w-6 text-red-600" />,
          title: 'Payment Error',
          description: message || 'There was an issue processing your payment.',
          color: 'red',
        };
      default:
        return {
          icon: <Loader2 className="h-6 w-6 text-gray-600 animate-spin" />,
          title: 'Processing',
          description: message || 'Please wait...',
          color: 'gray',
        };
    }
  };

  const stateInfo = getStateInfo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className={`mx-auto mb-4 w-16 h-16 bg-${stateInfo.color}-100 rounded-full flex items-center justify-center`}>
            {stateInfo.icon}
          </div>
          <CardTitle className="text-xl">{stateInfo.title}</CardTitle>
          <CardDescription className="text-center">
            {stateInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{displayProgress}%</span>
            </div>
            <Progress value={displayProgress} className="w-full" />
          </div>
          
          {state === 'processing_payment' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <CreditCard className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Secure Payment Processing</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Your payment is being processed securely through Stripe. 
                    Please do not refresh or close this page.
                  </p>
                </div>
              </div>
            </div>
          )}

          {state === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-sm text-red-800">
                <p className="font-medium">What happened?</p>
                <p className="text-xs text-red-600 mt-1">
                  Your payment could not be processed. You have not been charged. 
                  Please try again or contact support if the issue persists.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function usePaymentProcessingState() {
  const [state, setState] = useState<PaymentProcessingState>('initializing');
  const [message, setMessage] = useState<string>();

  const updateState = (newState: PaymentProcessingState, newMessage?: string) => {
    setState(newState);
    if (newMessage) setMessage(newMessage);
  };

  const resetState = () => {
    setState('initializing');
    setMessage(undefined);
  };

  return {
    state,
    message,
    updateState,
    resetState,
  };
}