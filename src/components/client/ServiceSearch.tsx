import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown, X, Euro, Clock } from "lucide-react";

interface ServiceSearchProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (field: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  durationRange: [number, number];
  onDurationRangeChange: (range: [number, number]) => void;
  onClearFilters: () => void;
  totalResults: number;
  maxPrice: number;
  maxDuration: number;
}

export default function ServiceSearch({
  searchTerm,
  onSearch,
  sortBy,
  onSort,
  priceRange,
  onPriceRangeChange,
  durationRange,
  onDurationRangeChange,
  onClearFilters,
  totalResults,
  maxPrice,
  maxDuration,
}: ServiceSearchProps) {
  const sortOptions = [
    { value: "name", label: "Nazwa (A-Z)" },
    { value: "price", label: "Cena" },
    { value: "duration_minutes", label: "Czas trwania" },
  ];

  const priceRanges = [
    { value: "0-50", label: "0-50 zł", range: [0, 50] as [number, number] },
    { value: "50-100", label: "50-100 zł", range: [50, 100] as [number, number] },
    { value: "100-200", label: "100-200 zł", range: [100, 200] as [number, number] },
    { value: "200+", label: "200+ zł", range: [200, maxPrice] as [number, number] },
    { value: "all", label: "Wszystkie", range: [0, maxPrice] as [number, number] },
  ];

  const durationRanges = [
    { value: "0-30", label: "Do 30 min", range: [0, 30] as [number, number] },
    { value: "30-60", label: "30-60 min", range: [30, 60] as [number, number] },
    { value: "60-120", label: "1-2 h", range: [60, 120] as [number, number] },
    { value: "120+", label: "2+ h", range: [120, maxDuration] as [number, number] },
    { value: "all", label: "Wszystkie", range: [0, maxDuration] as [number, number] },
  ];

  const hasActiveFilters = searchTerm || 
    priceRange[0] !== 0 || priceRange[1] !== maxPrice ||
    durationRange[0] !== 0 || durationRange[1] !== maxDuration;

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj usług po nazwie lub opisie..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Price Filter */}
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-muted-foreground" />
              <Select
                value={
                  priceRanges.find(
                    (range) =>
                      range.range[0] === priceRange[0] &&
                      range.range[1] === priceRange[1]
                  )?.value || "custom"
                }
                onValueChange={(value) => {
                  const selectedRange = priceRanges.find((r) => r.value === value);
                  if (selectedRange) {
                    onPriceRangeChange(selectedRange.range);
                  }
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Cena" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration Filter */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Select
                value={
                  durationRanges.find(
                    (range) =>
                      range.range[0] === durationRange[0] &&
                      range.range[1] === durationRange[1]
                  )?.value || "custom"
                }
                onValueChange={(value) => {
                  const selectedRange = durationRanges.find((r) => r.value === value);
                  if (selectedRange) {
                    onDurationRangeChange(selectedRange.range);
                  }
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Czas" />
                </SelectTrigger>
                <SelectContent>
                  {durationRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <div className="flex gap-2 ml-auto">
              <Select value={sortBy} onValueChange={onSort}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sortuj według" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onSort(sortBy)}
                className="px-3"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Results Count and Clear Filters */}
          <div className="flex items-center justify-between pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              Znaleziono {totalResults}{" "}
              {totalResults === 1 ? "usługę" : totalResults < 5 ? "usługi" : "usług"}
            </p>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Wyczyść filtry
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}