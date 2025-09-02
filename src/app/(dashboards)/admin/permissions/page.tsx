import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import PermissionsOverviewGrid from "@/components/admin/PermissionsOverviewGrid";
import { getAllCompaniesWithSubscriptions } from "@/lib/actions/subscriptions";

export default async function AdminPermissionsPage() {
  const companies = await getAllCompaniesWithSubscriptions();

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Permissions Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Monitor module usage and manage access permissions across all
          companies
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        }
      >
        <PermissionsOverviewGrid companies={companies} />
      </Suspense>
    </div>
  );
}
