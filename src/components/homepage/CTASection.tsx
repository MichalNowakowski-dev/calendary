import Link from "next/link";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section 
      className="px-4 sm:px-6 lg:px-8 py-20 bg-blue-600 dark:bg-blue-900 text-white text-center shadow-inner"
      aria-labelledby="cta-heading"
    >
      <div className="max-w-4xl mx-auto text-center text-white">
        <h3 
          id="cta-heading"
          className="text-3xl font-bold mb-4"
        >
          Gotowy na zwiększenie przychodów?
        </h3>
        <p className="text-xl mb-8 opacity-90">
          Dołącz do tysięcy firm, które już korzystają z Calendary.pl
        </p>
        <Link href="/register">
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 py-3"
            aria-label="Rozpocznij 30-dniowy darmowy okres próbny"
          >
            Rozpocznij 30-dniowy darmowy okres próbny
          </Button>
        </Link>
        <p className="text-sm mt-4 opacity-75">
          Bez zobowiązań • Anuluj w każdej chwili • Pełne wsparcie
        </p>
      </div>
    </section>
  );
};

export default CTASection; 