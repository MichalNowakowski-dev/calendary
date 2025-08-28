import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, CreditCard, Activity } from "lucide-react";
import { getAllCompaniesWithSubscriptions } from "@/lib/actions/subscriptions";

async function AdminStats() {
  try {
    const companies = await getAllCompaniesWithSubscriptions();

    const stats = {
      totalCompanies: companies.length,
      activeSubscriptions: companies.filter(
        (c) => c.company_subscriptions?.[0]?.status === "active"
      ).length,
      totalRevenue: companies.reduce((sum, c) => {
        const subscription = c.company_subscriptions?.[0];
        if (subscription?.status === "active") {
          return sum + (subscription.subscription_plan?.price_monthly || 0);
        }
        return sum;
      }, 0),
      planDistribution: companies.reduce(
        (acc, c) => {
          const planName =
            c.company_subscriptions?.[0]?.subscription_plan?.name || "none";
          acc[planName] = (acc[planName] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Companies
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeSubscriptions}
            </div>
            <p className="text-xs text-muted-foreground">
              {(
                (stats.activeSubscriptions / stats.totalCompanies) *
                100
              ).toFixed(1)}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Plan Distribution
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(stats.planDistribution).map(([plan, count]) => (
                <div key={plan} className="flex justify-between text-sm">
                  <span className="capitalize">{plan}</span>
                  <span>5</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Error loading admin stats:", error);
    return (
      <div className="text-center text-red-600 p-4">
        Error loading statistics. Please check your permissions.
      </div>
    );
  }
}

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
        <AdminStats />
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
