"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, TrendingUp } from "lucide-react";

interface TimeAnalyticsProps {
  peakHours: Array<{ hour: string; appointments: number }>;
  busyDays: Array<{ day: string; appointments: number }>;
  averageDuration: number;
  totalHours: number;
}

export default function TimeAnalytics({
  peakHours,
  busyDays,
  averageDuration,
  totalHours,
}: TimeAnalyticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Peak Hours */}
          <div>
            <h4 className="text-sm font-medium mb-3">Peak Hours</h4>
            <div className="space-y-2">
              {peakHours.map((hour, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {hour.hour}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (hour.appointments /
                              Math.max(
                                ...peakHours.map((h) => h.appointments)
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">
                      {hour.appointments}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Busy Days */}
          <div>
            <h4 className="text-sm font-medium mb-3">Busy Days</h4>
            <div className="space-y-2">
              {busyDays.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {day.day}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (day.appointments /
                              Math.max(
                                ...busyDays.map((d) => d.appointments)
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">
                      {day.appointments}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Duration Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {averageDuration} min
              </div>
              <div className="text-xs text-muted-foreground">Avg. Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {totalHours} h
              </div>
              <div className="text-xs text-muted-foreground">Total Hours</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
