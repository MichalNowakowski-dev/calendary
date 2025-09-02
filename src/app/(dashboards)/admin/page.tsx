import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, CreditCard } from "lucide-react";
import AdminStatsGrid from "@/components/admin/AdminStatsGrid";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage companies, subscriptions, and system settings
        </p>
      </div>

      {/* Stats overview */}
      <Suspense
        fallback={
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
        }
      >
        <AdminStatsGrid />
      </Suspense>

      {/* Quick actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Manage Companies</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              View and manage all companies, their subscriptions, and settings.
            </p>
            <a
              href="/admin/companies"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              Go to Companies →
            </a>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Subscription Plans</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Manage subscription plans, pricing, and feature access.
            </p>
            <a
              href="/admin/subscriptions"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              Manage Subscriptions →
            </a>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>User Permissions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Configure module access and permissions for companies.
            </p>
            <a
              href="/admin/permissions"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              Manage Permissions →
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
