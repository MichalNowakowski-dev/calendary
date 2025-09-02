import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import PlanHeader from "./PlanHeader";
import PlanLimits from "./PlanLimits";
import PlanModules from "./PlanModules";
import PlanFeatures from "./PlanFeatures";

interface PlanModule {
  id: string;
  module_name: string;
  is_enabled: boolean;
}

interface SubscriptionPlan {
  id: string;
  display_name: string;
  is_active: boolean;
  price_monthly: number;
  price_yearly: number;
  description?: string | null;
  max_employees: number | null;
  max_locations: number | null;
  features: Record<string, string> | null;
  plan_modules: PlanModule[];
}

interface PlanCardProps {
  plan: SubscriptionPlan;
}

export default function PlanCard({ plan }: PlanCardProps) {
  return (
    <Card className="relative">
      <PlanHeader
        displayName={plan.display_name}
        isActive={plan.is_active}
        priceMonthly={plan.price_monthly}
        priceYearly={plan.price_yearly}
        description={plan.description}
      />

      <CardContent className="space-y-4">
        <PlanLimits
          maxEmployees={plan.max_employees}
          maxLocations={plan.max_locations}
        />

        <PlanModules modules={plan.plan_modules} />

        <PlanFeatures features={plan.features} />

        <div className="pt-4 border-t">
          <Button variant="outline" className="w-full" disabled>
            <Edit className="h-4 w-4 mr-2" />
            Edit Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
