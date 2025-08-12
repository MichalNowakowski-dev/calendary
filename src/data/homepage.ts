export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export interface Industry {
  name: string;
}

export interface NavigationLink {
  href: string;
  label: string;
}

export interface FooterLink {
  href: string;
  label: string;
}

export interface FooterLinks {
  product: FooterLink[];
  support: FooterLink[];
  company: FooterLink[];
}

export const features: Feature[] = [
  {
    title: "Inteligentny kalendarz",
    description:
      "Automatyczne zarządzanie harmonogramem pracy i dostępnością pracowników",
    icon: "Calendar",
  },
  {
    title: "Rezerwacje 24/7",
    description: "Klienci mogą rezerwować wizyty o każdej porze dnia i nocy",
    icon: "Clock",
  },
  {
    title: "Zarządzanie klientami",
    description:
      "Pełna historia wizyt, preferencje klientów i automatyczne przypomnienia",
    icon: "Users",
  },
  {
    title: "Automatyzacja",
    description:
      "SMS i email przypomnienia, potwierdzenia rezerwacji i follow-up",
    icon: "Zap",
  },
  {
    title: "Własna strona",
    description: "calendary.pl/twoja-firma - profesjonalna strona rezerwacji",
    icon: "Star",
  },
  {
    title: "Multi-lokalizacje",
    description: "Zarządzaj wieloma punktami usługowymi z jednego panelu",
    icon: "Building2",
  },
];

export const industries: Industry[] = [
  { name: "Warsztaty samochodowe" },
  { name: "Salony piękności" },
  { name: "Fryzjerzy & Barberzy" },
  { name: "Masaż & SPA" },
  { name: "Medycyna estetyczna" },
  { name: "Fitness & trening" },
  { name: "Edukacja" },
  { name: "Weterynarz" },
  { name: "Konsulting" },
  { name: "I wiele innych..." },
];

export const navigationLinks: NavigationLink[] = [
  { href: "#features", label: "Funkcje" },
  { href: "#industries", label: "Branże" },
  { href: "#pricing", label: "Cennik" },
];

export const footerLinks: FooterLinks = {
  product: [
    { href: "#", label: "Funkcje" },
    { href: "#", label: "Cennik" },
    { href: "#", label: "Demo" },
  ],
  support: [
    { href: "#", label: "Pomoc" },
    { href: "#", label: "Kontakt" },
    { href: "#", label: "API" },
  ],
  company: [
    { href: "#", label: "O nas" },
    { href: "#", label: "Blog" },
    { href: "#", label: "Praca" },
  ],
}; 