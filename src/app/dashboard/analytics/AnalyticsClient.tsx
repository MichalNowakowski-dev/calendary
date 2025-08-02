import { TrendingUp, DollarSign, Calendar, CheckCircle } from "lucide-react";
import {
  RevenueChart,
  AppointmentStatusChart,
  TopServicesTable,
  TopEmployeesTable,
  CustomerAnalytics,
  TimeAnalytics,
  TimeRangeSelector,
  MetricCard,
} from "./components";
import type { AnalyticsData } from "@/lib/actions/analytics";

interface AnalyticsClientProps {
  analyticsData: AnalyticsData;
  timeRange: string;
}

export default function AnalyticsClient({
  analyticsData,
  timeRange,
}: AnalyticsClientProps) {
  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Przegląd analiz</h2>
        <TimeRangeSelector currentRange={timeRange} />
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Całkowity przychód"
          value={`${analyticsData.totalRevenue.toFixed(2)} zł`}
          change={analyticsData.revenueChange}
          icon={DollarSign}
          description="Przychód całkowity"
        />
        <MetricCard
          title="Liczba wizyt"
          value={analyticsData.totalAppointments.toString()}
          change={analyticsData.appointmentChange}
          icon={Calendar}
          description="Liczba wizyt"
        />
        <MetricCard
          title="Wskaźnik ukończenia"
          value={`${(
            (analyticsData.completedAppointments /
              analyticsData.totalAppointments) *
            100
          ).toFixed(1)}%`}
          change={5.2}
          icon={CheckCircle}
          description="Wskaźnik ukończenia"
        />
        <MetricCard
          title="Średnia wartość wizyty"
          value={`${analyticsData.averageAppointmentValue.toFixed(2)} zł`}
          change={-2.1}
          icon={TrendingUp}
          description="Średnia wartość wizyty"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={analyticsData.monthlyRevenue} />
        <AppointmentStatusChart
          data={analyticsData.appointmentStatusDistribution}
        />
      </div>

      {/* Customer and Time Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerAnalytics
          totalCustomers={analyticsData.totalCustomers}
          newCustomers={analyticsData.newCustomers}
          returningCustomers={analyticsData.returningCustomers}
          averageCustomerValue={analyticsData.averageCustomerValue}
          customerRetentionRate={analyticsData.customerRetentionRate}
        />
        <TimeAnalytics
          peakHours={analyticsData.peakHours}
          busyDays={analyticsData.busyDays}
          averageDuration={analyticsData.averageDuration}
          totalHours={analyticsData.totalHours}
        />
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopServicesTable services={analyticsData.topServices} />
        <TopEmployeesTable employees={analyticsData.topEmployees} />
      </div>
    </div>
  );
}
