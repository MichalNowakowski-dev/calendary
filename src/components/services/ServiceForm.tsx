"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { serviceSchema, type ServiceFormData } from "@/lib/validations/service";
import type { Service } from "@/lib/types/database";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import {
  createServiceAction,
  updateServiceAction,
} from "@/lib/actions/services";

interface ServiceFormProps {
  service?: Service | null;
  companyId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ServiceForm({
  service,

  onSuccess,
  onCancel,
}: ServiceFormProps) {
  const router = useRouter();

  // Use action state for server actions
  const [createState, createAction, isCreating] = useActionState(
    createServiceAction,
    {
      success: undefined,
      message: "",
      errors: {},
    }
  );

  const [updateState, updateAction, isUpdating] = useActionState(
    updateServiceAction,
    {
      success: undefined,
      message: "",
      errors: {},
    }
  );

  const [isPending, startTransition] = useTransition();

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

  // Handle form submission
  const handleSubmit = async (data: ServiceFormData) => {
    // Create FormData for server action
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("duration_minutes", data.duration_minutes.toString());
    formData.append("price", data.price.toString());
    formData.append("active", data.active ? "on" : "off");

    if (service) {
      // Update existing service
      formData.append("serviceId", service.id);
      startTransition(() => {
        updateAction(formData);
      });
    } else {
      // Create new service
      startTransition(() => {
        createAction(formData);
      });
    }
  };

  // Handle action state changes
  const currentState = service ? updateState : createState;

  useEffect(() => {
    if (currentState.success === true) {
      showToast.success(
        currentState.message || "Operacja zakończona pomyślnie"
      );
      router.refresh();
      if (onSuccess) {
        onSuccess();
      }
    } else if (currentState.success === false) {
      showToast.error(currentState.message || "Wystąpił błąd");
    }
  }, [currentState.success, currentState.message, router, onSuccess]);

  // Handle server-side validation errors
  useEffect(() => {
    if (currentState.errors) {
      Object.entries(currentState.errors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          form.setError(field as keyof ServiceFormData, {
            type: "server",
            message: messages[0],
          });
        }
      });
    }
  }, [currentState.errors, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{service ? "Edytuj usługę" : "Dodaj nową usługę"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? (
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
                disabled={isCreating || isUpdating}
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
