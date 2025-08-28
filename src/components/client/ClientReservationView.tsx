"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Phone,
  Clock,
  Euro,
  Star,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle,
  Shield,
  Award,
  Heart,
} from "lucide-react";
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
import EnhancedBookingModal from "@/components/booking/EnhancedBookingModal";
import { useAuth } from "@/lib/context/AuthProvider";

interface ClientReservationViewProps {
  company: Company;
  services: (Service & { employees: Employee[] })[];
  selectedService?: (Service & { employees: Employee[] }) | null;
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

export default function ClientReservationView({
  company,
  services,
  selectedService,
}: ClientReservationViewProps) {
  const { user, status } = useAuth();
  const [selectedServiceState, setSelectedServiceState] = useState<
    (Service & { employees: Employee[] }) | null
  >(selectedService || null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleBookService = (service: Service & { employees: Employee[] }) => {
    setSelectedServiceState(service);
    setIsBookingModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedServiceState(null);
    document.body.style.overflow = "auto";
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-gray-500">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Calendar className="h-4 w-4" />
          Rezerwacja online
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Zarezerwuj wizytę w{" "}
          <span className="text-blue-600 dark:text-blue-400">
            {company.name}
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Szybka i wygodna rezerwacja online. Wybierz usługę, termin i gotowe!
        </p>
      </div>

      {/* Company Info Card */}
      <Card className="mb-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-blue-200 dark:border-blue-800 shadow-lg">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {company.name}
                </h2>
                <Badge
                  variant="secondary"
                  className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {industryLabels[company.industry] || company.industry}
                </Badge>
              </div>

              {company.description && (
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                  {company.description}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {(company.address_street || company.address_city) && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span>
                      {[company.address_street, company.address_city]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}

                {company.phone && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span>{company.phone}</span>
                  </div>
                )}
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span>Bezpieczne rezerwacje</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span>Gwarancja jakości</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span>Zadowoleni klienci</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Wybierz usługę
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Dostępne {services.length}{" "}
            {services.length === 1
              ? "usługa"
              : services.length < 5
                ? "usługi"
                : "usług"}
          </p>
        </div>

        {services.length === 0 ? (
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <CardContent className="py-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Brak dostępnych usług
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    W tej chwili nie ma dostępnych usług. Sprawdź ponownie
                    później.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card
                key={service.id}
                className="group hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer"
                onClick={() => handleBookService(service)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-gray-900 dark:text-white">
                        {service.name}
                      </CardTitle>
                      {service.description && (
                        <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
                          {service.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-1 font-bold text-2xl text-blue-600 dark:text-blue-400">
                      <Euro className="h-5 w-5" />
                      <span>{formatPrice(service.price)}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Service details */}
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(service.duration_minutes)}</span>
                      </div>

                      {service.employees && service.employees.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{service.employees.length} specjalistów</span>
                        </div>
                      )}
                    </div>

                    {/* Assigned Employees */}
                    {service.employees && service.employees.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
                          Dostępni specjaliści:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {service.employees
                            .slice(0, 3)
                            .map((employee: Employee) => (
                              <Badge
                                key={employee.id}
                                variant="outline"
                                className="text-xs bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                              >
                                {employee.name}
                              </Badge>
                            ))}
                          {service.employees.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                            >
                              +{service.employees.length - 3} więcej
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Book Button */}
                    <Button
                      className="w-full group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors"
                      size="lg"
                    >
                      <span>Zarezerwuj wizytę</span>
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Why Choose Us Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Dlaczego warto wybrać {company.name}?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Profesjonalizm, jakość i zadowolenie klientów
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Wysoka jakość
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Profesjonalne usługi wykonywane przez doświadczonych
                specjalistów
              </p>
            </CardContent>
          </Card>

          <Card className="text-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Szybka rezerwacja
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Rezerwuj online w kilka minut, bez telefonów i czekania
              </p>
            </CardContent>
          </Card>

          <Card className="text-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Bezpieczeństwo
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Twoje dane są bezpieczne i chronione zgodnie z RODO
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Section */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 dark:text-white">
            Kontakt
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Masz pytania? Skontaktuj się z nami
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {company.phone && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Telefon
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {company.phone}
                  </p>
                </div>
              </div>
            )}

            {(company.address_street || company.address_city) && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Adres
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {[company.address_street, company.address_city]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Booking Modal */}
      {selectedServiceState && (
        <EnhancedBookingModal
          isOpen={isBookingModalOpen}
          onClose={closeBookingModal}
          company={company}
          service={selectedServiceState}
        />
      )}
    </div>
  );
}
