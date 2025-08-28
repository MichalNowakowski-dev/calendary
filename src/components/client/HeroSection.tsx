import { Calendar } from "lucide-react";
import { Company } from "@/lib/types/database";

interface HeroSectionProps {
  company: Company;
}

export default function HeroSection({ company }: HeroSectionProps) {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-4">
        <Calendar className="h-4 w-4" />
        Rezerwacja online
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
        Zarezerwuj wizytę w{" "}
        <span className="text-blue-600 dark:text-blue-400">
          {company.name}
        </span>
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
        Szybka i wygodna rezerwacja online. Wybierz usługę, termin i gotowe!
      </p>
    </div>
  );
}