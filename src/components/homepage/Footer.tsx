import { footerLinks } from "@/data/homepage";

const Footer = () => {
  return (
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
            <ul className="space-y-2 text-gray-400" role="list">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="hover:text-white transition-colors"
                    aria-label={link.label}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold mb-3">Wsparcie</h5>
            <ul className="space-y-2 text-gray-400" role="list">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="hover:text-white transition-colors"
                    aria-label={link.label}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold mb-3">Firma</h5>
            <ul className="space-y-2 text-gray-400" role="list">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="hover:text-white transition-colors"
                    aria-label={link.label}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Calendary.pl. Wszystkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 