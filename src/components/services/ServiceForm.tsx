"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { serviceSchema, type ServiceFormData } from "@/lib/validations/service";
import type { Service } from "@/lib/types/database";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";

interface ServiceFormProps {
  service?: Service | null;
  companyId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ServiceForm({
  service,
  companyId,
  onSuccess,
  onCancel,
}: ServiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name || "",
      description: service?.description || "",
      duration_minutes: service?.duration_minutes || 60,
      price: service?.price || 0,
      active: service?.active ?? true,
    },
  });

  const onSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true);

    try {
      if (service) {
        // Update existing service
        const { error } = await supabase
          .from("services")
          .update({
            name: data.name,
            description: data.description || null,
            duration_minutes: data.duration_minutes,
            price: data.price,
            active: data.active,
          })
          .eq("id", service.id);

        if (error) throw error;
        showToast.success("Usługa została zaktualizowana");
      } else {
        // Create new service
        const { error } = await supabase.from("services").insert({
          company_id: companyId,
          name: data.name,
          description: data.description || null,
          duration_minutes: data.duration_minutes,
          price: data.price,
          active: data.active,
        });

        if (error) throw error;
        showToast.success("Usługa została utworzona");
      }

      // Refresh the page to show updated data
      router.refresh();

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error saving service:", error);
      showToast.error(`Błąd podczas zapisywania usługi: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{service ? "Edytuj usługę" : "Dodaj nową usługę"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa usługi *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="np. Strzyżenie męskie"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Czas trwania (minuty) *</Label>
              <Input
                id="duration_minutes"
                type="number"
                min="15"
                step="15"
                {...form.register("duration_minutes", { valueAsNumber: true })}
                placeholder="60"
              />
              {form.formState.errors.duration_minutes && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.duration_minutes.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Cena (zł) *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              {...form.register("price", { valueAsNumber: true })}
              placeholder="50.00"
            />
            {form.formState.errors.price && (
              <p className="text-sm text-red-600">
                {form.formState.errors.price.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis</Label>
            <textarea
              id="description"
              {...form.register("description")}
              placeholder="Opcjonalny opis usługi..."
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="active"
              {...form.register("active")}
              className="rounded"
            />
            <Label htmlFor="active">Usługa aktywna</Label>
          </div>

          <div className="flex space-x-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                <>{service ? "Zapisz zmiany" : "Dodaj usługę"}</>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Anuluj
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
