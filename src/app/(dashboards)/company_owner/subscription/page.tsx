import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/server";
import { serverAuth } from "@/lib/auth/server";
import { CreditCard, Calendar, Check, X } from "lucide-react";
import type { 
  Company, 
  SubscriptionPlan, 
  CompanySubscription,
  SubscriptionPlanWithModules
} from "@/lib/types/database";

export const dynamic = "force-dynamic";

async function SubscriptionContent() {
  const supabase = createClient();
  const user = await serverAuth.getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Get user's company
    const { data: companyUser, error: companyUserError } = await supabase
      .from("company_users")
      .select(`
        company:companies (
          id,
          name,
          plan_id
        )
      `)
      .eq("user_id", user.id)
      .single();

    if (companyUserError || !companyUser?.company) {
      return (
        <div className="flex items-center justify-center h-96">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Nie znaleziono firmy</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    const company = companyUser.company;

    // Get free plan (the default plan for all companies)
    const { data: freePlan, error: freePlanError } = await supabase
      .from("subscription_plans")
      .select(`
        *,
        plan_modules (*)
      `)
      .eq("name", "free")
      .eq("is_active", true)
      .single();

    if (freePlanError || !freePlan) {
      throw new Error("Free plan not found");
    }

    // Get current subscription (may not exist, defaulting to free plan)
    const { data: subscription } = await supabase
      .from("company_subscriptions")
      .select(`
        *,
        subscription_plan:subscription_plans (
          *,
          plan_modules (*)
        )
      `)
      .eq("company_id", company.id)
      .single();

    // Get available plans (excluding free plan since it's the default)
    const { data: availablePlans, error: plansError } = await supabase
      .from("subscription_plans")
      .select(`
        *,
        plan_modules (*)
      `)
      .eq("is_active", true)
      .neq("name", "free")
      .order("price_monthly", { ascending: true });

    if (plansError) throw plansError;

    // Use free plan as default if no subscription exists
    const currentPlan = subscription?.subscription_plan || freePlan;
    const currentSubscription = subscription || {
      status: "active" as const,
      billing_cycle: "monthly" as const,
      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      subscription_plan: freePlan
    };

    return (
      <div className="space-y-8">
        {/* Current Plan Section */}
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
                <h3 className="text-2xl font-bold">{currentPlan.display_name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={currentSubscription.status === "active" ? "default" : "secondary"}>
                    {currentSubscription.status === "active" ? "Aktywny" : 
                     currentSubscription.status === "cancelled" ? "Anulowany" :
                     currentSubscription.status === "past_due" ? "Zaległy" : "Nieaktywny"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {currentPlan.name === "free" ? "Plan darmowy" : 
                    `Ważny do: ${new Date(currentSubscription.current_period_end).toLocaleDateString("pl-PL")}`}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Limity planu</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {currentPlan.max_employees && (
                    <div>Maksymalnie pracowników: {currentPlan.max_employees}</div>
                  )}
                  {currentPlan.max_locations && (
                    <div>Maksymalnie lokalizacji: {currentPlan.max_locations}</div>
                  )}
                  {!currentPlan.max_employees && !currentPlan.max_locations && (
                    <div>Bez limitów</div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Następne rozliczenie</h4>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {currentPlan.name === "free" ? "Brak rozliczenia" : 
                   new Date(currentSubscription.current_period_end).toLocaleDateString("pl-PL")}
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentPlan.name === "free" ? "Plan darmowy" : 
                   `Cykl: ${currentSubscription.billing_cycle === "monthly" ? "miesięczny" : "roczny"}`}
                </div>
              </div>
            </div>

            {/* Plan Features */}
            {currentPlan.features && Object.keys(currentPlan.features).length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Funkcje planu:</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {Object.entries(currentPlan.features).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {value}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Available Plans Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Dostępne plany</h2>
          <p className="text-muted-foreground">
            Skontaktuj się z administratorem w celu zmiany planu subskrypcji
          </p>
          
          <div className="grid gap-6 md:grid-cols-3">
            {availablePlans.map((plan) => (
              <Card key={plan.id} className="relative">
                {currentPlan.id === plan.id && (
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
                    <div className="space-y-1">
                      {Object.entries(plan.features || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          {value}
                        </div>
                      ))}
                    </div>
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
                    {currentPlan.id === plan.id 
                      ? "Obecny plan" 
                      : "Skontaktuj się z administratorem"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <X className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground">
              Wystąpił błąd podczas ładowania danych subskrypcji
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}

function SubscriptionSkeleton() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-24" />
                <Separator />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Subskrypcja</h1>
        <p className="text-muted-foreground mt-2">
          Zarządzaj planem subskrypcji swojej firmy
        </p>
      </div>

      <Suspense fallback={<SubscriptionSkeleton />}>
        <SubscriptionContent />
      </Suspense>
    </div>
  );
}