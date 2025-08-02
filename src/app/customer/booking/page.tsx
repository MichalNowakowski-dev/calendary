import { Suspense } from "react";
import PageHeading from "@/components/PageHeading";
import CustomerBookingPageClient from "./CustomerBookingPageClient";
import { serverDb } from "@/lib/db-server";

export default async function CustomerBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const searchTerm = (await searchParams).service || "";
  const searchResults = await serverDb.getSearchResults(searchTerm);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <PageHeading
              text="Rezerwacja nowej wizyty"
              description="Wyszukaj usługę i zarezerwuj wizytę w wybranej firmie"
            />
          </div>

          {/* Content */}
          <Suspense fallback={<div>Ładowanie...</div>}>
            <CustomerBookingPageClient
              initialSearchResults={searchResults}
              initialSearchTerm={searchTerm}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
