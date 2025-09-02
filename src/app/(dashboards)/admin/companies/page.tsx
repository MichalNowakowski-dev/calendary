import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllCompaniesWithSubscriptions } from "@/lib/actions/subscriptions";
import { CompanyActionsDropdown } from "./components/CompanyActionsDropdown";
import { format } from "date-fns";
import { CreditCard, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

async function CompaniesTable() {
  try {
    const companies = await getAllCompaniesWithSubscriptions();

    return (
      <div className="space-y-4">
        {companies.map((company) => {
          const subscription = company.company_subscriptions?.[0];
          const plan = subscription?.subscription_plan;

          return (
            <Card key={company.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {company.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {company.slug} • {company.industry}
                        </p>
                        {company.address_city && (
                          <p className="text-sm text-gray-500">
                            {company.address_city}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Payment Status Indicator */}
                    <div className="flex flex-col items-center">
                      {subscription?.payment_status ? (
                        <div className="flex items-center space-x-1">
                          {subscription.payment_status === 'active' && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          {subscription.payment_status === 'past_due' && (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          {subscription.payment_status === 'trialing' && (
                            <CreditCard className="h-4 w-4 text-blue-600" />
                          )}
                          {['canceled', 'unpaid', 'incomplete'].includes(subscription.payment_status) && (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          {['incomplete_expired', 'paused'].includes(subscription.payment_status) && (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                      <span className="text-xs text-gray-500 mt-1">
                        {subscription?.payment_status ? (
                          subscription.payment_status.replace('_', ' ')
                        ) : (
                          'No payment'
                        )}
                      </span>
                    </div>

                    {/* Subscription info */}
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            subscription?.status === "active"
                              ? "default"
                              : subscription?.status === "past_due"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {subscription?.status || "No subscription"}
                        </Badge>
                        {plan && (
                          <Badge variant="outline">{plan.display_name}</Badge>
                        )}
                        {subscription?.stripe_customer_id && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Stripe
                          </Badge>
                        )}
                      </div>
                      {subscription && (
                        <p className="text-xs text-gray-500 mt-1">
                          ${plan?.price_monthly}/month
                        </p>
                      )}
                      {subscription?.current_period_end && (
                        <p className={cn(
                          "text-xs mt-1",
                          new Date(subscription.current_period_end) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
                            ? "text-red-600" 
                            : "text-gray-500"
                        )}>
                          Expires:{" "}
                          {format(
                            new Date(subscription.current_period_end),
                            "MMM dd, yyyy"
                          )}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <CompanyActionsDropdown company={company} />
                  </div>
                </div>

                {/* Company details */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Created:</span>{" "}
                      {format(new Date(company.created_at), "MMM dd, yyyy")}
                    </div>
                    {company.phone && (
                      <div>
                        <span className="font-medium">Phone:</span>{" "}
                        {company.phone}
                      </div>
                    )}
                    {plan?.max_employees && (
                      <div>
                        <span className="font-medium">Employee Limit:</span>{" "}
                        {plan.max_employees === null
                          ? "Unlimited"
                          : plan.max_employees}
                      </div>
                    )}
                    {subscription?.stripe_customer_id && (
                      <div>
                        <span className="font-medium">Stripe ID:</span>{" "}
                        <span className="font-mono text-xs">
                          {subscription.stripe_customer_id.substring(0, 12)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {companies.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No companies found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading companies:", error);
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">
            Error loading companies. Please check your permissions.
          </p>
        </CardContent>
      </Card>
    );
  }
}

export default function AdminCompaniesPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Companies
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage all companies and their subscriptions
          </p>
        </div>
      </div>

      {/* Companies list */}
      <Suspense
        fallback={
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                      </div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                    </div>
                    <div className="h-px bg-gray-200 dark:bg-gray-700" />
                    <div className="flex space-x-8">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <CompaniesTable />
      </Suspense>
    </div>
  );
}
