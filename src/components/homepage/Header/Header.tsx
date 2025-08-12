"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { navigationLinks } from "@/data/homepage";
import { useAuth } from "@/lib/context/AuthProvider";

const Header = () => {
  const { user } = useAuth();

  const handleNavLinkClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="px-4 sm:px-6 lg:px-8 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" aria-label="Calendary.pl - Strona główna">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Calendary.pl
            </h1>
          </Link>
        </div>

        <div className="hidden md:flex space-x-8">
          {navigationLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavLinkClick(link.href)}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
              aria-label={`Przejdź do sekcji ${link.label}`}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex space-x-4">
          {user ? (
            <Link href={`/${user.role}`}>
              <Button>Panel użytkownika</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button>Zaloguj się</Button>
              </Link>
              <Link href="/register">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  aria-label="Zarejestruj się"
                >
                  Zarejestruj się
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
