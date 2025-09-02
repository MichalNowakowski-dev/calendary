import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlanFeatureList } from "./PlanFeatureList";
import { isCurrentPlan } from "@/lib/utils/subscription";
import type { SubscriptionPlanWithModules } from "@/lib/types/database";

interface AvailablePlansGridProps {
  plans: SubscriptionPlanWithModules[];
  currentPlan: SubscriptionPlanWithModules;
}

export function AvailablePlansGrid({ plans, currentPlan }: AvailablePlansGridProps) {
  if (plans.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Dostępne plany</h2>
      <p className="text-muted-foreground">
        Skontaktuj się z administratorem w celu zmiany planu subskrypcji
      </p>
      
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = isCurrentPlan(currentPlan.id, plan.id);
          
          return (
            <Card key={plan.id} className="relative">
              {isCurrent && (
                <Badge className="absolute -top-2 left-4" variant="default">
                  Obecny plan
                </Badge>
              )}
              <CardHeader>
                <CardTitle>{plan.display_name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price_monthly}zł</span>
                    <span className="text-muted-foreground">/miesiąc</span>
                  </div>
                  {plan.price_yearly > 0 && (
                    <div className="text-sm text-muted-foreground">
                      lub {plan.price_yearly}zł/rok
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Funkcje:</h4>
                  <PlanFeatureList features={plan.features || {}} className="space-y-1" />
                </div>

                {plan.max_employees && (
                  <div className="text-sm text-muted-foreground">
                    Do {plan.max_employees} pracowników
                  </div>
                )}

                <Button 
                  variant="secondary"
                  className="w-full"
                  disabled
                >
                  {isCurrent ? "Obecny plan" : "Skontaktuj się z administratorem"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}