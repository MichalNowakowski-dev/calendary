import { MapPin, Phone, Shield, Award, Heart } from "lucide-react";
import { Company } from "@/lib/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { industryLabels } from "./constants";

interface CompanyInfoCardProps {
  company: Company;
}

export default function CompanyInfoCard({ company }: CompanyInfoCardProps) {
  return (
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
  );
}