import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Loader2 } from "lucide-react";
import type { Customer, CustomerUpdate } from "@/lib/types/database";
import { updateCustomer } from "@/lib/actions/customers";
import { showToast } from "@/lib/toast";

const customerEditSchema = z.object({
  name: z.string().min(1, "Imię jest wymagane"),
  email: z.string().email("Nieprawidłowy adres email"),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerEditFormData = z.infer<typeof customerEditSchema>;

interface CustomerEditModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CustomerEditModal({
  customer,
  isOpen,
  onClose,
  onSuccess,
}: CustomerEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerEditFormData>({
    resolver: zodResolver(customerEditSchema),
  });

  useEffect(() => {
    if (isOpen && customer) {
      reset({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        notes: customer.notes || "",
      });
    }
  }, [isOpen, customer, reset]);

  const handleFormSubmit = async (data: CustomerEditFormData) => {
    if (!customer) return;

    setIsLoading(true);
    try {
      const updateData: CustomerUpdate = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        notes: data.notes || null,
      };

      await updateCustomer(customer.id, updateData);
      showToast.success("Dane klienta zostały zaktualizowane");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating customer:", error);
      showToast.error("Błąd podczas aktualizacji danych klienta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edytuj klienta</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Imię i nazwisko *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Wprowadź imię i nazwisko"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Wprowadź adres email"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="Wprowadź numer telefonu"
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notatki</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Dodatkowe informacje o kliencie"
              rows={3}
            />
            {errors.notes && (
              <p className="text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
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
      </DialogContent>
    </Dialog>
  );
}
