import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const HeroSection = () => {
  return (
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
              aria-label="Rozpocznij za darmo - Przejdź do rejestracji"
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
            alt="Calendary.pl Dashboard Preview - Podgląd panelu zarządzania"
            className="w-[450px] h-[450px] md:w-[550px] md:h-[550px] object-cover rounded-full shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 