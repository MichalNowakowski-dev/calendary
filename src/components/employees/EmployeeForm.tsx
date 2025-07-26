"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Employee, Service } from "@/lib/types/database";

interface EmployeeWithDetails extends Employee {
  services: Service[];
  schedules: any[];
}

interface EmployeeFormProps {
  services: Service[];
  editingEmployee: EmployeeWithDetails | null;
  onSubmit: (formData: {
    name: string;
    visible: boolean;
    selectedServices: string[];
  }) => void;
  onCancel: () => void;
}

export default function EmployeeForm({
  services,
  editingEmployee,
  onSubmit,
  onCancel,
}: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    name: editingEmployee?.name || "",
    visible: editingEmployee?.visible ?? true,
    selectedServices: editingEmployee?.services.map((s) => s.id) || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingEmployee ? "Edytuj pracownika" : "Dodaj nowego pracownika"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Imię i nazwisko *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Jan Kowalski"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="visible"
              checked={formData.visible}
              onChange={(e) =>
                setFormData({ ...formData, visible: e.target.checked })
              }
              className="rounded"
            />
            <Label htmlFor="visible">Widoczny dla klientów</Label>
          </div>

          <div>
            <Label>Przypisane usługi</Label>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Wybierz usługi, które może świadczyć ten pracownik
            </p>
            <div className="mt-2 space-y-2">
              {services.map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`service-${service.id}`}
                    checked={formData.selectedServices.includes(service.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          selectedServices: [
                            ...formData.selectedServices,
                            service.id,
                          ],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          selectedServices: formData.selectedServices.filter(
                            (id) => id !== service.id
                          ),
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor={`service-${service.id}`}>
                    {service.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="submit">
              {editingEmployee ? "Zapisz zmiany" : "Dodaj pracownika"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Anuluj
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
