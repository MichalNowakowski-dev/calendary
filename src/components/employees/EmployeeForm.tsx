"use client";

import { useActionState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { showToast } from "@/lib/toast";
import { createEmployee, updateEmployee } from "@/lib/actions/employees";
import {
  employeeFormSchema,
  type EmployeeFormData,
} from "@/lib/validations/employee";
import type { EmployeeWithDetails, Service } from "@/lib/types/database";
import React, { useTransition } from "react";

interface EmployeeFormProps {
  services: Service[];
  editingEmployee: EmployeeWithDetails | null;
  companyId: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function EmployeeForm({
  services,
  editingEmployee,
  companyId,
  onCancel,
  onSuccess,
}: EmployeeFormProps) {
  const [_, startTransition] = useTransition();
  const [state, formAction, isPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      const rawData = {
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        email: formData.get("email") as string,
        phone_number: formData.get("phone_number") as string,
        visible: formData.get("visible") === "true",
        selectedServices: formData.getAll("selectedServices") as string[],
      };

      if (editingEmployee) {
        return await updateEmployee(editingEmployee.id, rawData);
      } else {
        return await createEmployee({
          ...rawData,
          companyId,
        });
      }
    },
    null
  );

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      first_name: editingEmployee?.name?.split(" ")[0] || "",
      last_name: editingEmployee?.name?.split(" ").slice(1).join(" ") || "",
      email: editingEmployee?.email || "",
      phone_number: editingEmployee?.phone_number || "",
      visible: editingEmployee?.visible ?? true,
      selectedServices: editingEmployee?.services.map((s) => s.id) || [],
    },
  });

  // Handle server-side errors
  React.useEffect(() => {
    if (state?.success === false) {
      if (state.errors) {
        // Set server-side errors to form
        Object.entries(state.errors).forEach(([field, messages]) => {
          form.setError(field as keyof EmployeeFormData, {
            type: "server",
            message: messages[0],
          });
        });
      } else {
        showToast.error(state.message);
      }
    } else if (state?.success === true) {
      showToast.success(state.message);
      form.reset();
      onSuccess?.();
    }
  }, [state, form, onSuccess]);

  const handleSubmit = (data: EmployeeFormData) => {
    const formData = new FormData();
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("email", data.email);
    formData.append("phone_number", data.phone_number || "");
    formData.append("visible", data.visible.toString());
    data.selectedServices.forEach((serviceId) => {
      formData.append("selectedServices", serviceId);
    });

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingEmployee ? "Edytuj pracownika" : "Dodaj nowego pracownika"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imię *</FormLabel>
                    <FormControl>
                      <Input placeholder="Jan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwisko *</FormLabel>
                    <FormControl>
                      <Input placeholder="Kowalski" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="jan.kowalski@example.com"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Pracownik otrzyma email z zaproszeniem do systemu
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numer telefonu</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+48 123 456 789"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Opcjonalny numer telefonu pracownika
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Widoczny dla klientów</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="selectedServices"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">
                      Przypisane usługi
                    </FormLabel>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Wybierz usługi, które może świadczyć ten pracownik
                    </p>
                  </div>
                  {services.map((service) => (
                    <FormField
                      key={service.id}
                      control={form.control}
                      name="selectedServices"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={service.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(service.id)}
                                onCheckedChange={(checked: boolean) => {
                                  return checked
                                    ? field.onChange([
                                        ...field.value,
                                        service.id,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== service.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {service.name}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-2">
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Przetwarzanie..."
                  : editingEmployee
                    ? "Zapisz zmiany"
                    : "Dodaj pracownika"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Anuluj
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
