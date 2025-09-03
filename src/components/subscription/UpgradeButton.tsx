"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowUp, CreditCard } from "lucide-react";
import { createUpgradeCheckoutSession } from "@/lib/actions/payments";
import {
  validateUpgradeEligibility,
  getUpgradeBenefits,
  calculateUpgradeCost,
} from "@/lib/utils/subscription-upgrades";
import type { SubscriptionPlanWithModules } from "@/lib/types/database";

interface UpgradeButtonProps {
  plan: SubscriptionPlanWithModules;
  currentPlan: SubscriptionPlanWithModules;
  companyId: string;
  className?: string;
}

export function UpgradeButton({
  plan,
  currentPlan,
  companyId,
  className,
}: UpgradeButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate upgrade eligibility
  const upgradeValidation = validateUpgradeEligibility(
    currentPlan,
    plan,
    billingCycle
  );
  const upgradeBenefits = getUpgradeBenefits(currentPlan, plan);
  const isCurrent = plan.id === currentPlan.id;

  // Don't render if it's not eligible for upgrade or is the current plan
  if (!upgradeValidation.canUpgrade || isCurrent) {
    return null;
  }

  const costCalculation = calculateUpgradeCost(currentPlan, plan, billingCycle);

  const monthlyPrice = plan.price_monthly;
  const yearlyPrice = plan.price_yearly;

  // Calculate savings for yearly billing
  const yearlySavings = costCalculation.savings || 0;

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);

    try {
      // Re-validate with current billing cycle
      const currentValidation = validateUpgradeEligibility(
        currentPlan,
        plan,
        billingCycle
      );
      if (!currentValidation.canUpgrade) {
        throw new Error(currentValidation.reason || "Upgrade not available");
      }

      // Create upgrade checkout session
      const checkoutUrl = await createUpgradeCheckoutSession(
        companyId,
        plan.id,
        billingCycle
      );

      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Upgrade error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to start upgrade process"
      );
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        className={className}
        variant="default"
      >
        <ArrowUp className="h-4 w-4 mr-2" />
        Upgrade Plan
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUp className="h-5 w-5" />
              Upgrade to {plan.display_name}
            </DialogTitle>
            <DialogDescription>
              You&apos;re about to upgrade from {currentPlan.display_name} to{" "}
              {plan.display_name}. Choose your billing cycle below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <label htmlFor="billing-cycle" className="text-sm font-medium">
                Billing Cycle
              </label>
              <Select
                value={billingCycle}
                onValueChange={(value: "monthly" | "yearly") =>
                  setBillingCycle(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">
                    <div className="flex items-center justify-between w-full">
                      <span>Monthly - {monthlyPrice}zł/month</span>
                    </div>
                  </SelectItem>
                  {yearlyPrice > 0 && (
                    <SelectItem value="yearly">
                      <div className="flex items-center justify-between w-full">
                        <span>Yearly - {yearlyPrice}zł/year</span>
                        {yearlySavings > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            Save {yearlySavings}zł
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg space-y-2 dark:bg-gray-700">
              <div className="flex justify-between text-sm">
                <span>Current Plan:</span>
                <span>
                  {currentPlan.display_name} ({costCalculation.currentCost}zł/
                  {billingCycle === "yearly" ? "year" : "month"})
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>New Plan:</span>
                <span>
                  {plan.display_name} ({costCalculation.targetCost}zł/
                  {billingCycle === "yearly" ? "year" : "month"})
                </span>
              </div>
              <div className="flex justify-between text-sm text-green-600 font-medium pt-2 border-t">
                <span>Additional Cost:</span>
                <span>
                  +{costCalculation.additionalCost}zł/
                  {billingCycle === "yearly" ? "year" : "month"}
                </span>
              </div>
            </div>

            {upgradeBenefits.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg dark:bg-gray-700">
                <h4 className="text-sm font-medium mb-2">Upgrade Benefits:</h4>
                <ul className="text-sm space-y-1">
                  {upgradeBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
