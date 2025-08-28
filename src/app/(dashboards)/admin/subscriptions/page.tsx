import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Edit } from "lucide-react";
import { getSubscriptionPlans } from "@/lib/actions/subscriptions";

async function SubscriptionPlansTable() {
  try {
    const plans = await getSubscriptionPlans();

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{plan.display_name}</CardTitle>
                <Badge variant={plan.is_active ? "default" : "secondary"}>
                  {plan.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                ${plan.price_monthly}
                <span className="text-sm font-normal text-gray-500">/month</span>
              </div>
              <div className="text-lg text-gray-600">
                ${plan.price_yearly}
                <span className="text-sm font-normal text-gray-500">/year</span>
              </div>
              {plan.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {plan.description}
                </p>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Limits */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Limits:</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Employees:</span>
                    <span className="font-medium">
                      {plan.max_employees === null ? "Unlimited" : plan.max_employees}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Locations:</span>
                    <span className="font-medium">
                      {plan.max_locations === null ? "Unlimited" : plan.max_locations}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modules */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Modules:</h4>
                <div className="space-y-1">
                  {plan.plan_modules.map((module) => (
                    <div key={module.id} className="flex items-center justify-between text-sm">
                      <span className="capitalize">
                        {module.module_name.replace(/_/g, " ")}
                      </span>
                      {module.is_enabled ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional features */}
              {plan.features && Object.keys(plan.features).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Features:</h4>
                  <div className="space-y-1 text-sm">
                    {Object.entries(plan.features).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/_/g, " ")}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full" disabled>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {plans.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No subscription plans found.</p>
              </CardContent>
            </Card>
          </div>
        )}
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

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Subscription Plans
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage subscription plans, pricing, and features
          </p>
        </div>
        <Button disabled>
          Add New Plan
        </Button>
      </div>

      {/* Plans grid */}
      <Suspense
        fallback={
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="animate-pulse space-y-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="animate-pulse space-y-3">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <SubscriptionPlansTable />
      </Suspense>
    </div>
  );
}