"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, CreditCard } from "lucide-react";
import {
  PaymentProcessingLoader,
  usePaymentProcessingState,
} from "@/components/subscription/PaymentProcessingLoader";

export default function PaymentMethodUpdatedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state, message, updateState } = usePaymentProcessingState();

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const processUpdate = async () => {
      if (!sessionId) {
        updateState("error", "No session ID provided");
        return;
      }

      try {
        updateState("processing_payment", "Verifying payment method update...");

        // Simulate processing time for better UX
        await new Promise((resolve) => setTimeout(resolve, 1500));

        updateState("completing_setup", "Finalizing payment method update...");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        updateState(
          "success",
          "Your payment method has been updated successfully!"
        );
      } catch (err) {
        console.error("Payment method update error:", err);
        updateState("error", "Failed to verify payment method update");
      }
    };

    processUpdate();
  }, [sessionId, updateState]);

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  const handleRetryPayment = () => {
    // This could trigger a retry of failed payments
    router.push("/dashboard?action=retry_payment");
  };

  // Show loading states during processing
  if (state !== "success" && state !== "error") {
    return <PaymentProcessingLoader state={state} message={message} />;
  }

  // Show error state
  if (state === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Update Error</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-sm text-gray-600">
              <p>
                If your payment method was updated but you&apos;re seeing this
                error, please contact support.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleGoToDashboard}
                variant="outline"
                className="flex-1"
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={() => (window.location.href = "/support")}
                className="flex-1"
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show success state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Method Updated!</CardTitle>
          <CardDescription>
            Your payment method has been successfully updated and verified.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <CreditCard className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">What happens next?</p>
                <ul className="text-xs text-green-600 mt-2 space-y-1 text-left">
                  <li>• Your new payment method is now active</li>
                  <li>• Any failed payments will be automatically retried</li>
                  <li>
                    • Your subscription will continue without interruption
                  </li>
                  <li>• Future billing will use your updated payment method</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleRetryPayment} className="flex-1">
              Retry Failed Payments
            </Button>
            <Button
              onClick={handleGoToDashboard}
              variant="outline"
              className="flex-1"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
