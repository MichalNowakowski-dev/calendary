import { MapPin, Phone } from "lucide-react";
import { Company } from "@/lib/types/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ContactSectionProps {
  company: Company;
}

export default function ContactSection({ company }: ContactSectionProps) {
  return (
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
  );
}