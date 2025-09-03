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
import { CheckCircle } from "lucide-react";
import { handlePaymentSuccess } from "@/lib/actions/payments";
import {
  PaymentProcessingLoader,
  usePaymentProcessingState,
} from "@/components/subscription/PaymentProcessingLoader";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state, message, updateState } = usePaymentProcessingState();

  const sessionId = searchParams.get("session_id");
  const isUpgrade = searchParams.get("upgrade") === "true";

  useEffect(() => {
    const processPayment = async () => {
      if (!sessionId) {
        updateState("error", "No session ID provided");
        return;
      }

      try {
        updateState("processing_payment", "Confirming payment with Stripe...");

        // Simulate some processing time for better UX
        await new Promise((resolve) => setTimeout(resolve, 1000));

        updateState(
          "activating_subscription",
          isUpgrade
            ? "Upgrading your subscription..."
            : "Activating your subscription..."
        );
        await handlePaymentSuccess(sessionId);

        updateState("completing_setup", "Finalizing your account...");
        await new Promise((resolve) => setTimeout(resolve, 800));

        updateState(
          "success",
          isUpgrade
            ? "Your plan has been upgraded successfully!"
            : "Your subscription has been activated successfully!"
        );
      } catch (err) {
        console.error("Payment processing error:", err);
        updateState(
          "error",
          "Failed to process payment confirmation. Please contact support if you were charged."
        );
      }
    };

    processPayment();
  }, []);

  const handleGoToDashboard = () => {
    router.push("/company_owner");
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
              <CheckCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Payment Error</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-sm text-gray-600">
              <p>
                If you were charged and are seeing this error, please contact
                support immediately.
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
          <CardTitle className="text-2xl">
            {isUpgrade ? "Upgrade Successful!" : "Payment Successful!"}
          </CardTitle>
          <CardDescription>
            {isUpgrade
              ? "Your plan has been upgraded successfully. You now have access to all the new features in your upgraded plan."
              : "Your subscription has been activated successfully. You now have access to all the features included in your plan."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-sm text-gray-600">
            <p>Your subscription is now active and you can:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• Access your dashboard</li>
              <li>• Manage your team and services</li>
              <li>• Start accepting bookings</li>
              <li>• Use all premium features</li>
            </ul>
          </div>
          <Button onClick={handleGoToDashboard} className="w-full">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
