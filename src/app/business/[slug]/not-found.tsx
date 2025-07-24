import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Search className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Firma nie znaleziona
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Przepraszamy, ale firma o podanym adresie nie istnieje lub nie jest
            dostępna.
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Wróć do strony głównej
            </Link>
          </Button>

          <p className="text-sm text-gray-500">
            Sprawdź adres URL lub skontaktuj się z firmą bezpośrednio.
          </p>
        </div>
      </div>
    </div>
  );
}
