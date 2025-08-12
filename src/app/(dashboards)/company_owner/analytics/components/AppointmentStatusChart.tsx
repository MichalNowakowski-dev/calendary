"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, CheckCircle, Clock, XCircle } from "lucide-react";

interface AppointmentStatusData {
  booked: number;
  completed: number;
  cancelled: number;
}

interface AppointmentStatusChartProps {
  data: AppointmentStatusData;
}

export default function AppointmentStatusChart({
  data,
}: AppointmentStatusChartProps) {
  const total = data.booked + data.completed + data.cancelled;

  const getPercentage = (value: number) => {
    return total > 0 ? (value / total) * 100 : 0;
  };

  const statusItems = [
    {
      key: "completed",
      label: "Ukończone",
      value: data.completed,
      color: "bg-green-500",
      icon: CheckCircle,
    },
    {
      key: "booked",
      label: "Zarezerwowane",
      value: data.booked,
      color: "bg-blue-500",
      icon: Clock,
    },
    {
      key: "cancelled",
      label: "Anulowane",
      value: data.cancelled,
      color: "bg-red-500",
      icon: XCircle,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Status wizyt
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusItems.map((item) => {
            const Icon = item.icon;
            const percentage = getPercentage(item.value);

            return (
              <div key={item.key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.value}</span>
                  <span className="text-xs text-muted-foreground">
                    ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })}

          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Razem</span>
              <span className="font-medium">{total}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
