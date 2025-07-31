"use client";

import { useState } from "react";
import { MapPin, Phone, Clock, Euro } from "lucide-react";
import { Company, Employee, Service } from "@/lib/types/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EnhancedBookingModal from "../booking/EnhancedBookingModal";
import MapLocation from "./MapLocation";

interface PublicCompanyViewProps {
  company: Company;
  services: (Service & { employees: Employee[] })[];
}

const industryLabels: Record<string, string> = {
  automotive: "Motoryzacja",
  beauty: "Uroda",
  barbershop: "Fryzjerstwo",
  massage: "Masaż",
  spa: "SPA",
  medical: "Medycyna",
  fitness: "Fitness",
  education: "Edukacja",
  veterinary: "Weterynaria",
  other: "Inne",
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(price);
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}min`;
  }
};

export default function PublicCompanyView({
  company,
  services,
}: PublicCompanyViewProps) {
  const [selectedService, setSelectedService] = useState<
    (Service & { employees: Employee[] }) | null
  >(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleBookService = (service: Service & { employees: Employee[] }) => {
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedService(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Company Header */}
      <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {company.name}
              </h1>
              <Badge variant="secondary" className="text-sm">
                {industryLabels[company.industry] || company.industry}
              </Badge>
            </div>

            {company.description && (
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                {company.description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {(company.address_street || company.address_city) && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-5 w-5" />
                  <span>
                    {[company.address_street, company.address_city]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}

              {company.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-5 w-5" />
                  <span>{company.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nasze usługi</h2>
          <span className="text-gray-500">
            {services.length}{" "}
            {services.length === 1
              ? "usługa"
              : services.length < 5
                ? "usługi"
                : "usług"}
          </span>
        </div>

        {services.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 text-lg">
                Brak dostępnych usług w tej chwili.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card
                key={service.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      {service.description && (
                        <CardDescription className="mt-2">
                          {service.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {/* Price and Duration */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          {formatDuration(service.duration_minutes)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 font-semibold text-lg">
                        <Euro className="h-4 w-4" />
                        <span>{formatPrice(service.price)}</span>
                      </div>
                    </div>

                    {/* Assigned Employees */}
                    {service.employees && service.employees.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          Dostępni specjaliści:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {service.employees.map((employee: Employee) => (
                            <Badge
                              key={employee.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {employee.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Book Button */}
                    <Button
                      className="w-full mt-4"
                      size="sm"
                      onClick={() => handleBookService(service)}
                    >
                      Zarezerwuj wizytę
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Location Section */}
      {(company.address_street || company.address_city) && (
        <div className="mt-12">
          <MapLocation
            address_street={company.address_street || undefined}
            address_city={company.address_city || undefined}
            businessName={company.name}
            phone={company.phone || undefined}
          />
        </div>
      )}

      {/* Contact Section */}
      <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-xl font-semibold mb-4">Kontakt</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {company.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Telefon</p>
                <p className="text-gray-600">{company.phone}</p>
              </div>
            </div>
          )}

          {(company.address_street || company.address_city) && (
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Adres</p>
                <p className="text-gray-600">
                  {[company.address_street, company.address_city]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedService && (
        <EnhancedBookingModal
          isOpen={isBookingModalOpen}
          onClose={closeBookingModal}
          company={company}
          service={selectedService}
        />
      )}
    </div>
  );
}
