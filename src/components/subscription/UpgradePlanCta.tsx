"use client";

import { ArrowUp, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { SubscriptionPlanWithModules } from "@/lib/types/database";

type UpgradePnanCtaProps = {
  nextTierPlan: SubscriptionPlanWithModules;
  currentPlan: SubscriptionPlanWithModules;
};

const UpgradePlanCta = ({ nextTierPlan, currentPlan }: UpgradePnanCtaProps) => {
  return (
    <>
      <Separator />
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-blue-900">Ulepsz swój plan</h4>
            </div>
            <p className="text-sm text-blue-700">
              Przejdź na {nextTierPlan.display_name} i uzyskaj dostęp do więcej
              funkcji
            </p>
            <p className="text-xs text-blue-600">
              Tylko +{nextTierPlan.price_monthly - currentPlan.price_monthly}
              zł/miesiąc więcej
            </p>
          </div>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              // Scroll to available plans section
              const plansSection = document.getElementById("available-plans");
              if (plansSection) {
                plansSection.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            <ArrowUp className="h-4 w-4 mr-1" />
            Zobacz plany
          </Button>
        </div>
      </div>
    </>
  );
};

export default UpgradePlanCta;
