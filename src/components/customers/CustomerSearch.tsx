import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowUpDown } from "lucide-react";

interface CustomerSearchProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (field: string) => void;
}

export default function CustomerSearch({
  searchTerm,
  onSearch,
  sortBy,
  onSort,
}: CustomerSearchProps) {
  const sortOptions = [
    { value: "name", label: "Nazwa" },
    { value: "email", label: "Email" },
    { value: "appointment_count", label: "Liczba wizyt" },
    { value: "last_visit", label: "Ostatnia wizyta" },
    { value: "total_spent", label: "Wydane" },
    { value: "created_at", label: "Data dodania" },
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj po nazwie, email lub telefonie..."
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={onSort}>
              <SelectTrigger className="w-[180px]">
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

            <button
              onClick={() => onSort(sortBy)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
