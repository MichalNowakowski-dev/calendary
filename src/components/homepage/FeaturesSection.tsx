import { Building2, Calendar, Clock, Star, Users, Zap } from "lucide-react";
import FeatureCard from "@/components/FeatureCard";
import { features } from "@/data/homepage";

const iconMap = {
  Calendar: Calendar,
  Clock: Clock,
  Users: Users,
  Zap: Zap,
  Star: Star,
  Building2: Building2,
};

const FeaturesSection = () => {
  const featuresWithIcons = features.map((feature) => {
    const IconComponent = iconMap[feature.icon as keyof typeof iconMap];
    const iconColors = {
      Calendar: "text-blue-500 dark:text-blue-400",
      Clock: "text-green-500 dark:text-green-400",
      Users: "text-purple-500 dark:text-purple-400",
      Zap: "text-yellow-500 dark:text-yellow-400",
      Star: "text-red-500 dark:text-red-400",
      Building2: "text-indigo-500 dark:text-indigo-400",
    };
    
    return {
      ...feature,
      icon: (
        <IconComponent className={`h-10 w-10 ${iconColors[feature.icon as keyof typeof iconColors]} mb-3 mx-auto`} />
      ),
    };
  });

  return (
    <section
      id="features"
      className="px-4 sm:px-6 lg:px-8 py-20 bg-gray-50 dark:bg-gray-950"
      aria-labelledby="features-heading"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h3 
            id="features-heading"
            className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4"
          >
            Wszystko czego potrzebujesz w jednym miejscu
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Kompletne rozwiązanie do zarządzania rezerwacjami i klientami
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresWithIcons.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 