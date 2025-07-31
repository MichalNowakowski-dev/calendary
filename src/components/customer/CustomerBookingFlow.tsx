"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Search,
  Building2,
  MapPin,
  User,
  ArrowRight,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import EnhancedBookingModal from "@/components/booking/EnhancedBookingModal";
import { Company, Service, Employee } from "@/lib/types/database";

interface CompanyWithServices extends Company {
  services: (Service & { employees: Employee[] })[];
}

// Validation schemas
const searchSchema = z.object({
  searchTerm: z.string().min(1, "Wprowadź nazwę usługi"),
});

type SearchFormData = z.infer<typeof searchSchema>;

export default function CustomerBookingFlow() {
  const [searchResults, setSearchResults] = useState<CompanyWithServices[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedService, setSelectedService] = useState<
    (Service & { employees: Employee[] }) | null
  >(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const supabase = createClient();

  // Search form
  const searchForm = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      searchTerm: "",
    },
  });

  const handleSearch = async (data: SearchFormData) => {
    setIsSearching(true);
    try {
      // Search for services by name
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select(
          `
          *,
          company:companies(
            id,
            name,
            slug,
            description,
            address_street,
            address_city,
            phone,
            industry
          )
        `
        )
        .ilike("name", `%${data.searchTerm}%`)
        .eq("active", true);

      if (servicesError) throw servicesError;

      // Group services by company
      const companiesMap = new Map<string, CompanyWithServices>();

      servicesData?.forEach((service) => {
        const company = service.company as Company;
        if (!companiesMap.has(company.id)) {
          companiesMap.set(company.id, {
            ...company,
            services: [],
          });
        }
        companiesMap.get(company.id)!.services.push(service);
      });

      setSearchResults(Array.from(companiesMap.values()));
    } catch (error) {
      console.error("Search error:", error);
      showToast.error("Błąd podczas wyszukiwania usług");
    } finally {
      setIsSearching(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedCompany || !selectedService) return;

    setIsBookingModalOpen(true);

    // Load available employees for this service
    try {
      const { error: employeesError } = await supabase
        .from("employee_services")
        .select(
          `
          employee:employees(
            id,
            name,
            visible
          )
        `
        )
        .eq("service_id", selectedService.id)
        .eq("employee.visible", true);

      if (employeesError) throw employeesError;
    } catch (error) {
      console.error("Error loading employees:", error);
    }
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

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Wyszukaj usługę
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...searchForm}>
            <form
              onSubmit={searchForm.handleSubmit(handleSearch)}
              className="space-y-4"
            >
              <FormField
                control={searchForm.control}
                name="searchTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwa usługi</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder="np. strzyżenie, manicure, masaż..."
                          {...field}
                        />
                        <Button type="submit" disabled={isSearching}>
                          {isSearching ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Znalezione firmy ({searchResults.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((company) => (
              <Card
                key={company.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {company.name}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {company.address_city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {company.address_city}
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {company.phone}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium">Dostępne usługi:</h4>
                    {company.services.map((service) => (
                      <div
                        key={service.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => {
                          setSelectedCompany(company);
                          setSelectedService(service);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDuration(service.duration_minutes)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">
                              {formatPrice(service.price)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Selected Service Details */}
      {selectedCompany && selectedService && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Wybrana usługa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedService.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedCompany.name}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(selectedService.price)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDuration(selectedService.duration_minutes)}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {selectedCompany.address_street &&
                    selectedCompany.address_city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {selectedCompany.address_street},{" "}
                        {selectedCompany.address_city}
                      </div>
                    )}
                </div>
                <Button onClick={handleBookAppointment}>
                  Zarezerwuj wizytę
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rezerwacja wizyty</DialogTitle>
          </DialogHeader>

          {selectedCompany && selectedService && (
            <EnhancedBookingModal
              company={selectedCompany}
              service={selectedService}
              onClose={() => setIsBookingModalOpen(false)}
              isOpen={isBookingModalOpen}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
