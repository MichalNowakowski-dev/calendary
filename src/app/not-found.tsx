import Link from "next/link";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
            Strona nie została znaleziona
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Przepraszamy, ale strona której szukasz nie istnieje lub została
            przeniesiona.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">Wróć do strony głównej</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Zaloguj się</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
