import Image from "next/image";
import { industries } from "@/data/homepage";

const IndustriesSection = () => {
  return (
    <section
      id="industries"
      className="px-4 sm:px-6 lg:px-8 py-20 bg-white dark:bg-gray-950 flex items-center gap-6 justify-center max-w-7xl mx-auto"
      aria-labelledby="industries-heading"
    >
      <div className="relative">
        <Image
          src="/calendar-home.png"
          alt="Calendary image - Podgląd kalendarza"
          width={500}
          height={500}
          className="object-cover rounded-lg"
        />
      </div>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h3 
            id="industries-heading"
            className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4"
          >
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
              className="text-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700 dark:bg-transparent dark:hover:text-white flex items-center justify-center"
              role="listitem"
            >
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {industry.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustriesSection; 