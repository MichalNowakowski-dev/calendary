"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, UserCheck, DollarSign } from "lucide-react";

interface CustomerAnalyticsProps {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageCustomerValue: number;
  customerRetentionRate: number;
}

export default function CustomerAnalytics({
  totalCustomers,
  newCustomers,
  returningCustomers,
  averageCustomerValue,
  customerRetentionRate,
}: CustomerAnalyticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Customer Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">New Customers</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {newCustomers}
            </div>
            <div className="text-xs text-muted-foreground">
              {((newCustomers / totalCustomers) * 100).toFixed(1)}% of total
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Returning</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {returningCustomers}
            </div>
            <div className="text-xs text-muted-foreground">
              {((returningCustomers / totalCustomers) * 100).toFixed(1)}% of
              total
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Avg. Customer Value</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {averageCustomerValue.toFixed(2)} zł
            </div>
            <div className="text-xs text-muted-foreground">Per customer</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Retention Rate</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {customerRetentionRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              Customer retention
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
