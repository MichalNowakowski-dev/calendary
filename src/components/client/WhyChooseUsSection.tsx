import { Star, CheckCircle, Shield } from "lucide-react";
import { Company } from "@/lib/types/database";
import { Card, CardContent } from "@/components/ui/card";

interface WhyChooseUsSectionProps {
  company: Company;
}

export default function WhyChooseUsSection({ company }: WhyChooseUsSectionProps) {
  return (
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
  );
}