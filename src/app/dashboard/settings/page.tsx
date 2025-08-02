"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Building2, Save, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser, getUserCompanies } from "@/lib/auth/utils";
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
        const user = await getCurrentUser();
        if (!user) {
          router.push("/login");
          return;
        }

        // Get user's company
        const companies = await getUserCompanies(user.id);
        if (companies.length === 0) {
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
  }, [router, form]);

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
    <div className="space-y-6">
      {/* Page header */}
      <PageHeading
        text="Ustawienia firmy"
        description="Edytuj informacje o swojej firmie"
      />

      {/* Company form */}
      <Card>
        <CardHeader>
          <CardTitle>Dane firmy</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="pb-2" htmlFor="name">
                  Nazwa firmy *
                </Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  onChange={(e) => handleCompanyNameChange(e.target.value)}
                  placeholder="Nazwa firmy"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="pb-2" htmlFor="slug">
                  Adres strony
                </Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                    calendary.pl/business/
                  </span>
                  <Input
                    id="slug"
                    {...form.register("slug")}
                    className="rounded-l-none"
                    placeholder="nazwa-firmy"
                  />
                </div>
                {form.formState.errors.slug && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.slug.message}
                  </p>
                )}
              </div>
            </div>

            {/* Industry and phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="industry">Branża *</Label>
                <Select
                  value={form.watch("industry")}
                  onValueChange={(value) => form.setValue("industry", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz branżę" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.industry && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.industry.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  placeholder="np. +48 123 456 789"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address_street">Adres</Label>
              <Input
                id="address_street"
                {...form.register("address_street")}
                placeholder="np. ul. Główna 123"
              />
              {form.formState.errors.address_street && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.address_street.message}
                </p>
              )}
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="address_city">Miasto</Label>
              <Input
                id="address_city"
                {...form.register("address_city")}
                placeholder="np. Warszawa"
              />
              {form.formState.errors.address_city && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.address_city.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Opis firmy</Label>
              <textarea
                id="description"
                {...form.register("description")}
                placeholder="Krótki opis Twojej firmy i usług..."
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* Submit button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
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
          </form>
        </CardContent>
      </Card>

      {/* Business Hours Form */}
      {company && <BusinessHoursForm companyId={company.id} />}
    </div>
  );
}
