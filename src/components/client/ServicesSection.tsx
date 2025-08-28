import { useState, useMemo } from "react";
import { Clock } from "lucide-react";
import { Service, Employee } from "@/lib/types/database";
import { Card, CardContent } from "@/components/ui/card";
import ServiceCard from "./ServiceCard";
import ServiceSearch from "./ServiceSearch";
import Pagination from "@/components/ui/pagination";

interface ServicesSectionProps {
  services: (Service & { employees: Employee[] })[];
  onBookService: (service: Service & { employees: Employee[] }) => void;
}

export default function ServicesSection({ services, onBookService }: ServicesSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 0]);
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 6;

  // Calculate max values for filters
  const maxPrice = useMemo(() => {
    return services.length > 0 ? Math.max(...services.map(s => s.price)) : 1000;
  }, [services]);

  const maxDuration = useMemo(() => {
    return services.length > 0 ? Math.max(...services.map(s => s.duration_minutes)) : 300;
  }, [services]);

  // Initialize price and duration ranges
  useMemo(() => {
    if (priceRange[1] === 0) {
      setPriceRange([0, maxPrice]);
    }
    if (durationRange[1] === 0) {
      setDurationRange([0, maxDuration]);
    }
  }, [maxPrice, maxDuration, priceRange, durationRange]);

  // Filter and sort services
  const filteredAndSortedServices = useMemo(() => {
    const filtered = services.filter(service => {
      const matchesSearch = searchTerm === "" || 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPrice = service.price >= priceRange[0] && service.price <= priceRange[1];
      const matchesDuration = service.duration_minutes >= durationRange[0] && service.duration_minutes <= durationRange[1];
      
      return matchesSearch && matchesPrice && matchesDuration;
    });

    // Sort services
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortBy) {
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "duration_minutes":
          aValue = a.duration_minutes;
          bValue = b.duration_minutes;
          break;
        case "name":
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
      }
      
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [services, searchTerm, priceRange, durationRange, sortBy, sortOrder]);

  // Paginate services
  const totalPages = Math.ceil(filteredAndSortedServices.length / ITEMS_PER_PAGE);
  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedServices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedServices, currentPage]);

  const handleSort = (field: string) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, maxPrice]);
    setDurationRange([0, maxDuration]);
    setSortBy("name");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of services section
    const servicesSection = document.getElementById('services-section');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div id="services-section" className="mb-12">
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

      {/* Search and Filter Component */}
      {services.length > 0 && (
        <ServiceSearch
          searchTerm={searchTerm}
          onSearch={(term) => {
            setSearchTerm(term);
            setCurrentPage(1);
          }}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          priceRange={priceRange}
          onPriceRangeChange={(range) => {
            setPriceRange(range);
            setCurrentPage(1);
          }}
          durationRange={durationRange}
          onDurationRangeChange={(range) => {
            setDurationRange(range);
            setCurrentPage(1);
          }}
          onClearFilters={handleClearFilters}
          totalResults={filteredAndSortedServices.length}
          maxPrice={maxPrice}
          maxDuration={maxDuration}
        />
      )}

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
      ) : filteredAndSortedServices.length === 0 ? (
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Brak wyników
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Nie znaleziono usług pasujących do wybranych kryteriów.
                  Spróbuj zmienić filtry wyszukiwania.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBookService={onBookService}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="mt-8"
            />
          )}
        </>
      )}
    </div>
  );
}