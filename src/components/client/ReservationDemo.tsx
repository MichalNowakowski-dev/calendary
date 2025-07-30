"use client";

import { useState } from "react";
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
  Play,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EnhancedBookingModal from "@/components/public/EnhancedBookingModal";
import { Employee, Service } from "@/lib/types/database";

// Mock data for demo
const mockCompany = {
  id: "demo-company",
  name: "Salon Urody Bella",
  slug: "salon-urody-bella",
  industry: "beauty",
  description:
    "Profesjonalny salon kosmetyczny oferujący najwyższej jakości usługi fryzjerskie, kosmetyczne i spa. Nasz zespół doświadczonych specjalistów zadba o Twój wygląd i samopoczucie.",
  address_street: "ul. Kwiatowa 15",
  address_city: "00-001 Warszawa",
  phone: "+48 123 456 789",
  email: "kontakt@salonbella.pl",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockServices = [
  {
    id: "service-1",
    name: "Strzyżenie damskie",
    description: "Profesjonalne strzyżenie z myciem i stylizacją",
    duration_minutes: 60,
    price: 80,
    active: true,
    company_id: "demo-company",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    employees: [
      {
        id: "emp-1",
        company_id: "demo-company",
        user_id: null,
        name: "Anna Kowalska",
        visible: true,
        phone_number: "+48 123 456 789",
        email: "anna.kowalska@salonbella.pl",
        auth_user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        id: "emp-2",
        company_id: "demo-company",
        user_id: null,
        name: "Maria Nowak",
        visible: true,
        phone_number: "+48 987 654 321",
        email: "maria.nowak@salonbella.pl",
        auth_user_id: null,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "service-2",
    name: "Koloryzacja",
    description: "Pełna koloryzacja z produktami premium",
    duration_minutes: 120,
    price: 200,
    active: true,
    company_id: "demo-company",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    employees: [
      {
        id: "emp-1",
        company_id: "demo-company",
        user_id: null,
        name: "Anna Kowalska",
        visible: true,
        phone_number: "+48 123 456 789",
        email: "anna.kowalska@salonbella.pl",
        auth_user_id: null,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "service-3",
    name: "Masaż relaksacyjny",
    description: "60-minutowy masaż całego ciała",
    duration_minutes: 60,
    price: 150,
    active: true,
    company_id: "demo-company",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    employees: [
      {
        id: "emp-3",
        company_id: "demo-company",
        user_id: null,
        name: "Piotr Wiśniewski",
        visible: true,
        phone_number: "+48 555 123 456",
        email: "piotr.wisniewski@salonbella.pl",
        auth_user_id: null,
        created_at: new Date().toISOString(),
      },
    ],
  },
];

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

export default function ReservationDemo() {
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
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              🎯 Demo Systemu Rezerwacji
            </h1>
            <p className="text-blue-100 dark:text-blue-200">
              To jest demonstracja systemu rezerwacji Calendary. Wypróbuj
              funkcjonalność!
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 dark:bg-white/10 px-4 py-2 rounded-full">
            <Play className="h-4 w-4" />
            <span className="text-sm font-medium">DEMO</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Calendar className="h-4 w-4" />
          Rezerwacja online
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Zarezerwuj wizytę w{" "}
          <span className="text-blue-600 dark:text-blue-400">
            {mockCompany.name}
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
                  {mockCompany.name}
                </h2>
                <Badge
                  variant="secondary"
                  className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {industryLabels[mockCompany.industry] || mockCompany.industry}
                </Badge>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                {mockCompany.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>
                    {mockCompany.address_street}, {mockCompany.address_city}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>{mockCompany.phone}</span>
                </div>
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
            Dostępne {mockServices.length} usługi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockServices.map((service) => (
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
                    <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
                      {service.description}
                    </CardDescription>
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

                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{service.employees.length} specjalistów</span>
                    </div>
                  </div>

                  {/* Assigned Employees */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
                      Dostępni specjaliści:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {service.employees &&
                        Array.isArray(service.employees) &&
                        service.employees.map((employee) => (
                          <Badge
                            key={employee.id}
                            variant="outline"
                            className="text-xs bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                          >
                            {employee.name}
                          </Badge>
                        ))}
                    </div>
                  </div>

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
      </div>

      {/* Features Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Dlaczego warto wybrać {mockCompany.name}?
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
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Telefon
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {mockCompany.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Adres
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {mockCompany.address_street}, {mockCompany.address_city}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Modal */}
      {selectedService && (
        <EnhancedBookingModal
          isOpen={isBookingModalOpen}
          onClose={closeBookingModal}
          company={mockCompany}
          service={selectedService as Service & { employees: Employee[] }}
        />
      )}
    </div>
  );
}
