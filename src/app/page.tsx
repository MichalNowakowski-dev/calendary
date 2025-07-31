import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, Clock, Star, Users, Zap } from "lucide-react";
import FeatureCard from "@/components/FeatureCard";
import Image from "next/image";
import { redirect } from "next/navigation";
import { serverAuth } from "@/lib/auth/server";

export default async function Home() {
  const features = [
    {
      title: "Inteligentny kalendarz",
      description:
        "Automatyczne zarządzanie harmonogramem pracy i dostępnością pracowników",
      icon: (
        <Calendar className="h-10 w-10 text-blue-500 dark:text-blue-400 mb-3 mx-auto" />
      ),
    },
    {
      title: "Rezerwacje 24/7",
      description: "Klienci mogą rezerwować wizyty o każdej porze dnia i nocy",
      icon: (
        <Clock className="h-10 w-10 text-green-500 dark:text-green-400 mb-3 mx-auto" />
      ),
    },
    {
      title: "Zarządzanie klientami",
      description:
        "Pełna historia wizyt, preferencje klientów i automatyczne przypomnienia",
      icon: (
        <Users className="h-10 w-10 text-purple-500 dark:text-purple-400 mb-3 mx-auto" />
      ),
    },
    {
      title: "Automatyzacja",
      description:
        "SMS i email przypomnienia, potwierdzenia rezerwacji i follow-up",
      icon: (
        <Zap className="h-10 w-10 text-yellow-500 dark:text-yellow-400 mb-3 mx-auto" />
      ),
    },
    {
      title: "Własna strona",
      description: "calendary.pl/twoja-firma - profesjonalna strona rezerwacji",
      icon: (
        <Star className="h-10 w-10 text-red-500 dark:text-red-400 mb-3 mx-auto" />
      ),
    },
    {
      title: "Multi-lokalizacje",
      description: "Zarządzaj wieloma punktami usługowymi z jednego panelu",
      icon: (
        <Building2 className="h-10 w-10 text-indigo-500 dark:text-indigo-400 mb-3 mx-auto" />
      ),
    },
  ];

  const industries = [
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
  ];

  // Should check if user is logged in and redirect to specific dashboard based on user role
  const user = await serverAuth.getCurrentUser();
  if (user?.role === "owner") {
    redirect("/dashboard");
  } else if (user?.role === "employee") {
    redirect("/employee");
  } else if (user?.role === "customer") {
    redirect("/customer");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Navigation */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
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
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                Zarejestruj się
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-[calc(100vh-64px)] bg-white dark:bg-gray-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight mb-6">
              Bezpłatny system
              <br className="hidden md:inline" />
              do rezerwacji online
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl lg:mx-0 mx-auto">
              Planuj rezerwacje, ulepszaj swoje usługi i promuj swoją
              działalność. Rezerwacje online 24/7 i przypomnienia dla klientów.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="text-lg px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                Rozpocznij za darmo
              </Button>
            </Link>
          </div>

          {/* Right Image Section */}
          <div className="relative flex justify-center lg:justify-end">
            <Image
              src="/hero-image.png"
              priority
              width={500}
              height={500}
              alt="Calendary.pl Dashboard Preview"
              className="w-[450px] h-[450px] md:w-[550px] md:h-[550px] object-cover rounded-full shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="px-4 sm:px-6 lg:px-8 py-20 bg-gray-50 dark:bg-gray-950"
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
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* separator line */}
      <div className="h-0.5 w-full max-w-6xl mx-auto bg-gray-200 dark:bg-gray-800"></div>

      {/* Industries Section */}
      <section
        id="industries"
        className="px-4 sm:px-6 lg:px-8 py-20 bg-white dark:bg-gray-950 flex items-center gap-6 justify-center max-w-7xl mx-auto"
      >
        <div className=" relative">
          <Image
            src="/calendar-home.png"
            alt="Calendary image"
            width={500}
            height={500}
            className="object-cover rounded-lg"
          />
        </div>
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
            {industries.map((industry, index) => (
              <div
                key={index}
                className="text-center p-4 bg-white  rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700 dark:bg-transparent dark:hover:text-white flex items-center justify-center "
              >
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 ">
                  {industry}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-blue-600 dark:bg-blue-900 text-white text-center shadow-inner">
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
      <footer className="px-4 sm:px-6 lg:px-8 py-12 bg-gray-900 dark:bg-gray-950 text-gray-300 border-t border-gray-800 dark:border-gray-700">
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
