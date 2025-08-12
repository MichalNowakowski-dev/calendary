export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ServicesClient from "@/components/services/ServicesClient";
import PageHeading from "@/components/PageHeading";
import { getServicesData } from "@/lib/actions";

// Loading component
function ServicesLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main server component
export default function ServicesPage() {
  const dataPromise = getServicesData();

  return (
    <>
      <PageHeading
        className="mb-6"
        text="Usługi"
        description={`Zarządzaj swoimi usługami`}
      />
      <Suspense fallback={<ServicesLoading />}>
        <ServicesClient dataPromise={dataPromise} />
      </Suspense>
    </>
  );
}
