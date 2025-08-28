import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const Pricing = () => {
  const pricingTiers = [
    {
      name: "Starter",
      price: "0",
      period: "miesiąc",
      description: "Idealny dla małych firm rozpoczynających działalność",
      features: [
        "Do 5 pracowników",
        "Podstawowe zarządzanie terminami",
        "Kalendarz online",
        "Powiadomienia email",
        "Podstawowe wsparcie",
      ],
      popular: false,
      cta: "Rozpocznij za darmo",
      href: "/register?role=company_owner",
    },
    {
      name: "Professional",
      price: "99",
      period: "miesiąc",
      description: "Dla rozwijających się firm z większym zespołem",
      features: [
        "Do 20 pracowników",
        "Zaawansowane zarządzanie terminami",
        "Integracje z kalendarzami",
        "Powiadomienia SMS",
        "Raporty i analityka",
        "Priorytetowe wsparcie",
        "Własne godziny pracy",
        "Rezerwacje online",
      ],
      popular: true,
      cta: "Rozpocznij za darmo",
      href: "/register",
    },
    {
      name: "Enterprise",
      price: "299",
      period: "miesiąc",
      description: "Dla dużych firm z zaawansowanymi potrzebami",
      features: [
        "Nieograniczona liczba pracowników",
        "Wszystkie funkcje Professional",
        "API i integracje",
        "Dedykowany opiekun klienta",
        "Szkolenia zespołu",
        "Własne logo i branding",
        "Zaawansowane raporty",
        "Wielu lokalizacji",
      ],
      popular: false,
      cta: "Skontaktuj się z nami",
      href: "/contact",
    },
  ];

  return (
    <section
      className="px-4 sm:px-6 lg:px-8 py-20 bg-white dark:bg-gray-900"
      aria-labelledby="pricing-heading"
      id="pricing"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2
            id="pricing-heading"
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Proste i przejrzyste cenniki
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Wybierz plan idealny dla Twojej firmy. Wszystkie plany obejmują
            30-dniowy darmowy okres próbny.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative ${
                tier.popular
                  ? "border-2 border-green-500 shadow-xl scale-105"
                  : "border border-gray-200 dark:border-gray-700"
              }`}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white">
                  Najpopularniejszy
                </Badge>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tier.name}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {tier.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {tier.price === "0" ? "Za darmo" : `${tier.price} zł`}
                  </span>
                  {tier.price !== "0" && (
                    <span className="text-gray-600 dark:text-gray-300">
                      /{tier.period}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex flex-col h-full">
                <div className="flex-grow">
                  <ul className="space-y-4 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  className={`w-full ${
                    tier.popular
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                  }`}
                  size="lg"
                >
                  <Link href={tier.href}>{tier.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Potrzebujesz indywidualnego rozwiązania?
          </p>
          <Button variant="outline" size="lg">
            <Link href="/contact">Skontaktuj się z naszym zespołem</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
