"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { getSubscriptionPlans } from "@/lib/actions/subscriptions";
import { createCheckoutSession } from "@/lib/actions/payments";
import type {
  Company,
  CompanySubscription,
  CompanyWithOptionalSubscription,
  SubscriptionPlan,
  SubscriptionPlanWithModules,
} from "@/lib/types/database";
import { useToast } from "@/hooks/use-toast";

interface CompanyWithSubscriptionData extends Company {
  company_subscriptions?: Array<
    CompanySubscription & {
      subscription_plan: SubscriptionPlan;
    }
  >;
}

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: CompanyWithOptionalSubscription;
}

export function SubscriptionDialog({
  open,
  onOpenChange,
  company,
}: SubscriptionDialogProps) {
  const [plans, setPlans] = useState<SubscriptionPlanWithModules[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const currentSubscription = company.company_subscriptions?.[0];
  const currentPlanId = currentSubscription?.subscription_plan?.id;

  useEffect(() => {
    if (open) {
      loadPlans();
    }
  }, [open]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const planData = await getSubscriptionPlans();
      setPlans(planData);
    } catch (error) {
      console.error("Error loading plans:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (
    plan: SubscriptionPlanWithModules,
    billingCycle: "monthly" | "yearly"
  ) => {
    try {
      setUpdating(plan.id);

      // Determine the price ID based on billing cycle
      const priceId =
        billingCycle === "yearly"
          ? plan.stripe_price_id_yearly
          : plan.stripe_price_id_monthly;

      if (!priceId) {
        toast({
          title: "Error",
          description: `${billingCycle === "yearly" ? "Yearly" : "Monthly"} billing not available for this plan`,
          variant: "destructive",
        });
        setUpdating(null);
        return;
      }

      toast({
        title: "Redirecting to payment",
        description: "Please wait while we prepare your secure checkout...",
      });

      // Create Stripe checkout session
      const checkoutUrl = await createCheckoutSession(
        priceId,
        company.id,
        plan.id
      );

      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Payment Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      setUpdating(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Subscription - {company.name}</DialogTitle>
          <DialogDescription>
            Change the subscription plan for this company
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            {plans.map((plan) => {
              const isCurrentPlan = plan.id === currentPlanId;
              const isUpdating = updating === plan.id;

              return (
                <Card
                  key={plan.id}
                  className={`relative ${isCurrentPlan ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : ""}`}
                >
                  {isCurrentPlan && (
                    <Badge className="absolute -top-2 left-4 bg-blue-600">
                      Current Plan
                    </Badge>
                  )}

                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{plan.display_name}</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          ${plan.price_monthly}
                        </div>
                        <div className="text-sm text-gray-500">/month</div>
                        {plan.price_yearly && (
                          <div className="text-xs text-green-600">
                            Save ${plan.price_monthly * 12 - plan.price_yearly}{" "}
                            yearly
                          </div>
                        )}
                      </div>
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {plan.description}
                    </p>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">Features:</h4>
                        <ul className="space-y-1 text-sm">
                          {plan.plan_modules.map((module) => (
                            <li
                              key={module.id}
                              className="flex items-center space-x-2"
                            >
                              <Check
                                className={`h-4 w-4 ${
                                  module.is_enabled
                                    ? "text-green-600"
                                    : "text-gray-400"
                                }`}
                              />
                              <span
                                className={
                                  module.is_enabled
                                    ? ""
                                    : "line-through text-gray-400"
                                }
                              >
                                {module.module_name
                                  .replace("_", " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1 text-sm">
                        <div>
                          <strong>Employees:</strong>{" "}
                          {plan.max_employees === null
                            ? "Unlimited"
                            : plan.max_employees}
                        </div>
                        <div>
                          <strong>Locations:</strong>{" "}
                          {plan.max_locations === null
                            ? "Unlimited"
                            : plan.max_locations}
                        </div>
                      </div>

                      {isCurrentPlan ? (
                        <Button disabled className="w-full" variant="secondary">
                          Current Plan
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          {/* Monthly Payment Button */}
                          {plan.stripe_price_id_monthly ? (
                            <Button
                              onClick={() => handleSelectPlan(plan, "monthly")}
                              disabled={isUpdating}
                              className="w-full"
                              variant="default"
                            >
                              {isUpdating ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Redirecting...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Pay Monthly - ${plan.price_monthly}
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              disabled
                              className="w-full"
                              variant="outline"
                            >
                              Monthly billing not available
                            </Button>
                          )}

                          {/* Yearly Payment Button */}
                          {plan.stripe_price_id_yearly ? (
                            <Button
                              onClick={() => handleSelectPlan(plan, "yearly")}
                              disabled={isUpdating}
                              className="w-full"
                              variant="outline"
                            >
                              {isUpdating ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Redirecting...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Pay Yearly - ${plan.price_yearly}
                                </>
                              )}
                            </Button>
                          ) : (
                            <div className="text-xs text-gray-500 text-center py-2">
                              Yearly billing coming soon
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
