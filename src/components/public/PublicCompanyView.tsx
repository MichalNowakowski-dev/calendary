"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Euro, MapPin, Phone } from "lucide-react";
import { Company, Employee, Service } from "@/lib/types/database";
import { getCurrentUser } from "@/lib/auth/utils";
import MapLocation from "./MapLocation";
import EnhancedBookingModal from "../booking/EnhancedBookingModal";

interface PublicCompanyViewProps {
  company: Company;
  services: (Service & { employees: Employee[] })[];
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(price);
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  } else if (remainingMinutes === 0) {
    return `${hours} h`;
  } else {
    return `${hours}h ${remainingMinutes}min`;
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
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    checkUserLoginStatus();
  }, []);

  const checkUserLoginStatus = async () => {
    try {
      const user = await getCurrentUser();
      setIsUserLoggedIn(!!user);
    } catch (error) {
      console.error("Error checking user login status:", error);
      setIsUserLoggedIn(false);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleBookService = (service: Service & { employees: Employee[] }) => {
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedService(null);
  };

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-gray-500">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Company Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {company.name}
        </h1>
        {company.description && (
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {company.description}
          </p>
        )}
      </div>

      {/* Services Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Dostępne usługi</h2>
        {services.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Brak dostępnych usług
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card
                key={service.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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
          isUserLoggedIn={isUserLoggedIn}
        />
      )}
    </div>
  );
}
