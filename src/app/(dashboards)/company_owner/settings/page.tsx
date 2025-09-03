"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Save, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getUserCompanies } from "@/lib/auth/utils";
import { useAuth } from "@/lib/context/AuthProvider";
import {
  companyEditSchema,
  type CompanyEditFormData,
  INDUSTRIES,
} from "@/lib/validations/company";
import type { Company } from "@/lib/types/database";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import PageHeading from "@/components/PageHeading";
import BusinessHoursForm from "@/components/BusinessHoursForm";

export default function CompanySettingsPage() {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const supabase = createClient();

  const form = useForm<CompanyEditFormData>({
    resolver: zodResolver(companyEditSchema),
    defaultValues: {
      name: "",
      slug: "",
      industry: "",
      phone: "",
      address_street: "",
      address_city: "",
      description: "",
    },
  });

  // Generate slug from company name
  const handleCompanyNameChange = (value: string) => {
    form.setValue("name", value);

    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    form.setValue("slug", slug);
  };

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        if (!user) {
          router.push("/login");
          return;
        }

        // Get user's company
        const companies = await getUserCompanies(user.id);
        if (!companies || companies?.length === 0) {
          showToast.error(
            "Nie znaleziono firmy przypisanej do tego użytkownika"
          );
          return;
        }

        const userCompany = companies[0]?.company as unknown as Company;
        setCompany(userCompany);

        // Populate form with current company data
        form.reset({
          name: userCompany.name,
          slug: userCompany.slug,
          industry: userCompany.industry,
          phone: userCompany.phone ?? "",
          address_street: userCompany.address_street ?? "",
          address_city: userCompany.address_city ?? "",
          description: userCompany.description ?? "",
        });
      } catch (error) {
        console.error("Error loading company data:", error);
        showToast.error("Błąd podczas ładowania danych firmy");
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanyData();
  }, [router, form, user]);

  const onSubmit = async (data: CompanyEditFormData) => {
    if (!company) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("companies")
        .update({
          name: data.name,
          slug: data.slug,
          industry: data.industry,
          phone: data.phone || null,
          address_street: data.address_street || null,
          address_city: data.address_city || null,
          description: data.description || null,
        })
        .eq("id", company.id);

      if (error) throw error;

      // Update local state
      setCompany({
        ...company,
        name: data.name,
        slug: data.slug,
        industry: data.industry,
        phone: data.phone || null,
        address_street: data.address_street || null,
        address_city: data.address_city || null,
        description: data.description || null,
      });

      showToast.success("Dane firmy zostały zaktualizowane pomyślnie!");
    } catch (error) {
      console.error("Company update error:", error);
      showToast.error(`Błąd podczas aktualizacji: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Nie znaleziono firmy
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Nie udało się załadować danych firmy.
        </p>
        <Button onClick={() => router.push("/dashboard")}>
          Wróć do dashboardu
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeading
        text="Ustawienia firmy"
        description="Edytuj informacje o swojej firmie"
        className="mb-6"
      />
      <div className="flex flex-col xl:flex-row gap-6 xl:items-start">
        {/* Company form */}
        <div className="flex-1">
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Dane firmy
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nazwa firmy *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) =>
                                handleCompanyNameChange(e.target.value)
                              }
                              placeholder="Nazwa firmy"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adres strony</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm whitespace-nowrap">
                                calendary.pl/business/
                              </span>
                              <Input
                                {...field}
                                className="rounded-l-none"
                                placeholder="nazwa-firmy"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                              {INDUSTRIES.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
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
                              {...field}
                              placeholder="np. +48 123 456 789"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="address_street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adres</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="np. ul. Główna 123"
                            />
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
                            <Input {...field} placeholder="np. Warszawa" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opis firmy</FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            placeholder="Krótki opis Twojej firmy i usług..."
                            rows={4}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>

            <div className="flex justify-end px-6 ">
              <Button
                type="submit"
                disabled={isSaving}
                onClick={form.handleSubmit(onSubmit)}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Zapisywanie...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Zapisz zmiany
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Business Hours Form */}
        <div className="flex-1">
          {company && <BusinessHoursForm companyId={company.id} />}
        </div>
      </div>
    </>
  );
}
