"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CustomerBookingFlow from "@/components/customer/CustomerBookingFlow";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Company, Service, Employee } from "@/lib/types/database";

interface CompanyWithServices extends Company {
  services: (Service & { employees: Employee[] })[];
}

interface CustomerBookingPageClientProps {
  initialSearchResults: CompanyWithServices[];
  initialSearchTerm: string;
}

export default function CustomerBookingPageClient({
  initialSearchResults,
  initialSearchTerm,
}: CustomerBookingPageClientProps) {
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const router = useRouter();

  const handleBookingComplete = () => {
    setIsBookingComplete(true);
    // Reload the customer data after successful booking
    setTimeout(() => {
      router.push("/customer");
    }, 2000);
  };

  return (
    <>
      {/* Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/customer")}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Powrót do panelu
        </Button>
      </div>

      {/* Content */}
      {isBookingComplete ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Rezerwacja utworzona!
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Twoja wizyta została pomyślnie zarezerwowana. Przekierowujemy
                Cię do panelu klienta...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <CustomerBookingFlow
          onBookingComplete={handleBookingComplete}
          initialSearchResults={initialSearchResults}
          initialSearchTerm={initialSearchTerm}
        />
      )}
    </>
  );
}
