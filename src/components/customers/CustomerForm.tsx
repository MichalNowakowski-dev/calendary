"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Mail, Phone } from "lucide-react";
import type {
  Customer,
  CustomerInsert,
  CustomerUpdate,
} from "@/lib/types/database";
import { showToast } from "@/lib/toast";

// Customer validation schema
const customerSchema = {
  name: { required: "Nazwa jest wymagana" },
  email: {
    required: "Email jest wymagany",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Nieprawidłowy format email",
    },
  },
  phone: { required: false },
  notes: { required: false },
};

interface CustomerFormProps {
  customer?: Customer;
  companyId: string;
  onSubmit: (data: CustomerInsert | CustomerUpdate) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CustomerForm({
  customer,
  companyId,
  onSubmit,
  onCancel,
  isLoading = false,
}: CustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: customer?.name || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      notes: "",
    },
  });

  const handleFormSubmit = async (data: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  }) => {
    setIsSubmitting(true);
    try {
      const customerData = {
        ...data,
        company_id: companyId,
        phone: data.phone || null,
        notes: data.notes || null,
      };

      await onSubmit(customerData);
      showToast.success(
        customer
          ? "Klient został zaktualizowany pomyślnie!"
          : "Klient został dodany pomyślnie!"
      );
    } catch (error) {
      console.error("Customer form error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Wystąpił nieznany błąd.";
      showToast.error(`Błąd: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {customer ? "Edytuj klienta" : "Dodaj nowego klienta"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nazwa *</Label>
            <Input
              id="name"
              {...register("name", customerSchema.name)}
              placeholder="Imię i nazwisko klienta"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                {...register("email", customerSchema.email)}
                placeholder="email@example.com"
                className="pl-10"
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                {...register("phone", customerSchema.phone)}
                placeholder="+48 123 456 789"
                className="pl-10"
                disabled={isSubmitting}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notatki</Label>
            <Textarea
              id="notes"
              {...register("notes", customerSchema.notes)}
              placeholder="Dodatkowe informacje o kliencie..."
              rows={3}
              disabled={isSubmitting}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {customer ? "Aktualizowanie..." : "Dodawanie..."}
                </>
              ) : customer ? (
                "Aktualizuj"
              ) : (
                "Dodaj klienta"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
