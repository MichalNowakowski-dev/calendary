"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

const translateAuthError = (errorMessage: string): string => {
  const errorTranslations: Record<string, string> = {
    "Invalid login credentials": "Nieprawidłowe dane logowania",
    "Email not confirmed": "Email nie został potwierdzony",
    "Too many requests": "Zbyt wiele prób logowania",
    "User not found": "Użytkownik nie został znaleziony",
    "Invalid email": "Nieprawidłowy adres email",
    "Invalid password": "Nieprawidłowe hasło",
    "Email already registered": "Email jest już zarejestrowany",
    "Password too short": "Hasło jest za krótkie",
    "Network error": "Błąd połączenia sieciowego",
    "Server error": "Błąd serwera",
    "Authentication failed": "Uwierzytelnienie nie powiodło się",
    "Account locked": "Konto zostało zablokowane",
    "Account disabled": "Konto zostało wyłączone",
    "Session expired": "Sesja wygasła",
    "Access denied": "Dostęp zabroniony",
  };

  // Check for exact matches first
  if (errorTranslations[errorMessage]) {
    return errorTranslations[errorMessage];
  }

  // Check for partial matches (case insensitive)
  const lowerErrorMessage = errorMessage.toLowerCase();
  for (const [englishError, polishError] of Object.entries(errorTranslations)) {
    if (lowerErrorMessage.includes(englishError.toLowerCase())) {
      return polishError;
    }
  }

  // Return default message if no translation found
  return "Wystąpił błąd podczas logowania";
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string>("");
  const router = useRouter();

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError(""); // Clear previous auth errors

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      if (authData.user) {
        // Check for redirect parameter from middleware
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get("redirectTo");

        // Get user metadata to determine default redirect
        const userRole = authData.user.user_metadata?.role;

        if (redirectTo) {
          router.push(redirectTo);
        } else if (userRole === "company_owner") {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const translatedError = translateAuthError(error.message || "");
      setAuthError(translatedError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            <span className="text-blue-600">Calendary.pl</span>
          </h1>
          <p className="text-lg text-gray-600">Zaloguj się do swojego konta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Logowanie</CardTitle>
            <CardDescription className="text-center">
              Wprowadź swoje dane logowania
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className={
                      errors.email || authError ? "border-red-500" : ""
                    }
                    placeholder="twoj@email.pl"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Hasło</Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Zapomniałeś hasła?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      className={
                        errors.password || authError ? "border-red-500" : ""
                      }
                      placeholder="Wprowadź hasło"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.password.message}
                    </p>
                  )}
                  {authError && (
                    <p className="text-sm text-red-500 mt-1">{authError}</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logowanie...
                  </>
                ) : (
                  "Zaloguj się"
                )}
              </Button>
            </form>

            <div className="mt-6">
              <Separator />
              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Nie masz jeszcze konta?{" "}
                  <Link
                    href="/register"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Zarejestruj się
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link href="/" className="text-gray-600 hover:text-gray-700">
            ← Wróć do strony głównej
          </Link>
        </div>
      </div>
    </div>
  );
}
