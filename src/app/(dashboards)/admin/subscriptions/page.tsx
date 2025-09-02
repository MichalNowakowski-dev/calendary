import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SubscriptionPlansGrid from "@/components/admin/SubscriptionPlansGrid";

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
        <SubscriptionPlansGrid />
      </Suspense>
    </div>
  );
}