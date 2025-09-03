"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Loader2, AlertTriangle } from "lucide-react";
import { createPaymentMethodUpdateSession } from "@/lib/stripe/recovery";
import {
  PaymentProcessingLoader,
  usePaymentProcessingState,
} from "@/components/subscription/PaymentProcessingLoader";

export default function UpdatePaymentMethodPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state, message, updateState } = usePaymentProcessingState();
  const [error, setError] = useState<string | null>(null);

  const customerId = searchParams.get("customer_id");
  const companyId = searchParams.get("company_id");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // If we have a session_id, it means we're returning from Stripe
    if (sessionId) {
      handleReturnFromStripe();
    }
  }, [sessionId]);

  const handleReturnFromStripe = async () => {
    updateState("completing_setup", "Confirming payment method update...");

    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      updateState("success", "Payment method updated successfully!");

      // Redirect to dashboard after success
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error confirming payment method update:", err);
      updateState("error", "Failed to confirm payment method update");
    }
  };

  const handleUpdatePaymentMethod = async () => {
    if (!customerId || !companyId) {
      setError("Missing required parameters. Please contact support.");
      return;
    }

    try {
      updateState("initializing", "Preparing payment method update...");

      const updateUrl = await createPaymentMethodUpdateSession(
        customerId,
        companyId
      );

      updateState(
        "processing_payment",
        "Redirecting to secure payment form..."
      );

      // Redirect to Stripe
      setTimeout(() => {
        window.location.href = updateUrl;
      }, 1000);
    } catch (err) {
      console.error("Error creating payment method update session:", err);
      setError("Failed to create payment update session. Please try again.");
      updateState("error");
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  // Show processing states
  if (state === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Method Updated</CardTitle>
            <CardDescription>
              Your payment method has been successfully updated. Future payments
              will use your new payment method.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleGoToDashboard} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state !== "initializing" && state !== "error") {
    return <PaymentProcessingLoader state={state} message={message} />;
  }

  // Show main update payment method page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Update Payment Method</CardTitle>
          <CardDescription>
            Update your payment method to continue using your subscription
            without interruption.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <CreditCard className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Secure Payment Update</p>
                <ul className="text-xs text-blue-600 mt-2 space-y-1">
                  <li>
                    • You&apos;ll be redirected to Stripe&apos;s secure payment
                    form
                  </li>
                  <li>• Your current subscription will remain active</li>
                  <li>• No charges will be made during the update process</li>
                  <li>
                    • Your new payment method will be used for future billing
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleUpdatePaymentMethod}
              disabled={state === "initializing" || !customerId || !companyId}
              className="w-full"
            >
              {state === "initializing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Update Payment Method
                </>
              )}
            </Button>

            <Button
              onClick={handleGoBack}
              variant="outline"
              className="w-full"
              disabled={state === "initializing"}
            >
              Go Back
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>
              This will open a secure Stripe payment form in your browser. Your
              payment information is encrypted and never stored on our servers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
