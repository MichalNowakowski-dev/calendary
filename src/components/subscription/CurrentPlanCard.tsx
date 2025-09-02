import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Calendar } from "lucide-react";
import { PlanFeatureList } from "./PlanFeatureList";
import { 
  getSubscriptionStatusLabel, 
  getBillingCycleLabel, 
  formatSubscriptionDate,
  getPlanLimitsDisplay,
  isFreePlan,
  getSubscriptionStatusVariant
} from "@/lib/utils/subscription";
import type { SubscriptionPlanWithModules, CompanySubscription } from "@/lib/types/database";

interface CurrentPlanCardProps {
  data: {
    plan: SubscriptionPlanWithModules;
    subscription: CompanySubscription & { subscription_plan?: SubscriptionPlanWithModules };
  };
}

export function CurrentPlanCard({ data }: CurrentPlanCardProps) {
  const { plan, subscription } = data;
  const limits = getPlanLimitsDisplay(plan);
  const isFree = isFreePlan(plan.name);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Plan aktualny
        </CardTitle>
        <CardDescription>
          Szczegóły Twojego obecnego planu subskrypcji
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">{plan.display_name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant={getSubscriptionStatusVariant(subscription.status)}>
                {getSubscriptionStatusLabel(subscription.status)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {isFree ? "Plan darmowy" : `Ważny do: ${formatSubscriptionDate(subscription.current_period_end)}`}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="font-medium">Limity planu</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              {limits.map((limit, index) => (
                <div key={index}>{limit.label}: {limit.value}</div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Następne rozliczenie</h4>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              {isFree ? "Brak rozliczenia" : formatSubscriptionDate(subscription.current_period_end)}
            </div>
            <div className="text-sm text-muted-foreground">
              {isFree ? "Plan darmowy" : `Cykl: ${getBillingCycleLabel(subscription.billing_cycle)}`}
            </div>
          </div>
        </div>

        {plan.features && Object.keys(plan.features).length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium">Funkcje planu:</h4>
              <PlanFeatureList features={plan.features} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}