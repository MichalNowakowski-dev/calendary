import { Metadata } from "next";
import ReservationDemo from "@/components/client/ReservationDemo";

export const metadata: Metadata = {
  title: "Demo Rezerwacji | Calendary",
  description: "Zobacz jak działa nasz system rezerwacji online",
};

export default function ReservationDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ReservationDemo />
    </div>
  );
}
