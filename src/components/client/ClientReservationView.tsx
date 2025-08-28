"use client";

import { useState } from "react";
import { Company, Employee, Service } from "@/lib/types/database";
import EnhancedBookingModal from "@/components/booking/EnhancedBookingModal";
import HeroSection from "./HeroSection";
import CompanyInfoCard from "./CompanyInfoCard";
import ServicesSection from "./ServicesSection";
import WhyChooseUsSection from "./WhyChooseUsSection";
import ContactSection from "./ContactSection";

interface ClientReservationViewProps {
  company: Company;
  services: (Service & { employees: Employee[] })[];
  selectedService?: (Service & { employees: Employee[] }) | null;
}

export default function ClientReservationView({
  company,
  services,
  selectedService,
}: ClientReservationViewProps) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection company={company} />
      <CompanyInfoCard company={company} />
      <ServicesSection services={services} onBookService={handleBookService} />
      <WhyChooseUsSection company={company} />
      <ContactSection company={company} />

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
