"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface RevenueData {
  month: string;
  revenue: number;
  appointments: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Trend przychodów
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.month}</span>
                <span className="text-muted-foreground">
                  {item.revenue.toFixed(2)} zł
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(item.revenue / maxRevenue) * 100}%`,
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {item.appointments} wizyt
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
