import { Card, CardContent } from "@/components/ui/card";
import { getSubscriptionPlans } from "@/lib/actions/subscriptions";
import PlanCard from "./PlanCard";

export default async function SubscriptionPlansGrid() {
  try {
    const plans = await getSubscriptionPlans();

    if (plans.length === 0) {
      return (
        <div className="col-span-full">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No subscription plans found.</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    );
  } catch (error) {
    console.error("Error loading subscription plans:", error);
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">
            Error loading subscription plans. Please check your permissions.
          </p>
        </CardContent>
      </Card>
    );
  }
}