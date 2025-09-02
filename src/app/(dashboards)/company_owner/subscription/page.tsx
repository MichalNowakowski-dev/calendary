import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { getCompanySubscriptionData } from "@/lib/actions/subscriptions";
import { CurrentPlanCard, AvailablePlansGrid, SubscriptionSkeleton } from "@/components/subscription";

export const dynamic = "force-dynamic";

async function SubscriptionContent() {
  try {
    const subscriptionData = await getCompanySubscriptionData();

    return (
      <div className="space-y-8">
        <CurrentPlanCard data={subscriptionData.current} />
        <AvailablePlansGrid 
          plans={subscriptionData.available} 
          currentPlan={subscriptionData.current.plan} 
        />
      </div>
    );
  } catch (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <X className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground">
              {error instanceof Error && error.message === "Company not found" 
                ? "Nie znaleziono firmy" 
                : "Wystąpił błąd podczas ładowania danych subskrypcji"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
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