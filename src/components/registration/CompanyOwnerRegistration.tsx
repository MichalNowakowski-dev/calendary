"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  companyOwnerRegistrationSchema,
  type CompanyOwnerRegistrationFormData,
} from "@/lib/validations/auth";
import { INDUSTRIES } from "@/lib/validations/company";
import { showToast } from "@/lib/toast";
import { registerUser } from "@/lib/auth/utils";

export default function CompanyOwnerRegistration() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<CompanyOwnerRegistrationFormData>({
    resolver: zodResolver(companyOwnerRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      companySlug: "",
      industry: "",
      phone: "",
      address_street: "",
      address_city: "",
      description: "",
    },
  });

  const onSubmit = async (data: CompanyOwnerRegistrationFormData) => {
    setIsLoading(true);

    try {
      // Use the centralized registerUser function
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "company_owner",
        companyData: {
          name: data.companyName,
          slug: data.companySlug,
          description: data.description,
          address_street: data.address_street,
          address_city: data.address_city,
          phone: data.phone,
          industry: data.industry,
        },
      });

      // Show success message
      showToast.success(
        "Rejestracja przebiegła pomyślnie! Sprawdź swoją skrzynkę email, aby potwierdzić konto."
      );

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      showToast.error(`Błąd rejestracji: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Dane osobowe
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imię *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwisko *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Account Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Dane logowania
          </h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hasło *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        {...field}
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Powtórz hasło *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Company Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Dane firmy
          </h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa firmy *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nazwa firmy" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companySlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adres strony</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        calendary.pl/business/
                      </span>
                      <Input {...field} placeholder="nazwa-firmy" />
                    </div>
                  </FormControl>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    To będzie adres Twojej strony rezerwacji
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branża *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz branżę" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry.value} value={industry.value}>
                          {industry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon *</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+48 123 456 789"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address_street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ulica i numer</FormLabel>
                  <FormControl>
                    <Input placeholder="ul. Przykładowa 123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address_city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Miasto</FormLabel>
                  <FormControl>
                    <Input placeholder="Warszawa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis firmy</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Krótki opis Twojej firmy..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Rejestrowanie...
            </>
          ) : (
            "Załóż konto firmowe"
          )}
        </Button>
      </form>
    </Form>
  );
}
