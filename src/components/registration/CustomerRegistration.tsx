"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  customerRegistrationSchema,
  type CustomerRegistrationFormData,
} from "@/lib/validations/auth";
import { showToast } from "@/lib/toast";
import { registerUser } from "@/lib/auth/utils";

export default function CustomerRegistration() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerRegistrationFormData>({
    resolver: zodResolver(customerRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: CustomerRegistrationFormData) => {
    setIsLoading(true);

    try {
      // Use the centralized registerUser function
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: "customer",
      });

      // Show success message
      showToast.success(
        "Rejestracja przebiegła pomyślnie! Sprawdź swoją skrzynkę email, aby potwierdzić konto."
      );
    } catch (error: any) {
      console.error("Registration error:", error);
      showToast.error(`Błąd rejestracji: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Dane osobowe</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerFirstName">Imię *</Label>
            <Input
              id="customerFirstName"
              type="text"
              {...register("firstName")}
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500 mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="customerLastName">Nazwisko *</Label>
            <Input
              id="customerLastName"
              type="text"
              {...register("lastName")}
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500 mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Dane kontaktowe</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="customerEmail">Email *</Label>
            <Input
              id="customerEmail"
              type="email"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="customerPhone">Telefon</Label>
            <Input
              id="customerPhone"
              type="tel"
              {...register("phone")}
              placeholder="+48 123 456 789"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">
                {errors.phone.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Telefon pomoże firmom skontaktować się z Tobą w razie potrzeby
            </p>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Dane logowania</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="customerPassword">Hasło *</Label>
            <div className="relative">
              <Input
                id="customerPassword"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={errors.password ? "border-red-500" : ""}
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
          </div>
          <div>
            <Label htmlFor="customerConfirmPassword">Powtórz hasło *</Label>
            <div className="relative">
              <Input
                id="customerConfirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">
          Co zyskujesz z kontem klienta?
        </h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Szybsze rezerwacje - zapisane dane kontaktowe</li>
          <li>• Historia wszystkich wizyt w jednym miejscu</li>
          <li>• Automatyczne przypomnienia o nadchodzących wizytach</li>
          <li>• Możliwość dodawania ulubionych firm</li>
          <li>• Łatwe zarządzanie rezerwacjami</li>
        </ul>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Rejestrowanie...
          </>
        ) : (
          "Załóż konto klienta"
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Nie chcesz zakładać konta?{" "}
          <span className="text-blue-600 font-medium">
            Możesz rezerwować także bez rejestracji
          </span>
        </p>
      </div>
    </form>
  );
}
