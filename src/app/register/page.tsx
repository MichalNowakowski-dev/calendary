import Link from "next/link";
import RegisterFormSelection from "@/components/registration/RegisterFormSelection";

export default async function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Dołącz do{" "}
            <span className="text-blue-600 dark:text-blue-400">
              Calendary.pl
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Wybierz typ konta i rozpocznij swoją przygodę z systemem rezerwacji
          </p>
        </div>

        <RegisterFormSelection />

        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-300">
            Masz już konto?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Zaloguj się
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
