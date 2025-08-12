import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 shadow-2xl rounded-2xl overflow-hidden">
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-white">
          <h1 className="text-5xl font-bold mb-4">Calendary.pl</h1>
          <p className="text-xl text-center">
            Zarządzaj swoimi rezerwacjami w jednym miejscu.
          </p>
        </div>

        <div className="bg-card p-8 sm:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              Witaj z powrotem!
            </h2>
            <p className="text-muted-foreground">
              Zaloguj się, aby kontynuować.
            </p>
          </div>

          <LoginForm />

          <div className="mt-6">
            <Separator />
            <div className="text-center mt-6">
              <p className="text-muted-foreground">
                Nie masz jeszcze konta?{" "}
                <Link
                  href="/register"
                  className="text-primary hover:underline font-medium"
                >
                  Zarejestruj się
                </Link>
              </p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              ← Wróć do strony głównej
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
