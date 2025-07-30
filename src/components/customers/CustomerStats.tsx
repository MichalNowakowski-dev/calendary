import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, Clock } from "lucide-react";
import type { Customer } from "@/lib/types/database";

interface CustomerWithStats extends Customer {
  appointment_count: number;
  last_visit: string | null;
  total_spent: number;
}

interface CustomerStatsProps {
  customers: CustomerWithStats[];
}

export default function CustomerStats({ customers }: CustomerStatsProps) {
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(
    (c) => c.appointment_count > 0
  ).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);

  const recentCustomers = customers.filter((c) => {
    if (!c.last_visit) return false;
    const lastVisit = new Date(c.last_visit);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return lastVisit > thirtyDaysAgo;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Wszyscy klienci</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCustomers}</div>
          <p className="text-xs text-muted-foreground">
            Łączna liczba klientów
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aktywni klienci</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCustomers}</div>
          <p className="text-xs text-muted-foreground">
            Z co najmniej jedną wizytą
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Przychód</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalRevenue.toLocaleString("pl-PL", {
              style: "currency",
              currency: "PLN",
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Łączny przychód z klientów
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ostatnie wizyty</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentCustomers}</div>
          <p className="text-xs text-muted-foreground">
            Wizyty w ostatnich 30 dniach
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
