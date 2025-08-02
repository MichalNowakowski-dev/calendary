"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { debounce } from "lodash";
import {
  Search,
  Building2,
  MapPin,
  User,
  ArrowRight,
  CheckCircle,
  Loader2,
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
  searchTerm: z.string(),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface CustomerBookingFlowProps {
  onBookingComplete: () => void;
  initialSearchResults: CompanyWithServices[];
  initialSearchTerm: string;
}

export default function CustomerBookingFlow({
  onBookingComplete,
  initialSearchResults,
  initialSearchTerm,
}: CustomerBookingFlowProps) {
  const [searchResults, setSearchResults] =
    useState<CompanyWithServices[]>(initialSearchResults);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedService, setSelectedService] = useState<
    (Service & { employees: Employee[] }) | null
  >(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const supabase = createClient();

  // Search form
  const searchForm = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      searchTerm: initialSearchTerm,
    },
  });

  // Update form when initialSearchTerm changes
  useEffect(() => {
    searchForm.setValue("searchTerm", initialSearchTerm);
  }, [initialSearchTerm, searchForm]);

  // Update search results when initialSearchResults changes
  useEffect(() => {
    setSearchResults(initialSearchResults);
    setIsSearching(false); // Stop loading when results arrive
  }, [initialSearchResults]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      if (searchTerm.trim()) {
        setIsSearching(true); // Start loading
        const params = new URLSearchParams(searchParams.toString());
        params.set("service", searchTerm);
        router.push(`/customer/booking?${params.toString()}`);
      } else {
        // Clear search results if search term is empty
        setIsSearching(false);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("service");
        router.push(`/customer/booking?${params.toString()}`);
      }
    }, 500), // 500ms delay
    [router, searchParams]
  );

  // Handle search input change
  const handleSearchChange = (value: string) => {
    if (value.trim()) {
      setIsSearching(true); // Show spinner immediately when user starts typing
    } else {
      setIsSearching(false);
    }
    debouncedSearch(value);
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
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Search className="h-5 w-5" />
            Wyszukaj usługę
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...searchForm}>
            <form className="space-y-4">
              <FormField
                control={searchForm.control}
                name="searchTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwa usługi</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="np. strzyżenie, manicure, masaż..."
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleSearchChange(e.target.value);
                          }}
                          className="w-full pr-10"
                        />
                        {isSearching && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          </div>
                        )}
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

      {/* Loading State */}
      {isSearching && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mb-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Wyszukiwanie usług...
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Proszę czekać, wyszukujemy dostępne usługi.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {!isSearching && searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg sm:text-xl font-semibold">
            Znalezione firmy ({searchResults.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {searchResults.map((company) => (
              <Card
                key={company.id}
                className="cursor-pointer hover:shadow-md transition-shadow h-full"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Building2 className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{company.name}</span>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {company.address_city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{company.address_city}</span>
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{company.phone}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm sm:text-base">
                      Dostępne usługi:
                    </h4>
                    {company.services.map((service) => (
                      <div
                        key={service.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedCompany(company);
                          setSelectedService(service);
                        }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {service.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDuration(service.duration_minutes)}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
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

      {/* No Results Message */}
      {!isSearching && initialSearchTerm && searchResults.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mb-4">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Nie znaleziono usług
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Spróbuj wyszukać inną usługę lub sprawdź pisownię.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Service Details */}
      {selectedCompany && selectedService && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              Wybrana usługa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold truncate">
                    {selectedService.name}
                  </h3>
                  <p className="text-muted-foreground truncate">
                    {selectedCompany.name}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {formatPrice(selectedService.price)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDuration(selectedService.duration_minutes)}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  {selectedCompany.address_street &&
                    selectedCompany.address_city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {selectedCompany.address_street},{" "}
                          {selectedCompany.address_city}
                        </span>
                      </div>
                    )}
                </div>
                <Button
                  onClick={handleBookAppointment}
                  className="w-full sm:w-auto"
                >
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
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Rezerwacja wizyty</DialogTitle>
          </DialogHeader>

          {selectedCompany && selectedService && (
            <EnhancedBookingModal
              isUserLoggedIn={true}
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
