import {
  Header,
  HeroSection,
  FeaturesSection,
  IndustriesSection,
  CTASection,
  Footer,
} from "@/components/homepage";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header />
      <HeroSection />
      <FeaturesSection />

      {/* Separator line */}
      <div className="h-0.5 w-full max-w-6xl mx-auto bg-gray-200 dark:bg-gray-800"></div>

      <IndustriesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
