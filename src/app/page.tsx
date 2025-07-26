import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, Clock, Star, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900">
      {/* Navigation */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Calendary.pl
            </h1>
          </div>
          <div className="hidden md:flex space-x-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              Funkcje
            </a>
            <a
              href="#industries"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              Branże
            </a>
            <a
              href="#pricing"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              Cennik
            </a>
          </div>
          <div className="flex space-x-4">
            <Link href="/login">
              <Button variant="outline">Zaloguj się</Button>
            </Link>
            <Link href="/register">
              <Button>Rozpocznij za darmo</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Nowa platforma rezerwacji online
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Profesjonalny system rezerwacji dla{" "}
            <span className="text-blue-600 dark:text-blue-400">
              Twojej firmy
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Umożliw swoim klientom łatwe rezerwowanie wizyt online. Zautomatyzuj
            zarządzanie kalendarzem i zwiększ przychody swojej firmy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                <Building2 className="mr-2 h-5 w-5" />
                Załóż konto firmowe
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Zobacz demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="px-4 sm:px-6 lg:px-8 py-16 bg-white dark:bg-gray-900"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Wszystko czego potrzebujesz w jednym miejscu
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Kompletne rozwiązanie do zarządzania rezerwacjami i klientami
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                <CardTitle>Inteligentny kalendarz</CardTitle>
                <CardDescription>
                  Automatyczne zarządzanie harmonogramem pracy i dostępnością
                  pracowników
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
                <CardTitle>Rezerwacje 24/7</CardTitle>
                <CardDescription>
                  Klienci mogą rezerwować wizyty o każdej porze dnia i nocy
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
                <CardTitle>Zarządzanie klientami</CardTitle>
                <CardDescription>
                  Pełna historia wizyt, preferencje klientów i automatyczne
                  przypomnienia
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mb-2" />
                <CardTitle>Automatyzacja</CardTitle>
                <CardDescription>
                  SMS i email przypomnienia, potwierdzenia rezerwacji i
                  follow-up
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Star className="h-8 w-8 text-red-600 dark:text-red-400 mb-2" />
                <CardTitle>Własna strona</CardTitle>
                <CardDescription>
                  calendary.pl/twoja-firma - profesjonalna strona rezerwacji
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Building2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-2" />
                <CardTitle>Multi-lokalizacje</CardTitle>
                <CardDescription>
                  Zarządzaj wieloma punktami usługowymi z jednego panelu
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section
        id="industries"
        className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-50 dark:bg-gray-800"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Idealne dla każdej branży
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Dostosowane rozwiązania dla różnych typów usług
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[
              "Warsztaty samochodowe",
              "Salony piękności",
              "Fryzjerzy & Barberzy",
              "Masaż & SPA",
              "Medycyna estetyczna",
              "Fitness & trening",
              "Edukacja",
              "Weterynarz",
              "Konsulting",
              "I wiele innych...",
            ].map((industry, index) => (
              <div
                key={index}
                className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
              >
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {industry}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h3 className="text-3xl font-bold mb-4">
            Gotowy na zwiększenie przychodów?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Dołącz do tysięcy firm, które już korzystają z Calendary.pl
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Rozpocznij 30-dniowy darmowy okres próbny
            </Button>
          </Link>
          <p className="text-sm mt-4 opacity-75">
            Bez zobowiązań • Anuluj w każdej chwili • Pełne wsparcie
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-900 dark:bg-gray-950 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-4">Calendary.pl</h4>
              <p className="text-gray-400">
                Profesjonalny system rezerwacji online dla firm z każdej branży.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Produkt</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Funkcje
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Cennik
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Demo
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Wsparcie</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Pomoc
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Kontakt
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Firma</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    O nas
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Praca
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Calendary.pl. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
