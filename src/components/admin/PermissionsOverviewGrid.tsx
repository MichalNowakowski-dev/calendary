import { Building2, Shield, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { CompanyWithOptionalSubscription } from "@/lib/types/database";

const PermissionsOverviewGrid = ({
  companies,
}: {
  companies: CompanyWithOptionalSubscription[];
}) => {
  const moduleCounts = companies.reduce(
    (acc, company) => {
      const subscription = company.company_subscriptions?.[0];
      if (subscription?.subscription_plan) {
        subscription.subscription_plan.plan_modules?.forEach((module) => {
          if (module.is_enabled) {
            acc[module.module_name] = (acc[module.module_name] || 0) + 1;
          }
        });
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const moduleNames = {
    employee_management: "Employee Management",
    employee_schedules: "Employee Schedules",
    online_payments: "Online Payments",
    analytics: "Analytics",
    multi_location: "Multiple Locations",
    api_access: "API Access",
  };
  return (
    <div className="space-y-6">
      {/* Overview stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Companies
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                companies.filter(
                  (c) => c.company_subscriptions?.[0]?.status === "active"
                ).length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Most Popular Module
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {Object.keys(moduleCounts).length > 0
                ? moduleNames[
                    Object.keys(moduleCounts).reduce((a, b) =>
                      moduleCounts[a] > moduleCounts[b] ? a : b
                    ) as keyof typeof moduleNames
                  ]?.split(" ")[0] || "None"
                : "None"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Modules per Company
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.length > 0
                ? (
                    Object.values(moduleCounts).reduce((a, b) => a + b, 0) /
                    companies.length
                  ).toFixed(1)
                : "0"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module usage breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Module Usage Across Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(moduleNames).map(([key, name]) => {
              const count = moduleCounts[key] || 0;
              const percentage =
                companies.length > 0 ? (count / companies.length) * 100 : 0;

              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-32">
                      <span className="text-sm font-medium">{name}</span>
                    </div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-xs">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{count} companies</Badge>
                    <span className="text-sm text-gray-500 w-12 text-right">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Manage Company Permissions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Override module access for specific companies beyond their plan
              defaults.
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
              <Shield className="h-5 w-5" />
              <span>Plan Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Configure which modules are available for each subscription plan.
            </p>
            <a
              href="/admin/subscriptions"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              Manage Plans →
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PermissionsOverviewGrid;
